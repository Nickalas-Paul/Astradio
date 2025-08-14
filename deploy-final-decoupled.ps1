# Astradio Final Decoupled Deployment Script
# This script provides deployment instructions for the audio engine pipeline

Write-Host "🎵 Astradio Final Deployment - Audio Engine Pipeline" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Configuration
$FRONTEND_URL = "https://astradio.vercel.app"
$BACKEND_URL = "https://astradio-1.onrender.com"
$GITHUB_REPO = "Nickalas-Paul/Astradio"

Write-Host "`n📋 Deployment Configuration:" -ForegroundColor Yellow
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "Repository: $GITHUB_REPO" -ForegroundColor White

# Step 1: Verify current status
Write-Host "`n🔍 Step 1: Checking current deployment status..." -ForegroundColor Green

try {
    $backendHealth = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend is online and healthy" -ForegroundColor Green
    Write-Host "   Status: $($backendHealth.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This is expected if backend is not deployed yet" -ForegroundColor Yellow
}

# Step 2: Deploy Backend to Render
Write-Host "`n🚀 Step 2: Deploying Backend to Render..." -ForegroundColor Green

Write-Host "📝 Backend deployment instructions:" -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Create new Web Service" -ForegroundColor White
Write-Host "3. Connect GitHub repository: $GITHUB_REPO" -ForegroundColor White
Write-Host "4. Configure settings:" -ForegroundColor White
Write-Host "   - Name: astradio-1" -ForegroundColor White
Write-Host "   - Build Command: corepack enable; pnpm install --frozen-lockfile; pnpm --filter api build" -ForegroundColor White
Write-Host "   - Start Command: node apps/api/dist/app.js" -ForegroundColor White
Write-Host "   - Environment: Node" -ForegroundColor White

# Step 3: Deploy Frontend to Vercel
Write-Host "`n🌐 Step 3: Deploying Frontend to Vercel..." -ForegroundColor Green

Write-Host "📝 Frontend deployment instructions:" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Import project from GitHub: $GITHUB_REPO" -ForegroundColor White
Write-Host "3. Configure settings:" -ForegroundColor White
Write-Host "   - Framework Preset: Next.js" -ForegroundColor White
Write-Host "   - Root Directory: apps/web" -ForegroundColor White
Write-Host "   - Build Command: pnpm install --frozen-lockfile; pnpm --filter web build" -ForegroundColor White
Write-Host "   - Output Directory: .next" -ForegroundColor White

# Step 4: Test Audio Pipeline
Write-Host "`n🎵 Step 4: Testing Audio Pipeline..." -ForegroundColor Green

Write-Host "📝 Audio pipeline test instructions:" -ForegroundColor Yellow
Write-Host "1. Wait for both deployments to complete" -ForegroundColor White
Write-Host "2. Test backend API endpoints:" -ForegroundColor White
Write-Host "   - Health: $BACKEND_URL/health" -ForegroundColor White
Write-Host "   - Daily Chart: POST $BACKEND_URL/api/daily" -ForegroundColor White
Write-Host "   - Genres: GET $BACKEND_URL/api/genres" -ForegroundColor White
Write-Host "3. Test frontend integration:" -ForegroundColor White
Write-Host "   - Visit: $FRONTEND_URL" -ForegroundColor White
Write-Host "   - Check browser console for API calls" -ForegroundColor White

# Step 5: Final verification checklist
Write-Host "`n📋 Step 5: Final Verification Checklist" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "`n🔧 Backend (Render) Checklist:" -ForegroundColor Yellow
Write-Host "□ Service is deployed and running" -ForegroundColor White
Write-Host "□ Health endpoint responds: $BACKEND_URL/health" -ForegroundColor White
Write-Host "□ Daily chart endpoint works: POST $BACKEND_URL/api/daily" -ForegroundColor White
Write-Host "□ Genres endpoint works: GET $BACKEND_URL/api/genres" -ForegroundColor White
Write-Host "□ CORS is configured for frontend domain" -ForegroundColor White

Write-Host "`n🌐 Frontend (Vercel) Checklist:" -ForegroundColor Yellow
Write-Host "□ Service is deployed and running" -ForegroundColor White
Write-Host "□ Page loads without errors: $FRONTEND_URL" -ForegroundColor White
Write-Host "□ API calls to backend work" -ForegroundColor White
Write-Host "□ Audio generation triggers on page load" -ForegroundColor White
Write-Host "□ No console errors in browser" -ForegroundColor White

Write-Host "`n🎵 Audio Pipeline Checklist:" -ForegroundColor Yellow
Write-Host "□ Astrological data is calculated correctly" -ForegroundColor White
Write-Host "□ Music parameters are generated from chart data" -ForegroundColor White
Write-Host "□ Audio files are created and served" -ForegroundColor White
Write-Host "□ Client receives and plays audio" -ForegroundColor White
Write-Host "□ Different genres produce different audio" -ForegroundColor White

Write-Host "`n🚀 Deployment Summary:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor White
Write-Host "Test Script: test-audio-pipeline.ps1" -ForegroundColor White

Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy backend to Render using the instructions above" -ForegroundColor White
Write-Host "2. Deploy frontend to Vercel using the instructions above" -ForegroundColor White
Write-Host "3. Run: .\test-audio-pipeline.ps1" -ForegroundColor White
Write-Host "4. Visit $FRONTEND_URL to test the complete audio pipeline" -ForegroundColor White

Write-Host "`n🎉 Your astrological audio engine will be live and functioning!" -ForegroundColor Green
