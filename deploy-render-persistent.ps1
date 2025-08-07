# Deploy Astradio Backend to Render - Persistent Deployment
# This will keep your backend running 24/7 for beta testing

Write-Host "🚀 Deploying Astradio Backend to Render for persistent operation..." -ForegroundColor Green

# Check if render.exe exists
if (-not (Test-Path "render.exe")) {
    Write-Host "❌ render.exe not found. Please download from https://render.com/docs/cli" -ForegroundColor Red
    Write-Host "📥 Download: https://render.com/docs/cli#installation" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Render CLI found" -ForegroundColor Green

# Check authentication
Write-Host "🔐 Checking authentication..." -ForegroundColor Yellow
try {
    $null = .\render.exe whoami 2>$null
    Write-Host "✅ Authenticated with Render" -ForegroundColor Green
} catch {
    Write-Host "❌ Not authenticated. Please run: .\render.exe login" -ForegroundColor Red
    Write-Host "🔑 Run: .\render.exe login" -ForegroundColor Yellow
    exit 1
}

# Check if service exists
Write-Host "🔍 Checking if astradio-api service exists..." -ForegroundColor Yellow
try {
    $serviceInfo = .\render.exe services list --format json | ConvertFrom-Json
    $existingService = $serviceInfo | Where-Object { $_.name -eq "astradio-api" }
    
    if ($existingService) {
        Write-Host "✅ Service 'astradio-api' found" -ForegroundColor Green
        Write-Host "🔄 Deploying updates..." -ForegroundColor Yellow
        .\render.exe services deploy astradio-api
    } else {
        Write-Host "📝 Service 'astradio-api' not found. Creating new service..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Manual Setup Required:" -ForegroundColor Cyan
        Write-Host "1. Go to https://render.com/dashboard" -ForegroundColor White
        Write-Host "2. Click 'New +' → 'Web Service'" -ForegroundColor White
        Write-Host "3. Connect your GitHub repository" -ForegroundColor White
        Write-Host "4. Set service name: astradio-api" -ForegroundColor White
        Write-Host "5. Set root directory: apps/api" -ForegroundColor White
        Write-Host "6. Set build command: npm install && npm run build" -ForegroundColor White
        Write-Host "7. Set start command: npm start" -ForegroundColor White
        Write-Host "8. Choose 'Free' plan (or paid for better performance)" -ForegroundColor White
        Write-Host "9. Click 'Create Web Service'" -ForegroundColor White
        Write-Host ""
        Write-Host "After creating the service, run this script again to deploy." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error checking services. Please ensure you're logged in." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Monitor your service:" -ForegroundColor Cyan
Write-Host "  .\render.exe services logs astradio-api" -ForegroundColor White
Write-Host "  .\render.exe services show astradio-api" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your API will be available at:" -ForegroundColor Cyan
Write-Host "  https://astradio-api.onrender.com" -ForegroundColor White
Write-Host ""
Write-Host "💡 The backend will now run 24/7 without needing to restart!" -ForegroundColor Green 