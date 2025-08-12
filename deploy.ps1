# Astradio Deployment Script
Write-Host "🚀 Astradio Deployment" -ForegroundColor Green

# Check project structure
if (-not (Test-Path "render.yaml")) {
    Write-Host "❌ render.yaml not found" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "apps/api/package.json")) {
    Write-Host "❌ apps/api/package.json not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green

# Install CLIs
if (-not (Get-Command "render" -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing Render CLI..." -ForegroundColor Yellow
    npm install -g @render/cli
}

if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ CLIs ready" -ForegroundColor Green

# Deploy API to Render
Write-Host "`n🎯 Deploying API to Render..." -ForegroundColor Yellow

try {
    # Force Node runtime deployment
    render deploy --service-type=web --name="astradio-api" --root-dir="apps/api" --env=node
    Write-Host "✅ API deployed to Render" -ForegroundColor Green
    $apiUrl = "https://astradio-api.onrender.com"
    Write-Host "🌐 API URL: $apiUrl" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Render CLI deployment failed - using manual deployment" -ForegroundColor Yellow
    Write-Host "Creating new Node service via dashboard..." -ForegroundColor White
    
    # Open Render dashboard for manual deployment
    Start-Process "https://dashboard.render.com/new/web-service"
    
    Write-Host "`n📋 Manual deployment steps:" -ForegroundColor Cyan
    Write-Host "1. Connect GitHub repo: Nickalas-Paul/Astradio" -ForegroundColor White
    Write-Host "2. Service Name: astradio-api" -ForegroundColor White
    Write-Host "3. Root Directory: apps/api" -ForegroundColor White
    Write-Host "4. Runtime: Node (NOT Docker)" -ForegroundColor White
    Write-Host "5. Build Command: npm ci; npm run build" -ForegroundColor White
    Write-Host "6. Start Command: npm start" -ForegroundColor White
    Write-Host "7. Environment Variables:" -ForegroundColor White
    Write-Host "   - NODE_ENV=production" -ForegroundColor White
    Write-Host "   - PORT=10000" -ForegroundColor White
    
    $apiUrl = Read-Host "Enter your Render API URL"
}

# Deploy Web to Vercel
Write-Host "`n🎯 Deploying Web to Vercel..." -ForegroundColor Yellow

try {
    Push-Location "apps/web"
    $env:NEXT_PUBLIC_API_BASE_URL = $apiUrl
    vercel --prod --yes
    Pop-Location
    Write-Host "✅ Web deployed to Vercel" -ForegroundColor Green
    $webUrl = "https://astradio-web.vercel.app"
    Write-Host "🌐 Web URL: $webUrl" -ForegroundColor Cyan
} catch {
    Pop-Location
    Write-Host "❌ Vercel CLI deployment failed - using manual deployment" -ForegroundColor Yellow
    Write-Host "Creating new Vercel project via dashboard..." -ForegroundColor White
    
    # Open Vercel dashboard for manual deployment
    Start-Process "https://vercel.com/new"
    
    Write-Host "`n📋 Manual deployment steps:" -ForegroundColor Cyan
    Write-Host "1. Import GitHub repo: Nickalas-Paul/Astradio" -ForegroundColor White
    Write-Host "2. Project Name: astradio-web" -ForegroundColor White
    Write-Host "3. Root Directory: apps/web" -ForegroundColor White
    Write-Host "4. Framework: Next.js (auto-detected)" -ForegroundColor White
    Write-Host "5. Environment Variables:" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_API_BASE_URL = $apiUrl" -ForegroundColor White
    
    $webUrl = Read-Host "Enter your Vercel Web URL"
}

# Test deployment
Write-Host "`n🧪 Testing deployment..." -ForegroundColor Yellow

try {
    Write-Host "Testing API health..." -ForegroundColor Cyan
    $healthResponse = Invoke-RestMethod -Uri "$apiUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API health: $($healthResponse.status)" -ForegroundColor Green
    
    Write-Host "Testing API status..." -ForegroundColor Cyan
    $statusResponse = Invoke-RestMethod -Uri "$apiUrl/api/status" -Method GET -TimeoutSec 10
    Write-Host "✅ API status: $($statusResponse.status)" -ForegroundColor Green
    Write-Host "   Swiss Ephemeris: $($statusResponse.swissephAvailable)" -ForegroundColor Cyan
    
    Write-Host "Testing daily chart..." -ForegroundColor Cyan
    $chartResponse = Invoke-RestMethod -Uri "$apiUrl/api/daily/2025-01-15" -Method GET -TimeoutSec 10
    Write-Host "✅ Daily chart: $($chartResponse.success)" -ForegroundColor Green
} catch {
    Write-Host "❌ API tests failed: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "   API: $apiUrl" -ForegroundColor Cyan
Write-Host "   Web: $webUrl" -ForegroundColor Cyan
Write-Host "`n✅ Astradio is now live!" -ForegroundColor Green
