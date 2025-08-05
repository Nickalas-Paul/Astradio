# Automated ASTRADIO API Deployment to Render
# This script prepares everything for deployment and provides clear instructions

Write-Host "🚀 Automated ASTRADIO API Deployment to Render" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Step 1: Verify we're in the right directory
if (-not (Test-Path "apps/api")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 2: Build the API
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

# Step 3: Return to root and check configuration
Set-Location "../.."

# Step 4: Generate deployment configuration
Write-Host "`n🔧 Preparing deployment configuration..." -ForegroundColor Yellow

# Create a deployment config file
$deployConfig = @"
# ASTRADIO API - Render Deployment Configuration
# Generated on: $(Get-Date)

## Service Configuration
- Name: astradio-api
- Root Directory: apps/api
- Build Command: npm install && npm run build
- Start Command: npm start
- Health Check Path: /health

## Environment Variables
NODE_ENV=production
PORT=3001
JWT_SECRET=astradio-production-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=./data/astradio.db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_HTTPS=true
TRUST_PROXY=true
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=audio/wav,audio/mp3,audio/ogg
SESSION_SECRET=astradio-production-session-secret-change-in-production
SESSION_MAX_AGE=86400000
ENABLE_DEBUG_MODE=false
SKIP_EMAIL_VERIFICATION=true
SWISS_EPHEMERIS_ENABLED=true
SWISS_EPHEMERIS_PRECISION=high

## API Endpoints
- Health: GET /health
- Chart: POST /api/chart
- Audio: POST /api/audio
- Daily Chart: GET /api/daily-chart
- Auth: POST /api/auth/login
- Register: POST /api/auth/register
"@

$deployConfig | Out-File -FilePath "render-deployment-config.txt" -Encoding UTF8
Write-Host "✅ Deployment configuration saved to render-deployment-config.txt" -ForegroundColor Green

# Step 5: Open browser and provide instructions
Write-Host "`n🌐 Opening Render deployment page..." -ForegroundColor Yellow
Start-Process "https://render.com/new/web-service"

Write-Host "`n📋 AUTOMATED DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n1️⃣ CONNECT REPOSITORY:" -ForegroundColor Yellow
Write-Host "   - Click 'Connect a repository'"
Write-Host "   - Select: Nickalas-Paul/Astradio"
Write-Host "   - Choose the repository"

Write-Host "`n2️⃣ CONFIGURE SERVICE:" -ForegroundColor Yellow
Write-Host "   - Name: astradio-api"
Write-Host "   - Root Directory: apps/api"
Write-Host "   - Build Command: npm install && npm run build"
Write-Host "   - Start Command: npm start"
Write-Host "   - Health Check Path: /health"

Write-Host "`n3️⃣ ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
Write-Host "   - Click 'Advanced'"
Write-Host "   - Add all variables from render-deployment-config.txt"
Write-Host "   - Copy and paste each variable"

Write-Host "`n4️⃣ CREATE SERVICE:" -ForegroundColor Yellow
Write-Host "   - Click 'Create Web Service'"
Write-Host "   - Wait for build to complete"
Write-Host "   - Note the generated URL"

Write-Host "`n5️⃣ TEST DEPLOYMENT:" -ForegroundColor Yellow
Write-Host "   - Test health endpoint: GET /health"
Write-Host "   - Test chart generation: POST /api/chart"
Write-Host "   - Test audio generation: POST /api/audio"

# Step 6: Provide testing commands
Write-Host "`n🧪 TESTING COMMANDS:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

Write-Host "`nHealth Check:" -ForegroundColor Yellow
Write-Host 'curl https://your-api-url.onrender.com/health'

Write-Host "`nGenerate Chart:" -ForegroundColor Yellow
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

Write-Host "`nGenerate Audio:" -ForegroundColor Yellow
Write-Host @'
curl -X POST https://your-api-url.onrender.com/api/audio \
  -H "Content-Type: application/json" \
  -d "{
    \"chartData\": {...},
    \"genre\": \"ambient\",
    \"duration\": 60
  }"
'@

# Step 7: Update frontend instructions
Write-Host "`n🔗 FRONTEND INTEGRATION:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

Write-Host "`nOnce deployed, update your frontend:" -ForegroundColor Yellow
Write-Host "1. Add to .env.local:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL=https://your-api-url.onrender.com"
Write-Host "2. Update API calls in your frontend code"
Write-Host "3. Test the full integration"

# Step 8: Success summary
Write-Host "`n🎯 DEPLOYMENT SUMMARY:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

Write-Host "✅ API build successful" -ForegroundColor Green
Write-Host "✅ Configuration prepared" -ForegroundColor Green
Write-Host "✅ Browser opened to Render" -ForegroundColor Green
Write-Host "✅ Instructions provided" -ForegroundColor Green
Write-Host "✅ Testing commands ready" -ForegroundColor Green

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Follow the instructions above in the browser" -ForegroundColor White
Write-Host "2. Set up environment variables" -ForegroundColor White
Write-Host "3. Create the service" -ForegroundColor White
Write-Host "4. Test the endpoints" -ForegroundColor White
Write-Host "5. Update frontend with new API URL" -ForegroundColor White

Write-Host "`n🚀 ASTRADIO API deployment is ready!" -ForegroundColor Green
Write-Host "The browser should have opened to Render's deployment page." -ForegroundColor Green 