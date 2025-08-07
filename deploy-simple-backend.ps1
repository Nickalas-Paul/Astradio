Write-Host "🚀 Deploying Astradio Backend with New Infrastructure" -ForegroundColor Green

# Build backend
Write-Host "📦 Building backend..." -ForegroundColor Yellow
Set-Location "api-deployment"
npm install
npm run build
Set-Location ".."

# Deploy to Render
Write-Host "🚀 Deploying to Render..." -ForegroundColor Yellow
.\render.exe services deploy astradio-api

# Get service info
Write-Host "🔗 Getting service URL..." -ForegroundColor Yellow
$serviceInfo = .\render.exe services list --name astradio-api --format json | ConvertFrom-Json
if ($serviceInfo.service.url) {
    $serviceUrl = $serviceInfo.service.url
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Blue
    Write-Host "📊 Health Check: $serviceUrl/health" -ForegroundColor Blue
}

Write-Host "📋 Useful Commands:" -ForegroundColor Blue
Write-Host "  View logs: .\render.exe services logs astradio-api" -ForegroundColor White
Write-Host "  View status: .\render.exe services list --name astradio-api" -ForegroundColor White

Write-Host "🎉 Deployment completed!" -ForegroundColor Green 