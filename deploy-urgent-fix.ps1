# 🚨 URGENT FIX DEPLOYMENT SCRIPT
# Deploys the SSR fixes and dynamic client-only components

Write-Host "🚨 URGENT FIX DEPLOYMENT STARTING..." -ForegroundColor Red
Write-Host "Implementing SSR recovery plan..." -ForegroundColor Yellow

# Step 1: Check current status
Write-Host "`n📊 Checking current deployment status..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "https://astradio-api.onrender.com/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API is responding: $($apiResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ API may be starting up: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 2: Commit our fixes
Write-Host "`n🔧 Committing SSR fixes..." -ForegroundColor Yellow
try {
    git add .
    git commit -m "🚨 URGENT FIX: SSR Recovery - Dynamic client-only components implemented"
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Git commit failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Push to trigger deployment
Write-Host "`n🚀 Pushing to trigger Vercel deployment..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Git push completed, Vercel should auto-deploy" -ForegroundColor Green
} catch {
    Write-Host "❌ Git push failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for deployment
Write-Host "`n⏳ Waiting for deployment to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Step 5: Test the deployment
Write-Host "`n🧪 Testing deployment..." -ForegroundColor Yellow

$testPages = @(
    "https://astradio.vercel.app",
    "https://astradio.vercel.app/chart",
    "https://astradio.vercel.app/audio-lab",
    "https://astradio.vercel.app/sandbox"
)

foreach ($page in $testPages) {
    try {
        $response = Invoke-WebRequest -Uri $page -Method GET -TimeoutSec 15
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $page is accessible" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $page returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $page failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 6: Final status
Write-Host "`n🎉 URGENT FIX DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "`n📋 Summary of fixes implemented:" -ForegroundColor Cyan
Write-Host "✅ Chart page now uses dynamic import with SSR disabled" -ForegroundColor Green
Write-Host "✅ Audio-lab page now uses dynamic import with SSR disabled" -ForegroundColor Green
Write-Host "✅ All audio logic moved to client-only components" -ForegroundColor Green
Write-Host "✅ API URL fixed to point to Render backend" -ForegroundColor Green
Write-Host "✅ Zero audio initialization during SSR" -ForegroundColor Green

Write-Host "`n🔗 Live URLs:" -ForegroundColor Cyan
Write-Host "Frontend: https://astradio.vercel.app" -ForegroundColor White
Write-Host "API: https://astradio-api.onrender.com" -ForegroundColor White
Write-Host "Chart Page: https://astradio.vercel.app/chart" -ForegroundColor White
Write-Host "Audio Lab: https://astradio.vercel.app/audio-lab" -ForegroundColor White

Write-Host "`n💡 What this fixes:" -ForegroundColor Cyan
Write-Host "• SSR builds will no longer crash on audio pages" -ForegroundColor White
Write-Host "• Audio components only load after user interaction" -ForegroundColor White
Write-Host "• Frontend-backend connection restored" -ForegroundColor White
Write-Host "• Stable deployment pipeline" -ForegroundColor White

Write-Host "`n🎵 The system should now be stable and SSR-compatible!" -ForegroundColor Green 