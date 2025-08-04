# Render Deployment Script for Astradio API
# This script deploys the Astradio API to Render

Write-Host "🚀 DEPLOYING ASTRADIO TO RENDER..." -ForegroundColor Green
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

# Step 3: Check if render.yaml exists
Write-Host "📋 Checking Render configuration..." -ForegroundColor Yellow
cd ../..
if (Test-Path "render.yaml") {
    Write-Host "✅ render.yaml found" -ForegroundColor Green
} else {
    Write-Host "❌ render.yaml not found!" -ForegroundColor Red
    exit 1
}

# Step 4: Check Git status
Write-Host "🔍 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ Uncommitted changes detected:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor White
    Write-Host ""
    $response = Read-Host "Do you want to commit these changes before deploying? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        git add .
        git commit -m "Deploy to Render - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
}

# Step 5: Check if Render CLI is available
Write-Host "🚂 Checking Render CLI..." -ForegroundColor Yellow
$renderVersion = render --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Render CLI found: $renderVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️ Render CLI not found" -ForegroundColor Yellow
    Write-Host "You can deploy manually by:" -ForegroundColor White
    Write-Host "   1. Go to https://render.com" -ForegroundColor White
    Write-Host "   2. Connect your GitHub repository" -ForegroundColor White
    Write-Host "   3. Create a new Web Service" -ForegroundColor White
    Write-Host "   4. Set Root Directory: apps/api" -ForegroundColor White
    Write-Host "   5. Set Build Command: npm install && npm run build" -ForegroundColor White
    Write-Host "   6. Set Start Command: npm start" -ForegroundColor White
    Write-Host "   7. Add environment variables from render.yaml" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install Render CLI: npm install -g @render/cli" -ForegroundColor White
    exit 0
}

# Step 6: Deploy to Render
Write-Host "🚀 Deploying to Render..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor White

# Check if we're logged in to Render
$loginStatus = render whoami 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Logged in to Render as: $loginStatus" -ForegroundColor Green
} else {
    Write-Host "⚠️ Not logged in to Render" -ForegroundColor Yellow
    Write-Host "Please run: render login" -ForegroundColor White
    exit 1
}

# Deploy using render.yaml
render deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Astradio API is now live on Render!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Check your Render dashboard for the deployment URL" -ForegroundColor White
    Write-Host "   2. Test the health endpoint: https://your-app.onrender.com/health" -ForegroundColor White
    Write-Host "   3. Test chart generation: https://your-app.onrender.com/api/charts/generate" -ForegroundColor White
    Write-Host "   4. Test audio generation: https://your-app.onrender.com/api/audio/sandbox" -ForegroundColor White
    Write-Host ""
    Write-Host "🎵 Astradio is now live and ready for users!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check your Render project settings" -ForegroundColor White
    Write-Host "   2. Verify environment variables are set" -ForegroundColor White
    Write-Host "   3. Check the Render logs for specific errors" -ForegroundColor White
    Write-Host "   4. Try deploying manually through the Render dashboard" -ForegroundColor White
    exit 1
} 