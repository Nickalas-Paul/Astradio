# 🔧 Render Workspace Fix - Node 20 + pnpm

## Problem
Render was using **npm on Node 22** instead of **pnpm on Node 20**, causing `workspace:*` dependency failures.

## Solution Applied

### 1. Pin Node Version
- Added `.node-version` file with `20`
- Forces Render to use Node 20 regardless of service settings

### 2. Fix Service Configuration
- **Root Directory**: `.` (repo root for workspace visibility)
- **Build Command**: `corepack enable && pnpm install --frozen-lockfile && pnpm --filter api build`
- **Start Command**: `node apps/api/dist/app.js`

### 3. Automated Fix Script
```powershell
# One-time fix for existing services
.\scripts\render-update-service.ps1
```

## What This Fixes

### Before (Broken)
- Render used `npm ci && npm run build` on Node 22
- `workspace:*` dependencies failed to resolve
- Build failed with dependency errors

### After (Fixed)
- Render uses `pnpm install --frozen-lockfile` on Node 20
- `corepack enable` ensures pnpm is available
- `pnpm --filter api build` builds from workspace
- All dependencies resolve correctly

## Verification

### Build Logs Should Show
```
corepack enable
pnpm install --frozen-lockfile
pnpm --filter api build
```

### Health Check
```bash
curl -s https://astradio-api.onrender.com/health
# Should return: {"ok":true,"timestamp":"...","environment":"production"}
```

## Files Changed
- `.node-version` - Pin Node 20
- `render.yaml` - Updated for workspace build
- `scripts/render-update-service.ps1` - Automated fix script

## Next Steps
1. Run `.\scripts\render-update-service.ps1` (one-time)
2. Deploy with `.\scripts\deploy-render-api.ps1` (every time)
3. Set Vercel `NEXT_PUBLIC_API_URL` to Render URL

**Fixed and ready to deploy!** 🚀
