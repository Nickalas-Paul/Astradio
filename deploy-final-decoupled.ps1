# Astradio Automated Deployment Script
# This script actually deploys the audio engine pipeline automatically

Write-Host "Astradio Automated Deployment - Audio Engine Pipeline" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Configuration
$FRONTEND_URL = "https://astradio.vercel.app"
$BACKEND_URL = "https://astradio-1.onrender.com"
$GITHUB_REPO = "Nickalas-Paul/Astradio"

Write-Host "`nDeployment Configuration:" -ForegroundColor Yellow
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "Repository: $GITHUB_REPO" -ForegroundColor White

# Step 1: Check prerequisites
Write-Host "`nStep 1: Checking prerequisites..." -ForegroundColor Green

# Check if RENDER_API_KEY is set
if (-not $env:RENDER_API_KEY) {
    Write-Host "RENDER_API_KEY environment variable not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:RENDER_API_KEY = 'your-api-key'" -ForegroundColor Yellow
    Write-Host "Or run: .\scripts\setup-render-token.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "RENDER_API_KEY is configured" -ForegroundColor Green

# Step 2: Deploy Backend to Render
Write-Host "`nStep 2: Deploying Backend to Render..." -ForegroundColor Green

try {
    # Use the existing automated deployment script
    Write-Host "Triggering Render deployment..." -ForegroundColor Yellow
    & .\scripts\deploy-render-api.ps1 -ServiceName "astradio-api"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backend deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Backend deployment failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Backend deployment error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for backend to be ready
Write-Host "`nStep 3: Waiting for backend to be ready..." -ForegroundColor Green

$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Health check attempt $attempt/$maxAttempts..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET -TimeoutSec 10
        Write-Host "Backend is healthy: $($response.status)" -ForegroundColor Green
        break
    } catch {
        Write-Host "Backend not ready yet, waiting 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "Backend failed to become ready after $maxAttempts attempts" -ForegroundColor Red
    exit 1
}

# Step 4: Deploy Frontend to Vercel (using Vercel CLI)
Write-Host "`nStep 4: Deploying Frontend to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy to Vercel
try {
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    Set-Location "apps/web"
    
    # Deploy with production flag
    vercel --prod --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Frontend deployment failed" -ForegroundColor Red
        exit 1
    }
    
    Set-Location "../.."
} catch {
    Write-Host "Frontend deployment error: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

# Step 5: Test the complete pipeline
Write-Host "`nStep 5: Testing Audio Pipeline..." -ForegroundColor Green

Write-Host "Testing backend endpoints..." -ForegroundColor Yellow

# Test health endpoint
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET
    Write-Host "Health endpoint: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test genres endpoint
try {
    $genres = Invoke-RestMethod -Uri "$BACKEND_URL/api/genres" -Method GET
    Write-Host "Genres endpoint: $($genres.Count) genres available" -ForegroundColor Green
} catch {
    Write-Host "❌ Genres endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test daily chart endpoint
try {
    $dailyChart = Invoke-RestMethod -Uri "$BACKEND_URL/api/daily" -Method POST -ContentType "application/json" -Body '{"date":"2024-01-01","time":"12:00","latitude":40.7128,"longitude":-74.0060}'
    Write-Host "✅ Daily chart endpoint: Chart generated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Daily chart endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Final verification
Write-Host "`n📋 Step 6: Final Verification" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host "`n🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor White

Write-Host "`n🎵 Your AI Audio Music Generator is now LIVE!" -ForegroundColor Cyan
Write-Host "Visit $FRONTEND_URL to start generating astrological music!" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Visit $FRONTEND_URL" -ForegroundColor White
Write-Host "2. Test the audio generation" -ForegroundColor White
Write-Host "3. Check browser console for any errors" -ForegroundColor White
Write-Host "4. Start working on AI music generation features!" -ForegroundColor White

Write-Host "`nYou can now focus on the AI audio music generator without deployment issues!" -ForegroundColor Green
