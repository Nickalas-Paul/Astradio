# 🚀 Astradio Automated Deployment - Ready to Ship!

## ✅ Phase 2 Complete: Zero-Prompt Render + Vercel Deployment

### 🎯 What's Ready
- **API**: Render with automated deployment via API
- **Web**: Vercel with environment configuration
- **Deployment**: One PowerShell script, zero prompts
- **Configuration**: All production-safe settings applied

---

## 🔧 One-Time Setup (Only Once)

### 1. Get Render API Token
```powershell
# Run setup helper
.\scripts\setup-render-token.ps1
```

Then:
1. Go to https://render.com → Account Settings → API Keys
2. Create API Key and copy the token
3. Set environment variable:
```powershell
[Environment]::SetEnvironmentVariable("RENDER_API_KEY","<YOUR_TOKEN>","User")
$env:RENDER_API_KEY = "<YOUR_TOKEN>"
```

### 2. Create Render Service (Only Once)
1. Go to https://render.com → "New +" → "Web Service"
2. Connect GitHub repo: `https://github.com/Nickalas-Paul/Astradio`
3. Render auto-detects `render.yaml` configuration
4. Set Environment Variables:
   - `NODE_VERSION`: `20`
   - `WEB_ORIGIN`: `https://astradio-web.vercel.app,https://astradio.io`

---

## 🚀 Every Deployment (Zero Prompts)

### 1. Push Changes
```powershell
git add .
git commit -m "Your update message"
git push origin master
```

### 2. Deploy API (Automated)
```powershell
.\scripts\deploy-render-api.ps1
```

**What happens:**
- ✅ Finds `astradio-api` service
- ✅ Triggers deploy with cache clear
- ✅ Polls until status is `live`
- ✅ Outputs API URL and health check
- ✅ Zero prompts, zero manual steps

### 3. Deploy Web (Vercel)
```powershell
# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://astradio-api.onrender.com

# Then deploy (auto-deploy on push, or manual):
vercel --prod
```

---

## 📊 Status & Monitoring

### Check Service Status
```powershell
.\scripts\status-render-api.ps1
```

### Health Checks
```powershell
# API Health
curl -s https://astradio-api.onrender.com/health

# Today's Ephemeris
curl -s https://astradio-api.onrender.com/api/ephemeris/today

# Audio Generation
curl -s -X POST https://astradio-api.onrender.com/api/audio/generate \
  -H 'content-type: application/json' \
  -d '{"mode":"personal","chartA":{"date":"2025-01-15","time":"12:00","lat":40.7128,"lon":-74.0060,"tz":"America/New_York"}}'
```

---

## 🎯 Success Criteria

- [ ] API responds to `/health` with 200
- [ ] `/api/ephemeris/today` returns planetary data
- [ ] `/api/audio/generate` returns `audioId`
- [ ] Vercel site loads without CORS errors
- [ ] Landing page auto-plays or shows one-tap start
- [ ] Network panel shows successful API calls

---

## 📁 Files Created

- `scripts/deploy-render-api.ps1` - Main deployment script
- `scripts/status-render-api.ps1` - Status checker
- `scripts/setup-render-token.ps1` - Setup helper
- `DEPLOYMENT-RUNBOOK.md` - Complete documentation
- `render.yaml` - Render configuration
- `apps/api/src/app.ts` - CORS & PORT fixes

---

## 🔒 Production Configuration

### API (Render)
- **Port**: `process.env.PORT || 3001`
- **CORS**: `WEB_ORIGIN` env var (comma-separated)
- **Node**: 20
- **Build**: `pnpm install --frozen-lockfile && pnpm --filter api build`
- **Start**: `node dist/app.js`

### Web (Vercel)
- **API URL**: `NEXT_PUBLIC_API_URL` env var
- **Auto-deploy**: On push to master
- **Node**: 20

---

## 🎉 Ready to Deploy!

**Next Steps:**
1. Set up Render API token (one-time)
2. Create Render service (one-time)
3. Deploy with `.\scripts\deploy-render-api.ps1` (every time)

**No more manual dashboard clicks, no more prompts, no more broken scripts!** 🚀
