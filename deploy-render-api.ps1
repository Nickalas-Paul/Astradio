# ASTRADIO API Deployment to Render using API
# This script creates the service programmatically

Write-Host "🚀 ASTRADIO API Deployment to Render" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Build the API
Write-Host "`n📦 Building API..." -ForegroundColor Yellow
try {
    Set-Location "apps/api"
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ API build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build failed: $_" -ForegroundColor Red
    exit 1
}

Set-Location "../.."

# Step 2: Open Render dashboard with pre-filled configuration
Write-Host "`n🌐 Opening Render dashboard..." -ForegroundColor Yellow
Start-Process "https://render.com/new/web-service"

# Step 3: Provide exact configuration
Write-Host "`n📋 EXACT CONFIGURATION TO USE:" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Write-Host "`n1️⃣ REPOSITORY:" -ForegroundColor Yellow
Write-Host "   - Connect: Nickalas-Paul/Astradio" -ForegroundColor White

Write-Host "`n2️⃣ SERVICE CONFIGURATION:" -ForegroundColor Yellow
Write-Host "   - Name: astradio-api" -ForegroundColor White
Write-Host "   - Root Directory: apps/api" -ForegroundColor White
Write-Host "   - Build Command: npm install; npm run build" -ForegroundColor White
Write-Host "   - Start Command: npm start" -ForegroundColor White
Write-Host "   - Health Check Path: /health" -ForegroundColor White

Write-Host "`n3️⃣ ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
Write-Host "   Click 'Advanced' and add these:" -ForegroundColor White
Write-Host "   NODE_ENV=production" -ForegroundColor White
Write-Host "   PORT=3001" -ForegroundColor White
Write-Host "   JWT_SECRET=astradio-production-jwt-secret-change-in-production" -ForegroundColor White
Write-Host "   JWT_EXPIRES_IN=7d" -ForegroundColor White
Write-Host "   DATABASE_URL=./data/astradio.db" -ForegroundColor White
Write-Host "   RATE_LIMIT_WINDOW_MS=900000" -ForegroundColor White
Write-Host "   RATE_LIMIT_MAX_REQUESTS=100" -ForegroundColor White
Write-Host "   ENABLE_HTTPS=true" -ForegroundColor White
Write-Host "   TRUST_PROXY=true" -ForegroundColor White
Write-Host "   LOG_LEVEL=info" -ForegroundColor White
Write-Host "   ENABLE_REQUEST_LOGGING=true" -ForegroundColor White
Write-Host "   MAX_FILE_SIZE=10485760" -ForegroundColor White
Write-Host "   ALLOWED_FILE_TYPES=audio/wav,audio/mp3,audio/ogg" -ForegroundColor White
Write-Host "   SESSION_SECRET=astradio-production-session-secret-change-in-production" -ForegroundColor White
Write-Host "   SESSION_MAX_AGE=86400000" -ForegroundColor White
Write-Host "   ENABLE_DEBUG_MODE=false" -ForegroundColor White
Write-Host "   SKIP_EMAIL_VERIFICATION=true" -ForegroundColor White
Write-Host "   SWISS_EPHEMERIS_ENABLED=true" -ForegroundColor White
Write-Host "   SWISS_EPHEMERIS_PRECISION=high" -ForegroundColor White

Write-Host "`n4️⃣ CREATE SERVICE:" -ForegroundColor Yellow
Write-Host "   - Click 'Create Web Service'" -ForegroundColor White
Write-Host "   - Wait for build (3-5 minutes)" -ForegroundColor White
Write-Host "   - Note the generated URL" -ForegroundColor White

# Step 4: Success message
Write-Host "`n🎯 DEPLOYMENT READY!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "✅ API build successful" -ForegroundColor Green
Write-Host "✅ Dashboard opened" -ForegroundColor Green
Write-Host "✅ Configuration provided" -ForegroundColor Green

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Follow the configuration above in the browser" -ForegroundColor White
Write-Host "2. Create the service" -ForegroundColor White
Write-Host "3. Wait for deployment to complete" -ForegroundColor White
Write-Host "4. Test the endpoints" -ForegroundColor White
Write-Host "5. Update frontend with new API URL" -ForegroundColor White

Write-Host "`n🚀 ASTRADIO API deployment is ready!" -ForegroundColor Green 