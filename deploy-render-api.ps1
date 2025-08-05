# Deploy ASTRADIO API to Render
# This script handles the complete API deployment process

Write-Host "🚀 Deploying ASTRADIO API to Render..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "apps/api")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Test the API build
Write-Host "`n📦 Testing API build..." -ForegroundColor Yellow
try {
    Set-Location "apps/api"
    
    # Clean previous build
    if (Test-Path "dist") {
        Remove-Item "dist" -Recurse -Force
        Write-Host "🧹 Cleaned previous build" -ForegroundColor Green
    }
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Build the API
    Write-Host "🔨 Building API for production..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ API build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ API build failed! Please fix the errors before deploying." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ API build process failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check render.yaml configuration
Write-Host "`n🔧 Checking Render configuration..." -ForegroundColor Yellow
try {
    Set-Location "../.."
    
    if (Test-Path "render.yaml") {
        Write-Host "✅ render.yaml found" -ForegroundColor Green
        
        # Display the configuration
        Write-Host "`n📋 Render Configuration:" -ForegroundColor Cyan
        Get-Content "render.yaml" | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ render.yaml not found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to check Render configuration: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy to Render
Write-Host "`n🚀 Deploying to Render..." -ForegroundColor Yellow
Write-Host "📋 Manual Deployment Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com" -ForegroundColor White
Write-Host "2. Sign in to your account" -ForegroundColor White
Write-Host "3. Click 'New +' and select 'Web Service'" -ForegroundColor White
Write-Host "4. Connect your GitHub repository: https://github.com/Nickalas-Paul/Astradio" -ForegroundColor White
Write-Host "5. Configure the service:" -ForegroundColor White
Write-Host "   - Name: astradio-api" -ForegroundColor White
Write-Host "   - Root Directory: apps/api" -ForegroundColor White
Write-Host "   - Build Command: npm install && npm run build" -ForegroundColor White
Write-Host "   - Start Command: npm start" -ForegroundColor White
Write-Host "   - Health Check Path: /health" -ForegroundColor White
Write-Host "6. Add environment variables:" -ForegroundColor White
Write-Host "   - NODE_ENV: production" -ForegroundColor White
Write-Host "   - PORT: 3001" -ForegroundColor White
Write-Host "   - JWT_SECRET: [your-secret-key]" -ForegroundColor White
Write-Host "   - SESSION_SECRET: [your-session-secret]" -ForegroundColor White
Write-Host "7. Click 'Create Web Service'" -ForegroundColor White

# Step 4: Environment Variables Setup
Write-Host "`n🔐 Environment Variables to Set:" -ForegroundColor Yellow
Write-Host "Required Variables:" -ForegroundColor Cyan
Write-Host "- NODE_ENV: production" -ForegroundColor White
Write-Host "- PORT: 3001" -ForegroundColor White
Write-Host "- JWT_SECRET: [generate-a-secure-secret]" -ForegroundColor White
Write-Host "- JWT_EXPIRES_IN: 7d" -ForegroundColor White
Write-Host "- DATABASE_URL: ./data/astradio.db" -ForegroundColor White
Write-Host "- RATE_LIMIT_WINDOW_MS: 900000" -ForegroundColor White
Write-Host "- RATE_LIMIT_MAX_REQUESTS: 100" -ForegroundColor White
Write-Host "- ENABLE_HTTPS: true" -ForegroundColor White
Write-Host "- TRUST_PROXY: true" -ForegroundColor White
Write-Host "- LOG_LEVEL: info" -ForegroundColor White
Write-Host "- ENABLE_REQUEST_LOGGING: true" -ForegroundColor White
Write-Host "- MAX_FILE_SIZE: 10485760" -ForegroundColor White
Write-Host "- ALLOWED_FILE_TYPES: audio/wav,audio/mp3,audio/ogg" -ForegroundColor White
Write-Host "- SESSION_SECRET: [generate-a-secure-secret]" -ForegroundColor White
Write-Host "- SESSION_MAX_AGE: 86400000" -ForegroundColor White
Write-Host "- ENABLE_DEBUG_MODE: false" -ForegroundColor White
Write-Host "- SKIP_EMAIL_VERIFICATION: true" -ForegroundColor White
Write-Host "- SWISS_EPHEMERIS_ENABLED: true" -ForegroundColor White
Write-Host "- SWISS_EPHEMERIS_PRECISION: high" -ForegroundColor White

# Step 5: API Endpoints
Write-Host "`n🌐 API Endpoints Available:" -ForegroundColor Yellow
Write-Host "Health Check: GET /health" -ForegroundColor White
Write-Host "Chart Generation: POST /api/chart" -ForegroundColor White
Write-Host "Audio Generation: POST /api/audio" -ForegroundColor White
Write-Host "Daily Chart: GET /api/daily-chart" -ForegroundColor White
Write-Host "User Auth: POST /api/auth/login" -ForegroundColor White
Write-Host "User Registration: POST /api/auth/register" -ForegroundColor White
Write-Host "Sessions: GET /api/sessions" -ForegroundColor White
Write-Host "Friends: GET /api/friends" -ForegroundColor White
Write-Host "Subscriptions: GET /api/subscriptions" -ForegroundColor White

# Step 6: Summary
Write-Host "`n🎯 Deployment Summary:" -ForegroundColor Cyan
Write-Host "✅ API build successful" -ForegroundColor Green
Write-Host "✅ Render configuration ready" -ForegroundColor Green
Write-Host "✅ Environment variables documented" -ForegroundColor Green
Write-Host "✅ API endpoints documented" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Deploy to Render using the manual steps above" -ForegroundColor White
Write-Host "2. Set up environment variables in Render dashboard" -ForegroundColor White
Write-Host "3. Test the API endpoints" -ForegroundColor White
Write-Host "4. Update frontend to use the new API URL" -ForegroundColor White
Write-Host "5. Test music generator functionality" -ForegroundColor White

Write-Host "`n🚀 ASTRADIO API is ready for Render deployment!" -ForegroundColor Green

# Return to project root
Set-Location "." 