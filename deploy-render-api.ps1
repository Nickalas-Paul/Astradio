# Astradio Render API Deployment Script
# Phase 2: Streamlined deployment

Write-Host "🚀 Astradio Render API Deployment" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "`n✅ Changes committed and pushed to master branch" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://render.com" -ForegroundColor Cyan
Write-Host "2. Click 'New +' -> 'Web Service'" -ForegroundColor Cyan
Write-Host "3. Connect GitHub repo: https://github.com/Nickalas-Paul/Astradio" -ForegroundColor Cyan
Write-Host "4. Render will auto-detect render.yaml configuration" -ForegroundColor Cyan

Write-Host "`n⚙️  Render Configuration (auto-detected):" -ForegroundColor Yellow
Write-Host "   Name: astradio-api" -ForegroundColor White
Write-Host "   Root Directory: apps/api" -ForegroundColor White
Write-Host "   Build Command: pnpm install --frozen-lockfile; pnpm --filter api build" -ForegroundColor White
Write-Host "   Start Command: node dist/app.js" -ForegroundColor White
Write-Host "   Node Version: 20" -ForegroundColor White

Write-Host "`n🔧 Environment Variables to set in Render:" -ForegroundColor Yellow
Write-Host "   NODE_VERSION: 20" -ForegroundColor White
Write-Host "   WEB_ORIGIN: https://astradio-web.vercel.app,https://astradio.io" -ForegroundColor White

Write-Host "`n📝 After Render deployment:" -ForegroundColor Yellow
Write-Host "1. Note the API URL (e.g., https://astradio-api.onrender.com)" -ForegroundColor Cyan
Write-Host "2. Set NEXT_PUBLIC_API_URL in Vercel to the Render URL" -ForegroundColor Cyan
Write-Host "3. Deploy web app to Vercel" -ForegroundColor Cyan

Write-Host "`n🧪 Smoke Tests (after deployment):" -ForegroundColor Yellow
Write-Host "curl -s https://astradio-api.onrender.com/health" -ForegroundColor Gray
Write-Host "curl -s https://astradio-api.onrender.com/api/ephemeris/today" -ForegroundColor Gray

Write-Host "`n📖 Full runbook: DEPLOYMENT-RUNBOOK.md" -ForegroundColor Green
Write-Host "`n🎯 Ready to deploy! 🚀" -ForegroundColor Green
