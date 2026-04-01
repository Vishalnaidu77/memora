# How to Implement Topic Clustering Using DBSCAN

This guide explains how topic clustering works in [`backend/src/service/topic.service.js`](/c:/Users/ADmin/Documents/Memora2/backend/src/service/topic.service.js) and how you can build the same feature yourself.

The goal is simple:

- Take all saved items for one user
- Compare their embedding vectors
- Group similar items into topic clusters
- Save the cluster id and topic label back to MongoDB

If you are new to clustering, do not worry. We will go from concept to code step by step.

## What problem are we solving?

In this project, every saved item can have:

- a title
- tags
- an embedding vector

An embedding is a list of numbers that represents the meaning of the content. If two items talk about similar things, their vectors should be close to each other.

Topic clustering uses those vectors to answer a question like:

"Which saved items belong to the same topic?"

Examples:

- articles about JavaScript testing
- notes about startup ideas
- saved links about machine learning

Instead of manually grouping items, we let DBSCAN find groups automatically.

## Why use DBSCAN?

DBSCAN is a clustering algorithm that is useful when:

- you do not know in advance how many clusters exist
- some items may not belong to any cluster
- you want to mark outliers as noise

That matches this use case very well.

In this code:

- `DBSCAN_EPS = 0.28`
- `DBSCAN_MIN_POINTS = 2`

This means:

- two points are considered close if their distance is `<= 0.28`
- a group needs at least `2` nearby points to become a cluster

If an item does not fit into any group, DBSCAN treats it as noise.

## High-level flow

The full flow in [`backend/src/service/topic.service.js`](/c:/Users/ADmin/Documents/Memora2/backend/src/service/topic.service.js) looks like this:

1. Fetch all stored vectors for one user from Qdrant
2. Clean and normalize those vectors
3. Run DBSCAN with cosine distance
4. Build cluster objects
5. Generate a label for each cluster
6. Update MongoDB items with `topicClusterId` and `topicLabel`
7. Clear cluster data for items that are noise

The route that triggers this is [`clusterTopicsController`](/c:/Users/ADmin/Documents/Memora2/backend/src/controllers/item.controller.js), which calls:

```js
const cluster = await clusterUserTopics(userId)
```

## Step 1: Store embeddings first

Clustering only works if each item already has an embedding vector.

That starts earlier in the save flow:

- [`processWithAi`](/c:/Users/ADmin/Documents/Memora2/backend/src/controllers/item.controller.js) generates embeddings with `generateEmbedding(...)`
- the vector is stored in Qdrant using `storeVector(...)`
- the payload also stores useful metadata like:
  - `mongoId`
  - `userId`
  - `title`
  - `tags`
  - `description`
  - `contentType`

This is important because later the clustering service needs:

- the vector for similarity comparison
- the `mongoId` to update the matching MongoDB item
- title and tags to generate a readable topic label

## Step 2: Fetch all vectors for one user

The clustering service starts here:

```js
const rawPoints = await getUserVectors(userId)
```

[`getUserVectors`](/c:/Users/ADmin/Documents/Memora2/backend/src/service/qdrant.service.js) reads all points for the current user from Qdrant using `scroll`.

Each point looks roughly like this:

```js
{
  id: "qdrant-point-id",
  vector: [0.12, -0.03, ...],
  payload: {
    mongoId: "mongodb-item-id",
    userId: "user-id",
    title: "Learn DBSCAN",
    tags: ["machine learning", "clustering"]
  }
}
```

## Step 3: Prepare the points

Raw vector data should be validated before clustering. That is what `preparePoints(points)` does.

It keeps only points that have:

- a valid `mongoId`
- a valid vector
- a vector that can be normalized

### Why normalize vectors?

The code uses:

```js
function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))

  if (!magnitude) {
    return null
  }

  return vector.map(value => value / magnitude)
}
```

Normalization converts a vector into unit length. This matters because later we use cosine similarity. With normalized vectors, cosine similarity becomes more stable and easier to compare.

If a vector has zero magnitude, the code returns `null`, because a zero vector cannot be normalized safely.

## Step 4: Measure similarity with cosine distance

The code defines:

```js
function cosineSimilarity(left, right) {
  let score = 0

  for (let index = 0; index < left.length; index++) {
    score += left[index] * right[index]
  }

  return score
}

function cosineDistance(left, right) {
  return 1 - cosineSimilarity(left, right)
}
```

### What does this mean?

- cosine similarity close to `1` means vectors are very similar
- cosine similarity close to `0` means they are unrelated
- cosine distance converts similarity into a distance value

Why convert it?

Because DBSCAN expects a distance function, not a similarity function.

So:

- very similar items -> small distance
- very different items -> large distance

## Step 5: Run DBSCAN

This happens inside `buildDbscanClusters(points)`:

```js
const dataset = points.map(point => point.normalizedVector)
const dbscan = new Clustering.DBSCAN()
const clusterIndexes = dbscan.run(
  dataset,
  DBSCAN_EPS,
  DBSCAN_MIN_POINTS,
  cosineDistance
)
```

### What each argument means

- `dataset`: the normalized vectors
- `DBSCAN_EPS`: maximum distance between nearby points
- `DBSCAN_MIN_POINTS`: minimum nearby points needed for a cluster
- `cosineDistance`: custom distance function

The result from `dbscan.run(...)` is not the final cluster objects yet. It returns index groups, for example:

```js
[
  [0, 3, 5],
  [1, 2]
]
```

That means:

- points `0, 3, 5` belong to cluster 1
- points `1, 2` belong to cluster 2

The code then converts those indexes back into real point objects:

```js
const clusters = clusterIndexes.map(indexes =>
  indexes.map(index => points[index])
)
```

## Step 6: Handle noise items

One big advantage of DBSCAN is that it can detect noise.

In this code:

```js
const unclusteredItemIds = (dbscan.noise || [])
  .map(index => points[index]?.mongoId)
  .filter(Boolean)
```

These are items that do not belong to any dense group.

Later, the service removes their cluster fields from MongoDB so they do not show outdated topic data.

## Step 7: Build readable cluster objects

After clustering, the code creates a cleaner response shape:

```js
{
  clusterId: "topic-1",
  topicLabel: "Machine Learning",
  itemIds: [...],
  count: 4
}
```

This happens inside:

```js
const clusters = await Promise.all(groupedPoints.map(async (clusterPoints, index) => {
  const aiLabel = await generateTopicLabel(clusterPoints)

  return {
    clusterId: `topic-${index + 1}`,
    topicLabel: aiLabel || buildFallbackClusterLabel(clusterPoints),
    itemIds: clusterPoints.map(point => point.mongoId),
    count: clusterPoints.length,
  }
}))
```

### Why generate labels?

DBSCAN only groups vectors. It does not know human-readable names like:

- `Frontend Testing`
- `Startup Ideas`
- `AI Tools`

So this project uses AI to suggest a short topic label from item titles and tags.

## Step 8: Add a fallback label

AI can fail sometimes, so the service includes `buildFallbackClusterLabel(points)`.

It tries to label the cluster in this order:

1. Find the most common tag in the cluster
2. If no tag exists, use the first few words of the first title
3. If nothing is available, use `"General"`

This is a very good beginner-friendly pattern:

- try smart labeling first
- keep a safe fallback
- never leave the label empty

## Step 9: Save the result to MongoDB

Before saving new cluster data, the service clears old cluster values for the user:

```js
await itemModel.updateMany(
  { userId },
  { $unset: { topicClusterId: "", topicLabel: "" } }
)
```

This prevents old cluster assignments from staying in the database after reclustering.

Then each cluster is written back to the matching items:

```js
await itemModel.updateMany(
  { _id: { $in: cluster.itemIds } },
  {
    $set: {
      topicClusterId: cluster.clusterId,
      topicLabel: cluster.topicLabel
    }
  }
)
```

Finally, noise items also have their cluster fields removed.

## Step 10: Return the clusters

At the end, `clusterUserTopics(userId)` returns the cluster list.

That result is sent by [`clusterTopicsController`](/c:/Users/ADmin/Documents/Memora2/backend/src/controllers/item.controller.js) in the API response.

This means the frontend can show topic groups immediately after clustering.

## Beginner-friendly implementation template

If you want to build the same feature in your own project, the implementation plan is:

1. Generate embeddings for every item you save
2. Store vectors in a vector database like Qdrant
3. Keep a reference to the MongoDB item id in the vector payload
4. Fetch all vectors for one user
5. Normalize vectors
6. Run DBSCAN with cosine distance
7. Convert DBSCAN index groups back into actual items
8. Generate a readable topic label
9. Save `topicClusterId` and `topicLabel` on each item
10. Remove cluster data from noise items

## Minimal example

This example is a simplified version of the same idea:

```js
import Clustering from "density-clustering"

const DBSCAN_EPS = 0.28
const DBSCAN_MIN_POINTS = 2

function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
  if (!magnitude) return null
  return vector.map(value => value / magnitude)
}

function cosineSimilarity(a, b) {
  let score = 0
  for (let i = 0; i < a.length; i++) {
    score += a[i] * b[i]
  }
  return score
}

function cosineDistance(a, b) {
  return 1 - cosineSimilarity(a, b)
}

function clusterTopics(rawPoints) {
  const points = rawPoints
    .map(point => {
      const normalizedVector = normalizeVector(point.vector)
      if (!point.mongoId || !normalizedVector) return null
      return { ...point, normalizedVector }
    })
    .filter(Boolean)

  const dataset = points.map(point => point.normalizedVector)
  const dbscan = new Clustering.DBSCAN()

  const clusterIndexes = dbscan.run(
    dataset,
    DBSCAN_EPS,
    DBSCAN_MIN_POINTS,
    cosineDistance
  )

  const clusters = clusterIndexes.map((indexes, clusterIndex) => ({
    clusterId: `topic-${clusterIndex + 1}`,
    itemIds: indexes.map(index => points[index].mongoId)
  }))

  const noiseItemIds = (dbscan.noise || []).map(index => points[index].mongoId)

  return { clusters, noiseItemIds }
}
```

## How to tune DBSCAN

The hardest part of DBSCAN is choosing good values for `eps` and `minPoints`.

### `eps`

`eps` controls how close two vectors must be to count as neighbors.

- smaller `eps`: stricter clustering, more noise
- larger `eps`: looser clustering, bigger clusters

In this code, `0.28` is the starting value. That might work well for your embeddings, but not always.

### `minPoints`

`minPoints` controls how many nearby points are needed to form a cluster.

- `2` is good if you want even small pairs to become a topic
- higher values create fewer but stronger clusters

### Practical tuning advice

Start with:

- `eps = 0.2` to `0.35`
- `minPoints = 2` or `3`

Then test with real user data and ask:

- Are similar items clustering together?
- Are too many items marked as noise?
- Are unrelated items getting merged?

## Common mistakes to avoid

### 1. Skipping normalization

If you use cosine distance, normalize vectors first.

### 2. Forgetting the item id in vector payload

Without `mongoId`, you cannot map the cluster result back to MongoDB items.

### 3. Reusing old cluster values

Always clear old topic fields before writing new ones.

### 4. Using labels without fallback

If AI labeling fails, your cluster should still get a readable name.

### 5. Clustering too few points

This service checks:

```js
if (points.length < DBSCAN_MIN_POINTS) {
  await itemModel.updateMany(
    { userId },
    { $unset: { topicClusterId: "", topicLabel: "" } }
  )
  return []
}
```

That protects the feature from creating invalid clusters when the user has too little data.

## How this project's implementation is structured

Here is the responsibility split:

- [`backend/src/controllers/item.controller.js`](/c:/Users/ADmin/Documents/Memora2/backend/src/controllers/item.controller.js)
  Handles the API request and calls `clusterUserTopics(userId)`.
- [`backend/src/service/topic.service.js`](/c:/Users/ADmin/Documents/Memora2/backend/src/service/topic.service.js)
  Contains the clustering logic.
- [`backend/src/service/qdrant.service.js`](/c:/Users/ADmin/Documents/Memora2/backend/src/service/qdrant.service.js)
  Fetches vectors from Qdrant.
- [`backend/src/service/ai.service.js`](/c:/Users/ADmin/Documents/Memora2/backend/src/service/ai.service.js)
  Generates embeddings, tags, and topic labels.

This is a clean pattern to follow in your own app:

- controller for request/response
- service for clustering logic
- vector service for storage/search
- AI service for enrichment

## Final takeaway

To implement topic clustering with DBSCAN:

- embed your content
- normalize the vectors
- compare vectors with cosine distance
- run DBSCAN
- mark noise separately
- write the cluster results back to your main database

That is exactly what this project does, and it is a solid beginner-friendly architecture because each step has one clear responsibility.
