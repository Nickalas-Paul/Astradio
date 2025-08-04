# Final Railway Deployment Script - READY TO DEPLOY
# This script deploys the Astradio API to Railway

Write-Host "🚀 DEPLOYING ASTRADIO TO RAILWAY..." -ForegroundColor Green
Write-Host ""

# Step 1: Verify we're in the right directory
Write-Host "📍 Checking current directory..." -ForegroundColor Yellow
if (Test-Path "apps/api") {
    Write-Host "✅ Found apps/api directory" -ForegroundColor Green
} else {
    Write-Host "❌ apps/api directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the Astradio root directory" -ForegroundColor Red
    exit 1
}

# Step 2: Final build verification
Write-Host "🔧 Final build verification..." -ForegroundColor Yellow
cd apps/api
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Cannot deploy." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 3: Check Railway CLI
Write-Host "🚂 Checking Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Railway CLI found: $railwayVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Railway CLI not found!" -ForegroundColor Red
    Write-Host "Please install Railway CLI: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

# Step 4: Railway login check
Write-Host "🔐 Checking Railway login status..." -ForegroundColor Yellow
$loginStatus = railway whoami 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Logged in as: $loginStatus" -ForegroundColor Green
} else {
    Write-Host "⚠️ Not logged in to Railway" -ForegroundColor Yellow
    Write-Host "Running: railway login" -ForegroundColor White
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Railway login failed!" -ForegroundColor Red
        exit 1
    }
}

# Step 5: Link to Railway project
Write-Host "🔗 Linking to Railway project..." -ForegroundColor Yellow
$linkStatus = railway link 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Project linked successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️ Project not linked, attempting to link..." -ForegroundColor Yellow
    railway link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project!" -ForegroundColor Red
        Write-Host "Please create a Railway project first or check your connection" -ForegroundColor Red
        exit 1
    }
}

# Step 6: Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor White
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Astradio API is now live on Railway!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Check your Railway dashboard for the deployment URL" -ForegroundColor White
    Write-Host "   2. Test the health endpoint: https://your-app.railway.app/health" -ForegroundColor White
    Write-Host "   3. Test chart generation: https://your-app.railway.app/api/charts/generate" -ForegroundColor White
    Write-Host "   4. Test audio generation: https://your-app.railway.app/api/audio/sandbox" -ForegroundColor White
    Write-Host ""
    Write-Host "🎵 Astradio is now live and ready for users!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check your Railway project settings" -ForegroundColor White
    Write-Host "   2. Verify environment variables are set" -ForegroundColor White
    Write-Host "   3. Check the Railway logs for specific errors" -ForegroundColor White
    exit 1
} 