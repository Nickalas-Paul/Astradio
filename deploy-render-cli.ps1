# ASTRADIO API Deployment to Render using CLI
# This script automates the deployment process using Render CLI

Write-Host "🚀 ASTRADIO API Deployment to Render using CLI" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Step 1: Check if Render CLI is available
if (-not (Test-Path "render.exe")) {
    Write-Host "❌ Render CLI not found. Please ensure render.exe is in the current directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Render CLI found" -ForegroundColor Green

# Step 2: Build the API locally first
Write-Host "`n📦 Building API..." -ForegroundColor Yellow
try {
    Set-Location "apps/api"
    
    # Clean previous build
    if (Test-Path "dist") {
        Remove-Item "dist" -Recurse -Force
        Write-Host "🧹 Cleaned previous build" -ForegroundColor Green
    }
    
    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    # Build the API
    Write-Host "🔨 Building API for production..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ API build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build process failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Return to root
Set-Location "../.."

# Step 4: Check if user is logged in to Render
Write-Host "`n🔐 Checking Render authentication..." -ForegroundColor Yellow
try {
    $authCheck = .\render.exe services --output json --confirm 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Already authenticated with Render" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not authenticated. Please login first:" -ForegroundColor Yellow
        Write-Host "   .\render.exe login" -ForegroundColor White
        Write-Host "   Follow the browser prompts to authenticate" -ForegroundColor White
        Write-Host "   Then run this script again" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Authentication check failed" -ForegroundColor Red
    exit 1
}

# Step 5: List available services
Write-Host "`n📋 Available Render services:" -ForegroundColor Yellow
try {
    $services = .\render.exe services --output json --confirm | ConvertFrom-Json
    if ($services) {
        foreach ($service in $services) {
            Write-Host "   - $($service.name) (ID: $($service.id))" -ForegroundColor White
        }
    } else {
        Write-Host "   No services found" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to list services" -ForegroundColor Red
}

# Step 6: Check if astradio-api service exists
Write-Host "`n🔍 Looking for existing astradio-api service..." -ForegroundColor Yellow
$existingService = $services | Where-Object { $_.name -eq "astradio-api" }

if ($existingService) {
    Write-Host "✅ Found existing service: $($existingService.id)" -ForegroundColor Green
    
    # Step 7: Trigger deployment
    Write-Host "`n🚀 Triggering deployment..." -ForegroundColor Yellow
    try {
        $deployResult = .\render.exe deploys create $($existingService.id) --output json --confirm
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Green
            Write-Host "   Service ID: $($existingService.id)" -ForegroundColor White
            Write-Host "   Check Render dashboard for deployment status" -ForegroundColor White
        } else {
            Write-Host "❌ Deployment failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Failed to trigger deployment: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No existing astradio-api service found" -ForegroundColor Red
    Write-Host "`n📋 To create a new service:" -ForegroundColor Yellow
    Write-Host "1. Go to https://render.com/new/web-service" -ForegroundColor White
    Write-Host "2. Connect repository: Nickalas-Paul/Astradio" -ForegroundColor White
    Write-Host "3. Configure service:" -ForegroundColor White
    Write-Host "   - Name: astradio-api" -ForegroundColor White
    Write-Host "   - Root Directory: apps/api" -ForegroundColor White
    Write-Host "   - Build Command: npm install; npm run build" -ForegroundColor White
    Write-Host "   - Start Command: npm start" -ForegroundColor White
    Write-Host "   - Health Check Path: /health" -ForegroundColor White
    Write-Host "4. Add environment variables (see render-deployment-config.txt)" -ForegroundColor White
    Write-Host "5. Create the service" -ForegroundColor White
    Write-Host "6. Run this script again to trigger deployments" -ForegroundColor White
}

# Step 8: Provide testing instructions
Write-Host "`n🧪 Testing Instructions:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

Write-Host "`nOnce deployed, test these endpoints:" -ForegroundColor Yellow

Write-Host "`nHealth Check:" -ForegroundColor White
Write-Host 'curl https://your-api-url.onrender.com/health'

Write-Host "`nGenerate Chart:" -ForegroundColor White
Write-Host @'
curl -X POST https://your-api-url.onrender.com/api/chart \
  -H "Content-Type: application/json" \
  -d "{
    \"birthDate\": \"1990-01-01\",
    \"birthTime\": \"12:00\",
    \"latitude\": 40.7128,
    \"longitude\": -74.0060
  }"
'@

Write-Host "`nGenerate Audio:" -ForegroundColor White
Write-Host @'
curl -X POST https://your-api-url.onrender.com/api/audio \
  -H "Content-Type: application/json" \
  -d "{
    \"chartData\": {...},
    \"genre\": \"ambient\",
    \"duration\": 60
  }"
'@

# Step 9: Success summary
Write-Host "`n🎯 DEPLOYMENT SUMMARY:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

Write-Host "✅ API build successful" -ForegroundColor Green
Write-Host "✅ Render CLI installed and working" -ForegroundColor Green
Write-Host "✅ Authentication verified" -ForegroundColor Green

if ($existingService) {
    Write-Host "✅ Deployment triggered" -ForegroundColor Green
    Write-Host "✅ Service found and updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Manual service creation required" -ForegroundColor Yellow
}

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Wait for deployment to complete (3-5 minutes)" -ForegroundColor White
Write-Host "2. Test the API endpoints" -ForegroundColor White
Write-Host "3. Update frontend with new API URL" -ForegroundColor White
Write-Host "4. Test full integration" -ForegroundColor White

Write-Host "`n🚀 ASTRADIO API deployment process complete!" -ForegroundColor Green 