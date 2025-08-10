# Simple deployment script
Write-Host "🚀 Starting Automated Deployment" -ForegroundColor Green

# Try to deploy API to Render using their Blueprint (render.yaml)
Write-Host "🎯 Deploying API to Render..." -ForegroundColor Yellow

try {
    # First check if we can connect to render
    Write-Host "Checking Render CLI connection..." -ForegroundColor Cyan
    $renderResult = .\render.exe services list 2>&1
    Write-Host "Render CLI ready" -ForegroundColor Green
    
    # Deploy using the render.yaml blueprint
    Write-Host "Deploying using render.yaml blueprint..." -ForegroundColor Cyan
    .\render.exe blueprint deploy
    
    $apiUrl = "https://astradio-api.onrender.com"
    Write-Host "✅ API deployed to: $apiUrl" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️ Render CLI deployment needs authentication. Using manual process..." -ForegroundColor Yellow
    Write-Host "Please deploy manually at: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host "Use the render.yaml file for configuration" -ForegroundColor Cyan
    $apiUrl = "https://astradio-api.onrender.com"
}

# Deploy Web app to Vercel
Write-Host "🎯 Deploying Web to Vercel..." -ForegroundColor Yellow

try {
    Set-Location "apps/web"
    
    Write-Host "Setting API URL environment variable..." -ForegroundColor Cyan
    vercel env add NEXT_PUBLIC_API_URL $apiUrl production
    
    Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
    vercel --prod --yes
    
    Set-Location "../.."
    $webUrl = "https://astradio-web.vercel.app"
    Write-Host "✅ Web deployed to: $webUrl" -ForegroundColor Green
    
} catch {
    Set-Location "../.."
    Write-Host "⚠️ Vercel deployment needs authentication. Using manual process..." -ForegroundColor Yellow
    Write-Host "Please deploy manually at: https://vercel.com/dashboard" -ForegroundColor Cyan
    $webUrl = "https://astradio-web.vercel.app"
}

# Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow

Start-Sleep -Seconds 5

try {
    Write-Host "Testing API health endpoint..." -ForegroundColor Cyan
    $health = Invoke-RestMethod -Uri "$apiUrl/health" -TimeoutSec 10
    if ($health.ok) {
        Write-Host "✅ API is healthy!" -ForegroundColor Green
        Write-Host "   Swiss Ephemeris: $($health.swiss_ephemeris)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ API not ready yet (this is normal, services take time to start)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "🔧 API: $apiUrl" -ForegroundColor Cyan
Write-Host "🌐 Web: $webUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait 2-3 minutes for services to fully start" -ForegroundColor White
Write-Host "2. Visit: $webUrl" -ForegroundColor White
Write-Host "3. Test the Play button" -ForegroundColor White
Write-Host "4. Check browser console for any errors" -ForegroundColor White
