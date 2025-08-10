# Final Decoupled Deployment Script
# Deploys API to Render and Web to Vercel using their CLIs

Write-Host "🚀 Starting Decoupled Deployment" -ForegroundColor Green
Write-Host "📦 API → Render (Node service)" -ForegroundColor Cyan
Write-Host "🌐 Web → Vercel (SSR)" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check if Render CLI is available
$renderAvailable = Get-Command "render" -ErrorAction SilentlyContinue
if (-not $renderAvailable) {
    Write-Host "❌ Render CLI not found. Installing..." -ForegroundColor Red
    # Download and install Render CLI
    $renderUrl = "https://github.com/render-oss/render-cli/releases/latest/download/render-windows-amd64.exe"
    Invoke-WebRequest -Uri $renderUrl -OutFile "render.exe"
    Write-Host "✅ Render CLI downloaded" -ForegroundColor Green
}

# Check if Vercel CLI is available
$vercelAvailable = Get-Command "vercel" -ErrorAction SilentlyContinue
if (-not $vercelAvailable) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}

# Deploy API to Render
Write-Host "`n🎯 Deploying API to Render..." -ForegroundColor Yellow
Write-Host "Using render.yaml configuration with rootDir: apps/api" -ForegroundColor Cyan

try {
    if ($renderAvailable) {
        & render deploy --service-type=web --name="astradio-api" --root-dir="apps/api"
    } else {
        & .\render.exe deploy --service-type=web --name="astradio-api" --root-dir="apps/api"
    }
    Write-Host "✅ API deployed to Render successfully" -ForegroundColor Green
    $apiUrl = "https://astradio-api.onrender.com"
    Write-Host "🌐 API URL: $apiUrl" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to deploy API to Render: $_" -ForegroundColor Red
    Write-Host "📝 Manual steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. Create New Web Service" -ForegroundColor White
    Write-Host "   3. Connect your GitHub repo" -ForegroundColor White
    Write-Host "   4. Set Root Directory: apps/api" -ForegroundColor White
    Write-Host "   5. Set Build Command: npm ci; npm run build" -ForegroundColor White
    Write-Host "   6. Set Start Command: npm start" -ForegroundColor White
    $apiUrl = Read-Host "Enter your Render API URL (e.g., https://your-app.onrender.com)"
}

# Deploy Web to Vercel
Write-Host "`n🎯 Deploying Web to Vercel..." -ForegroundColor Yellow
Write-Host "Using apps/web as root directory" -ForegroundColor Cyan

try {
    Set-Location "apps/web"
    
    # Set environment variable for API URL
    $env:NEXT_PUBLIC_API_URL = $apiUrl
    
    # Deploy to Vercel
    vercel --prod --yes
    
    Set-Location "../.."
    Write-Host "✅ Web app deployed to Vercel successfully" -ForegroundColor Green
    
    $webUrl = "https://astradio-web.vercel.app"
    Write-Host "🌐 Web URL: $webUrl" -ForegroundColor Cyan
    
} catch {
    Set-Location "../.."
    Write-Host "❌ Failed to deploy Web to Vercel: $_" -ForegroundColor Red
    Write-Host "📝 Manual steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "   2. Import your GitHub repo" -ForegroundColor White
    Write-Host "   3. Set Root Directory: apps/web" -ForegroundColor White
    Write-Host "   4. Add Environment Variable:" -ForegroundColor White
    Write-Host "      NEXT_PUBLIC_API_URL = $apiUrl" -ForegroundColor White
    Write-Host "   5. Deploy" -ForegroundColor White
    $webUrl = Read-Host "Enter your Vercel Web URL (e.g., https://your-app.vercel.app)"
}

# Test deployment
Write-Host "`n🧪 Testing deployment..." -ForegroundColor Yellow

try {
    # Test API health
    Write-Host "Testing API health..." -ForegroundColor Cyan
    $healthResponse = Invoke-RestMethod -Uri "$apiUrl/health" -Method GET
    if ($healthResponse.ok) {
        Write-Host "✅ API health check passed" -ForegroundColor Green
        Write-Host "   Swiss Ephemeris: $($healthResponse.swiss_ephemeris)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ API health check failed" -ForegroundColor Red
    }
    
    # Test API genres endpoint
    Write-Host "Testing API genres endpoint..." -ForegroundColor Cyan
    $genresResponse = Invoke-RestMethod -Uri "$apiUrl/api/genres" -Method GET
    if ($genresResponse.genres) {
        Write-Host "✅ Genres endpoint working ($($genresResponse.genres.Count) genres)" -ForegroundColor Green
    } else {
        Write-Host "❌ Genres endpoint failed" -ForegroundColor Red
    }
    
    # Test daily chart endpoint
    Write-Host "Testing daily chart endpoint..." -ForegroundColor Cyan
    $today = Get-Date -Format "yyyy-MM-dd"
    $dailyResponse = Invoke-RestMethod -Uri "$apiUrl/api/daily/$today" -Method GET
    if ($dailyResponse.chart) {
        Write-Host "✅ Daily chart endpoint working" -ForegroundColor Green
        Write-Host "   Planets: $($dailyResponse.chart.planets.Count)" -ForegroundColor Cyan
        Write-Host "   Track ID: $($dailyResponse.track_id)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Daily chart endpoint failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ API testing failed: $_" -ForegroundColor Red
}

# Final summary
Write-Host "`n🎉 Deployment Summary" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "🔧 API (Render):  $apiUrl" -ForegroundColor Cyan
Write-Host "🌐 Web (Vercel):  $webUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test the complete flow:" -ForegroundColor Yellow
Write-Host "   1. Visit: $webUrl" -ForegroundColor White
Write-Host "   2. Check footer shows: 'Backend: Ready | Swiss Ephemeris: Connected'" -ForegroundColor White
Write-Host "   3. Press Play button to test audio generation" -ForegroundColor White
Write-Host "   4. Verify no CORS errors in browser console" -ForegroundColor White
Write-Host ""
Write-Host "📋 Manual verification checklist:" -ForegroundColor Yellow
Write-Host "   □ $apiUrl/health returns ok: true" -ForegroundColor White
Write-Host "   □ $apiUrl/api/genres returns genre list" -ForegroundColor White
Write-Host "   □ $webUrl loads without errors" -ForegroundColor White
Write-Host "   □ Play button triggers API calls successfully" -ForegroundColor White
Write-Host "   □ Audio starts playing" -ForegroundColor White
Write-Host ""
Write-Host "✅ Decoupled deployment complete!" -ForegroundColor Green
