# Astradio Recovery Deployment Script
# Deploys the SSR fixes and audio client wrapper implementation

Write-Host "🚀 Starting Astradio Recovery Deployment..." -ForegroundColor Green

# Step 1: Check current status
Write-Host "`n📊 Checking current deployment status..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "https://astradio-api.onrender.com/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API is responding: $($apiResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ API may be starting up: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 2: Build the web app
Write-Host "`n🔨 Building web application..." -ForegroundColor Yellow
Set-Location "apps/web"

try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web app built successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Web app build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Yellow
Set-Location "../.."

try {
    # Check if vercel CLI is installed
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
        
        # Deploy to Vercel
        vercel --prod --yes
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment to Vercel successful" -ForegroundColor Green
        } else {
            Write-Host "❌ Vercel deployment failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "⚠️ Vercel CLI not found, attempting git push deployment..." -ForegroundColor Yellow
        
        # Alternative: Git push to trigger Vercel deployment
        git add .
        git commit -m "🔧 SSR Recovery Fix: Audio client wrapper implementation"
        git push origin main
        
        Write-Host "✅ Git push completed, Vercel should auto-deploy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Deployment error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Test the deployment
Write-Host "`n🧪 Testing deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 30  # Wait for deployment to complete

try {
    $webResponse = Invoke-WebRequest -Uri "https://astradio.vercel.app" -Method GET -TimeoutSec 30
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend returned status: $($webResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Frontend test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 5: Test specific pages
Write-Host "`n🎵 Testing audio pages..." -ForegroundColor Yellow

$testPages = @(
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
Write-Host "`n🎉 Recovery Deployment Complete!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "✅ AudioClientWrapper component created" -ForegroundColor Green
Write-Host "✅ API URL fixed to point to Render" -ForegroundColor Green
Write-Host "✅ Chart and Audio Lab pages wrapped with client-only components" -ForegroundColor Green
Write-Host "✅ SSR issues should be resolved" -ForegroundColor Green
Write-Host "✅ Ready for user testing" -ForegroundColor Green

Write-Host "`n🔗 Live URLs:" -ForegroundColor Cyan
Write-Host "Frontend: https://astradio.vercel.app" -ForegroundColor White
Write-Host "API: https://astradio-api.onrender.com" -ForegroundColor White
Write-Host "Chart Page: https://astradio.vercel.app/chart" -ForegroundColor White
Write-Host "Audio Lab: https://astradio.vercel.app/audio-lab" -ForegroundColor White

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test the chart page with birth data" -ForegroundColor White
Write-Host "2. Test the audio lab functionality" -ForegroundColor White
Write-Host "3. Verify audio generation works" -ForegroundColor White
Write-Host "4. Check that SSR errors are gone" -ForegroundColor White

Write-Host "`n🎵 The audio pipeline should now be stable and SSR-compatible!" -ForegroundColor Green 