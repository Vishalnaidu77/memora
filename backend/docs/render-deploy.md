# Deploy Backend on Render

## 1) Push this repository to GitHub
Render pulls from your GitHub repo, so make sure current changes are committed and pushed.

## 2) Create the Render service
1. Open Render dashboard.
2. Click New + > Blueprint.
3. Select this repository.
4. Render will detect render.yaml at repo root and create memora-backend.

## 3) Configure required environment variables
Set these in Render service Environment:
- CORS_ORIGINS
- MONGO_URI
- JWT_SECRET
- GEMINI_API_KEY
- QDRANT_URL
- QDRANT_API_KEY
- REDIS_HOST
- REDIS_PORT
- REDIS_PASSWORD
- SUPABASE_URL
- SUPABASE_SERVICE_KEY

Optional variables already have defaults in code:
- ITEM_PROCESSING_STALE_MS
- BULLMQ_PREFIX
- BULLMQ_COMPLETED_TTL_SECONDS
- BULLMQ_COMPLETED_MAX_COUNT
- BULLMQ_FAILED_TTL_SECONDS
- BULLMQ_FAILED_MAX_COUNT
- BULLMQ_CLEAN_COMPLETED_GRACE_MS
- BULLMQ_CLEAN_FAILED_GRACE_MS
- BULLMQ_CLEAN_BATCH_SIZE
- BULLMQ_MAINTENANCE_INTERVAL_MS

## 4) Set frontend origin for CORS
Use a comma-separated list in CORS_ORIGINS, for example:
https://your-frontend-domain.com,http://localhost:3000

Chrome extension traffic is still allowed by prefix and does not need to be added.

## 5) Verify deployment
After deploy succeeds:
- Check health endpoint: /health
- Confirm API routes respond, for example /api/auth

## 6) Worker note
This repository also has a worker script: npm run worker.
If background item processing is needed in production, create a second Render Background Worker service using rootDir backend and start command npm run worker.
