# Item Ingestion Roadmap

This document explains how to add three backend capabilities to Memora in a way that fits the current codebase:

1. Highlight system
2. Queue workers
3. Duplicate detection when the same item is saved twice

The goal is not just to "add features", but to reshape the item ingestion flow so the save endpoint stays fast and the expensive AI work becomes safer and easier to scale.

## Current Flow

Today the main save path lives in `backend/src/controllers/item.controller.js` inside `saveItemController`.

Current sequence:

1. Accept URL or uploaded file
2. Fetch metadata if URL
3. Upload file if present
4. Extract OCR/PDF text if needed
5. Create Mongo item
6. Run `processWithAi(...)`
7. Generate tags and embeddings
8. Store vector in Qdrant

This works for small traffic, but it has a few limits:

- the request is doing too much synchronous work
- duplicate checks are weak or missing
- highlights do not have a clear place in the pipeline
- retries are hard because work is tied to the request lifecycle

## Recommended Target Architecture

Move to this shape:

1. Normalize incoming content
2. Compute duplicate fingerprints
3. Reject or merge duplicates early
4. Save item with `status: "queued"`
5. Push background jobs for enrichment
6. Worker generates tags, embeddings, highlights, and graph metadata
7. Worker marks item as `ready` or `failed`

This gives you:

- faster save responses
- safer retries
- clearer observability
- room for future enrichment steps

## Feature 1: Duplicate Detection

### What problem to solve

If a user saves the same URL twice, uploads the same file twice, or pastes nearly identical content twice, Memora should detect it before doing expensive AI work.

### What to learn first

- exact duplicate detection
- fuzzy duplicate detection
- hashing and fingerprinting
- database unique indexes
- semantic duplicate detection using embeddings

### Best practical approach for Memora

Use a two-layer duplicate system:

1. Exact duplicate guard
2. Similarity-based duplicate guard

### Layer A: exact duplicate guard

Add normalized fingerprint fields to the item model in `backend/src/models/item.model.js`.

Suggested fields:

```js
sourceFingerprint: String,
contentFingerprint: String,
status: {
  type: String,
  enum: ["queued", "processing", "ready", "failed"],
  default: "queued"
},
duplicateOf: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "items",
  default: null
}
```

Use them like this:

- `sourceFingerprint`: for normalized URL or uploaded file checksum
- `contentFingerprint`: for normalized text body/title/description hash

Examples:

- URL item: hash of canonical URL
- file item: hash of file bytes
- extracted content item: hash of cleaned text

### How to implement exact duplicate checks

Before `itemModel.create(...)`:

1. Canonicalize input
2. Build fingerprints
3. Query Mongo for existing item by `userId + sourceFingerprint`
4. If found, return existing item instead of creating a new one

For content duplicates:

1. Clean text
2. Hash cleaned text
3. Query by `userId + contentFingerprint`
4. If found, either:
   - reject with "already saved"
   - return existing item
   - create a linked duplicate record with `duplicateOf`

### Recommended canonicalization rules

For URLs:

- lowercase hostname
- remove trailing slash
- remove tracking params like `utm_*`
- sort remaining query params

For text:

- lowercase
- trim whitespace
- collapse repeated spaces
- optionally remove punctuation for fingerprinting only

For files:

- compute SHA-256 from raw file buffer

### Layer B: semantic duplicate guard

Exact hashes catch exact matches, but not near-duplicates.

For example:

- same article from different URL params
- saved article and pasted article text
- same PDF renamed with a different filename

Use embeddings for this:

1. Generate embedding for normalized text
2. Search Qdrant only within the same user
3. If top score is above a high threshold, flag as possible duplicate

Suggested thresholds to experiment with:

- `>= 0.97`: likely duplicate
- `0.90 - 0.97`: possible near-duplicate
- `< 0.90`: probably distinct

Do not auto-delete here. Start with:

- mark `duplicateCandidateOf`
- store `duplicateScore`
- let UI show "This looks similar to an existing item"

### Good rollout order

1. Exact URL duplicate detection
2. File checksum duplicate detection
3. Content hash duplicate detection
4. Semantic duplicate warnings

## Feature 2: Queue Workers

### What problem to solve

Right now the request path handles:

- metadata fetch
- OCR/PDF extraction
- tag generation
- embedding generation
- vector storage

This increases latency and makes failures painful.

### What to learn first

- job queues
- producers and consumers
- idempotent jobs
- retry and dead-letter patterns
- optimistic job state transitions

### Recommended queue design for Memora

Split work into two stages:

1. Save-stage request
2. Enrichment worker

Request stage should only:

- validate input
- upload file if required
- extract lightweight metadata
- detect duplicates
- create item as `queued`
- enqueue job

Worker stage should:

- fetch item
- mark `status = "processing"`
- generate tags
- generate embedding
- store vector
- generate highlights
- mark `status = "ready"`

### Suggested queue options

For Node + Mongo + your current stack, good learning options are:

- BullMQ with Redis
- Bee-Queue
- simple Mongo-backed jobs collection if you want to learn the pattern first

If your goal is real production readiness, use BullMQ.

### Suggested job payload

```js
{
  itemId: "mongo-id",
  userId: "mongo-user-id",
  jobType: "enrich-item",
  requestedAt: Date.now()
}
```

Keep job payloads small. The worker should load fresh item data from Mongo.

### Worker rules that matter

Make jobs idempotent:

- if a job runs twice, it should not corrupt data
- if `chromaId` already exists, skip re-upsert unless content changed
- if tags already exist and input fingerprint did not change, skip regenerate

### Schema additions for observability

Add fields like:

```js
processingStatus: {
  type: String,
  enum: ["queued", "processing", "ready", "failed"],
  default: "queued"
},
processingError: String,
lastProcessedAt: Date,
aiFingerprint: String
```

This helps the frontend show progress and lets you retry failures safely.

### Suggested code split

Create service modules like:

- `backend/src/service/duplicate.service.js`
- `backend/src/service/highlight.service.js`
- `backend/src/service/queue.service.js`
- `backend/src/workers/item.worker.js`

Then trim `saveItemController` so it mostly orchestrates.

### Worker pipeline

Recommended order inside worker:

1. Load item
2. Skip if missing or already ready with same fingerprint
3. Build canonical text
4. Generate tags
5. Generate highlights
6. Generate embedding
7. Upsert vector
8. Save final state

Why highlights before embeddings can still work:

- highlights need content understanding
- embeddings need normalized text
- both can share the same canonical text payload

## Feature 3: Highlight System

### What problem to solve

Highlights should give the user quick memory anchors from saved content:

- important sentences
- key facts
- quoted fragments
- summary bullets

### What to learn first

- extractive summarization
- abstractive summarization
- chunking long documents
- storing document spans
- confidence and provenance

### Best practical first version

Start with extractive highlights, not full freeform summaries.

Why:

- easier to trust
- easier to store
- easier to show in UI
- better for article/PDF recall use cases

### Highlight data model

Add a field to item model:

```js
highlights: [
  {
    text: String,
    sourceType: {
      type: String,
      enum: ["sentence", "quote", "generated"],
      default: "sentence"
    },
    score: Number,
    startOffset: Number,
    endOffset: Number
  }
]
```

You can keep offsets optional at first.

### Good first implementation path

Version 1:

- split extracted text into sentences
- rank sentences by simple heuristics
- optionally ask LLM to choose the best 3-5
- store them as highlights

Version 2:

- chunk long documents
- run LLM or embedding ranking per chunk
- store offsets and chunk ids

Version 3:

- support user-created manual highlights
- merge manual and AI highlights

### Simple ranking heuristics before LLM

Good signals:

- sentence length in a healthy range
- overlap with title words
- overlap with generated tags
- position near the beginning of the document
- presence of named entities or numbers

This gives you a cheap pre-filter before AI selection.

### Suggested highlight generation flow

1. Build canonical text from title + description + extracted content
2. Split into sentences
3. Remove very short or noisy sentences
4. Rank candidate sentences
5. Keep top 15 candidates
6. Ask LLM to choose best 3-5 highlights from candidates
7. Store them on item

### Prompt strategy

Ask the model to return structured JSON only:

```js
[
  {
    "text": "highlight sentence",
    "sourceType": "sentence",
    "score": 0.92
  }
]
```

Prefer short, highly scannable results.

### Where highlight generation belongs

Put it in the worker, not in the request handler.

Reason:

- long PDFs and OCR content can be heavy
- generation may fail or need retry
- it should not block the save response

## Proposed New Save Pipeline

Recommended end-to-end flow:

1. Receive URL or file
2. Build canonical source metadata
3. Compute duplicate fingerprints
4. Check exact duplicates
5. Save item with `processingStatus: "queued"`
6. Enqueue enrichment job
7. Return response immediately
8. Worker processes tags, highlights, embeddings, and vector storage
9. Frontend polls or refetches item until `ready`

## Suggested File-Level Refactor

### `backend/src/controllers/item.controller.js`

Keep controller thin:

- validate
- upload
- dedupe
- create
- enqueue
- respond

### `backend/src/service/duplicate.service.js`

Responsibilities:

- canonical URL builder
- text normalization
- source/content hash generation
- duplicate lookup helpers
- semantic duplicate search helper

### `backend/src/service/highlight.service.js`

Responsibilities:

- canonical text builder
- sentence splitting
- ranking
- optional AI selection
- return final structured highlights

### `backend/src/service/queue.service.js`

Responsibilities:

- initialize queue
- enqueue item enrichment jobs
- configure retry policy

### `backend/src/workers/item.worker.js`

Responsibilities:

- consume job
- transition status
- call tags/highlights/embedding services
- persist results
- handle retries and failures

## Learning Path

If you want to learn this properly instead of copying code blindly, do it in this order:

1. Learn canonicalization and hashing
2. Add exact duplicate detection
3. Add item processing states to Mongo
4. Move AI enrichment into a worker queue
5. Add highlight generation
6. Add semantic duplicate warnings
7. Add retry and observability

This order is important because queue workers make highlight generation and semantic duplicate checks much safer to add.

## Suggested Milestones

### Milestone 1: duplicate-safe saving

Deliver:

- URL canonicalization
- file checksum
- `sourceFingerprint`
- duplicate query before save

Success criteria:

- same URL cannot be saved twice by same user
- same file cannot be saved twice by same user

### Milestone 2: async enrichment

Deliver:

- `processingStatus`
- queue producer
- worker consumer
- request returns before AI completes

Success criteria:

- save endpoint stays responsive
- failed enrichment can retry

### Milestone 3: AI highlights

Deliver:

- `highlights` field
- highlight service
- worker integration

Success criteria:

- each processed item has 3-5 useful highlight snippets

### Milestone 4: semantic duplicate warnings

Deliver:

- duplicate score
- candidate duplicate item id
- frontend warning

Success criteria:

- near-duplicate items are surfaced without blocking valid saves

## Risks To Watch

- hashing raw text before normalization will miss duplicates
- aggressive duplicate rejection can block legitimate saves
- queue jobs without idempotency will duplicate vectors or tags
- highlight prompts without JSON constraints will be unstable
- long OCR text can exceed model limits without chunking

## Recommended Next Step In This Repo

If you implement only one thing first, start with exact duplicate detection.

Reason:

- easiest to test
- highest immediate product value
- reduces wasted AI calls
- prepares the ground for queue-based enrichment

After that, move `processWithAi(...)` out of the request path and into a worker.

That gives you the best foundation for highlights.
