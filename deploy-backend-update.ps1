Write-Host "🚀 Updating Astradio Backend with New Infrastructure" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan

# Step 1: Check Render CLI authentication
Write-Host "🔐 Checking Render CLI authentication..." -ForegroundColor Yellow
$whoami = .\render.exe whoami 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Authenticated with Render CLI" -ForegroundColor Green
} else {
    Write-Host "❌ Not authenticated. Please run: .\render.exe login" -ForegroundColor Red
    exit 1
}

# Step 2: Build backend with new infrastructure
Write-Host "📦 Building backend with new infrastructure..." -ForegroundColor Yellow
Set-Location "api-deployment"

# Install dependencies
Write-Host "  Installing dependencies..." -ForegroundColor Cyan
npm install

# Build the project
Write-Host "  Building TypeScript..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "✅ Backend built successfully" -ForegroundColor Green
Set-Location ".."

# Step 3: Deploy to existing Render service
Write-Host "🚀 Deploying to existing Render service..." -ForegroundColor Yellow

.\render.exe services deploy astradio-api
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployment initiated successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Backend deployment failed" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for deployment
Write-Host "⏳ Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan

# Poll deployment status
$maxAttempts = 20
$attempt = 0
$deploymentComplete = $false

while (-not $deploymentComplete -and $attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 10
    $attempt++
    
    $logs = .\render.exe services logs astradio-api --tail 3 2>$null
    if ($logs -match "Build completed|Deploy completed") {
        $deploymentComplete = $true
        Write-Host "✅ Backend deployment completed successfully!" -ForegroundColor Green
    } elseif ($logs -match "Failed|Error") {
        Write-Host "❌ Backend deployment failed" -ForegroundColor Red
        Write-Host "Check logs with: .\render.exe services logs astradio-api" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "⏳ Still deploying... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
    }
}

if (-not $deploymentComplete) {
    Write-Host "⚠️  Deployment timeout. Check status manually:" -ForegroundColor Yellow
    Write-Host "  .\render.exe services logs astradio-api" -ForegroundColor Cyan
}

# Step 5: Get service URL and test
Write-Host "🔗 Getting service URL..." -ForegroundColor Yellow
$serviceInfo = .\render.exe services list --name astradio-api --format json 2>$null | ConvertFrom-Json
if ($serviceInfo -and $serviceInfo.service -and $serviceInfo.service.url) {
    $serviceUrl = $serviceInfo.service.url
    Write-Host "✅ Backend updated successfully!" -ForegroundColor Green
    Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Blue
    Write-Host "📊 Health Check: $serviceUrl/health" -ForegroundColor Blue
    
    # Test the health endpoint
    Write-Host "🧪 Testing health endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "$serviceUrl/health" -Method Get -TimeoutSec 10
    if ($healthResponse.status -eq "OK") {
        Write-Host "✅ Backend health check passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend health check failed" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Could not retrieve service URL. Check Render dashboard." -ForegroundColor Yellow
}

# Step 6: Show useful commands
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Blue
Write-Host "  View logs:     .\render.exe services logs astradio-api" -ForegroundColor White
Write-Host "  View status:   .\render.exe services list --name astradio-api" -ForegroundColor White
Write-Host "  Open service:  .\render.exe services open astradio-api" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Backend update completed!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan 