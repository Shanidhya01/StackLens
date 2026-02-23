# StackLens Vercel Deployment Guide

Deploy each service as a **separate Vercel project** from its own folder.

## 1) Projects to create in Vercel

Create these 6 projects:

1. `frontend` (Root Directory: `frontend`)
2. `gateway` (Root Directory: `gateway`)
3. `crawler-service` (Root Directory: `services/crawler-service`)
4. `detection-service` (Root Directory: `services/detection-service`)
5. `performance-service` (Root Directory: `services/performance-service`)
6. `report-service` (Root Directory: `services/report-service`)

## 2) Build/runtime setup

- Frontend:
  - Framework preset: Next.js (auto-detected)
- All backend services:
  - Framework preset: Other
  - `vercel.json` is already added and routes all requests to `src/server.ts`.

## 3) Environment variables

### `gateway` project

Set these variables in Vercel for the gateway project:

- `MONGO_URI` = your MongoDB Atlas connection string
- `CRAWLER_URL` = deployed crawler URL (example: `https://crawler-service.vercel.app`)
- `DETECTION_URL` = deployed detection URL
- `PERFORMANCE_URL` = deployed performance URL
- `REPORT_URL` = deployed report URL

### `frontend` project

Set these variables in Vercel for frontend:

- `NEXT_PUBLIC_API_URL` = deployed gateway URL (example: `https://gateway.vercel.app`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_APP_ID`
- `NEXT_PUBLIC_STORAGE_BUCKET`

### Other backend services

No required env vars by default unless you add custom config.

## 4) Deploy order

1. Deploy: `crawler-service`, `detection-service`, `performance-service`, `report-service`
2. Copy their URLs and set gateway env vars
3. Deploy `gateway`
4. Set `NEXT_PUBLIC_API_URL` to gateway URL
5. Deploy `frontend`

## 5) Important notes

- Vercel serverless functions are stateless and can cold-start.
- The crawler service uses Puppeteer and Lighthouse; this can be heavy in serverless environments depending on limits.
- If crawler timeouts happen, keep crawler on a non-serverless host and only keep the other services on Vercel.

## 6) Quick verification

Check these endpoints after deployment:

- `https://<gateway-domain>/health`
- `https://<crawler-domain>/health`
- `https://<detection-domain>/health`
- `https://<performance-domain>/health`
- `https://<report-domain>/health`

Then run one scan from the frontend UI.
