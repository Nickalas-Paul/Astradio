# Astradio One-Command Deployment
# Run this script to deploy everything automatically

Write-Host "🚀 Astradio One-Command Deployment" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Run the simple deployment script
if (Test-Path "deploy-simple.ps1") {
    Write-Host "Running simple deployment..." -ForegroundColor Cyan
    & .\deploy-simple.ps1
} else {
    Write-Host "Simple deployment script not found. Running basic deployment..." -ForegroundColor Yellow
    
    # Basic deployment steps
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    
    Write-Host "Building applications..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "Building Docker image..." -ForegroundColor Cyan
    docker build -t astradio-api .
    
    Write-Host "✅ Deployment ready!" -ForegroundColor Green
    Write-Host "Push to main branch to deploy automatically." -ForegroundColor Cyan
} 