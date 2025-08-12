# Astradio Deployment Runbook - Phase 2

## Overview
Deploy the streamlined Astradio app: **Render API** + **Vercel Web** with minimal configuration.

## Pre-Deployment Checklist ✅

### API Changes Made
- ✅ CORS updated to use `WEB_ORIGIN` env var (comma-separated)
- ✅ PORT binding: `process.env.PORT || 3001`
- ✅ `render.yaml` configured for pnpm workspace
- ✅ Package.json main/start scripts updated

### Web Changes Made  
- ✅ `NEXT_PUBLIC_API_URL` ready for Render URL
- ✅ Environment example updated

## Step 1: Deploy API to Render

### 1.1 Push to Main Branch
```bash
git add .
git commit -m "Phase 2: Streamlined Render + Vercel deployment"
git push origin main
```

### 1.2 Create Render Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` configuration:
   - **Name**: `astradio-api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter api build`
   - **Start Command**: `node dist/app.js`
   - **Node Version**: 20

### 1.3 Configure Environment Variables
In Render dashboard → Environment:
- `NODE_VERSION`: `20`
- `WEB_ORIGIN`: `https://astradio-web.vercel.app,https://astradio.io` (comma-separated)

### 1.4 Deploy and Get API URL
- Deploy will start automatically
- Note the **public URL**: `https://astradio-api.onrender.com`

## Step 2: Deploy Web to Vercel

### 2.1 Configure Vercel Environment
In Vercel project settings → Environment Variables:
- `NEXT_PUBLIC_API_URL`: `https://astradio-api.onrender.com`

### 2.2 Deploy Web App
```bash
# From apps/web directory
vercel --prod
```

Or push to main branch if auto-deploy is enabled.

## Step 3: Production Smoke Tests

### 3.1 API Health Check
```bash
curl -s https://astradio-api.onrender.com/health
```
**Expected**: `{"ok":true,"timestamp":"...","environment":"production"}`

### 3.2 Today's Ephemeris
```bash
curl -s https://astradio-api.onrender.com/api/ephemeris/today | jq .
```
**Expected**: Today's planetary positions

### 3.3 Audio Generation
```bash
curl -s -X POST https://astradio-api.onrender.com/api/audio/generate \
  -H 'content-type: application/json' \
  -d '{"mode":"personal","chartA":{"date":"2025-01-15","time":"12:00","lat":40.7128,"lon":-74.0060,"tz":"America/New_York"}}'
```
**Expected**: `{"success":true,"audioId":"audio_...","status":"ready"}`

### 3.4 Audio Streaming
```bash
# Replace <audioId> with actual ID from previous response
curl -L https://astradio-api.onrender.com/api/audio/stream/<audioId> -o test.wav
```
**Expected**: Downloadable WAV file

### 3.5 Frontend Integration
1. Open Vercel site: `https://astradio-web.vercel.app`
2. Landing page should auto-play or show one-tap start
3. Check Network panel for successful API calls

## Final URLs

- **API**: `https://astradio-api.onrender.com`
- **Web**: `https://astradio-web.vercel.app`
- **Health**: `https://astradio-api.onrender.com/health`

## Troubleshooting

### If API Build Fails
- Check Render logs for pnpm/TypeScript errors
- Verify `apps/api/tsconfig.json` exists
- Ensure all dependencies are in `package.json`

### If CORS Errors
- Verify `WEB_ORIGIN` includes exact Vercel URL
- Check browser console for CORS policy errors

### If Audio Generation Fails
- Check Swiss Ephemeris availability in health endpoint
- Verify audio routes are properly mounted

## Success Criteria ✅

- [ ] API responds to `/health` with 200
- [ ] `/api/ephemeris/today` returns planetary data
- [ ] `/api/audio/generate` returns `audioId`
- [ ] `/api/audio/stream/:id` serves WAV file
- [ ] Vercel site loads without CORS errors
- [ ] Landing page auto-plays or shows one-tap start
- [ ] Network panel shows successful API calls

---

**Deployment Complete** 🚀
