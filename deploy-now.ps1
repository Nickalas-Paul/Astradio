# deploy-now.ps1 - Foolproof deployment script
# This script will deploy your API to Render RIGHT NOW

Write-Host "🚀 DEPLOYING ASTRADIO API TO RENDER NOW" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if we have the required environment variables
if (-not $env:RENDER_API_KEY) {
    Write-Host "❌ ERROR: RENDER_API_KEY environment variable not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:RENDER_API_KEY = 'your_token_here'" -ForegroundColor Yellow
    exit 1
}

if (-not $env:RENDER_SERVICE_NAME) {
    $env:RENDER_SERVICE_NAME = "Astradio-1"
    Write-Host "ℹ️  Using default service name: Astradio-1" -ForegroundColor Yellow
}

Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host "🔑 API Key: $($env:RENDER_API_KEY.Substring(0,8))..." -ForegroundColor Cyan
Write-Host "🏷️  Service: $env:RENDER_SERVICE_NAME" -ForegroundColor Cyan

# Deploy using the Node.js script
Write-Host "`n🎯 Starting deployment..." -ForegroundColor Yellow
try {
    node scripts/renderDeploy.js
    Write-Host "`n✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
} catch {
    Write-Host "`n❌ DEPLOYMENT FAILED: $_" -ForegroundColor Red
    exit 1
}
