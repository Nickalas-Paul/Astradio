# Astradio Deployment Guide

This guide provides **exact** instructions for deploying the Astradio monorepo to Render (API) and Vercel (Web) without Docker dependencies.

## Architecture Overview

- **Backend API**: `apps/api` → Node.js runtime on Render
- **Frontend Web**: `apps/web` → Next.js on Vercel
- **No Docker**: Uses `render.yaml` to force Node runtime
- **No localhost**: Environment-driven API URLs

## Prerequisites

- GitHub repository with latest changes pushed
- Render account
- Vercel account
- API must build successfully with `npm ci && npm run build`

## Render (API Backend)

### Step 1: Create New Service

**CRITICAL**: If you have an existing Docker-based service, **DELETE IT FIRST**. Docker services cannot be converted to Node services.

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `Astradio` repository

### Step 2: Service Configuration

Render will automatically detect the `render.yaml` file. Verify these settings:

- **Name**: `astradio-api`
- **Runtime**: `Node` (NOT Docker)
- **Root Directory**: `apps/api`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Node Version**: `18`

### Step 3: Environment Variables

Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone the repository
   - Change to `apps/api` directory
   - Run `npm ci && npm run build`
   - Start with `npm start` (which runs `dist/app-production.js`)

### Step 5: Verify API

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-service-name.onrender.com/health

# Status check (should show Swiss Ephemeris availability)
curl https://your-service-name.onrender.com/api/status

# Daily chart test
curl https://your-service-name.onrender.com/api/daily/2025-01-15

# Genres
curl https://your-service-name.onrender.com/api/genres
```

## Vercel (Web Frontend)

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import from GitHub: select `Astradio` repository
4. **Configure Project**:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: `Next.js` (auto-detected)
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `.next` (auto-detected)

### Step 2: Environment Variables

Add this environment variable in Vercel:

```
NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

Replace `your-render-service` with your actual Render service name.

### Step 3: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Clone the repository
   - Change to `apps/web` directory
   - Run `npm ci && npm run build`
   - Deploy the `.next` build

### Step 4: Verify Web App

1. Open your Vercel URL
2. Check browser console for API calls
3. Verify it's calling your Render API URL (not localhost)
4. Test daily chart generation functionality

## Troubleshooting

### Render Issues

**"Failed to read dockerfile"**
- **Cause**: Service is still set to Docker runtime
- **Fix**: Delete the service and recreate as Node runtime

**"Module not found"**
- **Cause**: Dependencies not installed or wrong directory
- **Fix**: Verify `apps/api/package.json` exists and build command is `npm ci && npm run build`

**"Swiss Ephemeris errors"**
- **Expected**: The API will run in fallback mode without native Swiss Ephemeris
- **Check**: `/api/status` should show `"swissephAvailable": false`

### Vercel Issues

**"Build failed"**
- **Cause**: Wrong root directory or missing dependencies
- **Fix**: Ensure root directory is `apps/web` and `apps/web/package.json` exists

**"API calls failing"**
- **Cause**: `NEXT_PUBLIC_API_BASE_URL` not set or incorrect
- **Fix**: Set environment variable to your Render URL

**"CORS errors"**
- **Expected**: API includes CORS for `*.vercel.app` domains
- **Check**: Ensure your Vercel domain matches the CORS pattern

## Acceptance Tests

After both deployments are complete:

### API Tests
```bash
# Replace with your actual Render URL
API_URL="https://your-service.onrender.com"

# Health check
curl $API_URL/health

# Should return: {"status":"ok","env":"production","port":10000,"timestamp":"..."}

# Status check
curl $API_URL/api/status

# Should return: {"swissephAvailable":false,"status":"operational","version":"1.0.0","timestamp":"..."}

# Daily chart
curl $API_URL/api/daily/2025-01-15

# Should return: {"success":true,"data":{"date":"2025-01-15","chart":{...},"events":[...],"metadata":{...}}}

# Genres
curl $API_URL/api/genres

# Should return: {"success":true,"data":["ambient","techno","world","hiphop"]}
```

### Web Tests

1. Open your Vercel URL
2. Open browser dev tools → Network tab
3. Interact with the daily chart feature
4. Verify API calls go to your Render URL (not localhost)
5. Check console for any errors

## Service URLs

After deployment, you'll have:

- **API**: `https://your-render-service.onrender.com`
- **Web**: `https://your-vercel-project.vercel.app`

## Post-Deployment

1. **No further configuration needed** - the apps are deployment-ready
2. **Scaling**: Both services auto-scale based on traffic
3. **Monitoring**: Use Render and Vercel dashboards for logs and metrics
4. **Updates**: Push to GitHub to trigger automatic redeployments

## Notes

- **Swiss Ephemeris**: Runs in fallback mode on cloud platforms (expected)
- **CORS**: Automatically configured for Vercel domains
- **Environment**: Uses production optimizations
- **No Docker**: Explicitly avoided to prevent deployment issues
