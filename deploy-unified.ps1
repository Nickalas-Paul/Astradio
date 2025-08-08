# Astradio Unified Deployment Script
# This script deploys both frontend and backend in one streamlined process

Write-Host "🚀 Astradio Unified Deployment" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "apps/api") -or -not (Test-Path "apps/web")) {
    Write-Host "❌ Error: Not in Astradio root directory" -ForegroundColor Red
    Write-Host "Please run this script from the project root" -ForegroundColor Red
    exit 1
}

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm run install:all
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Build packages
Write-Host "🔨 Building packages..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Test API health
Write-Host "🏥 Testing API health..." -ForegroundColor Yellow
try {
    $apiUrl = "http://localhost:3001/health"
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 10
    Write-Host "✅ API health check passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API health check failed (this is normal if API isn't running)" -ForegroundColor Yellow
}

# Deploy to Render (Backend)
Write-Host "🚀 Deploying backend to Render..." -ForegroundColor Yellow
try {
    # Check if render CLI is installed
    if (Test-Command "render") {
        Write-Host "📤 Using Render CLI..." -ForegroundColor Cyan
        render deploy
        Write-Host "✅ Backend deployment initiated" -ForegroundColor Green
    } else {
        Write-Host "📤 Render CLI not found. Please deploy manually:" -ForegroundColor Yellow
        Write-Host "  1. Push to GitHub" -ForegroundColor Cyan
        Write-Host "  2. Connect repository to Render" -ForegroundColor Cyan
        Write-Host "  3. Set build command: cd apps/api && npm install && npm run build" -ForegroundColor Cyan
        Write-Host "  4. Set start command: cd apps/api && npm start" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Backend deployment failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Deploy to Vercel (Frontend)
Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Yellow
try {
    # Check if vercel CLI is installed
    if (Test-Command "vercel") {
        Write-Host "📤 Using Vercel CLI..." -ForegroundColor Cyan
        Set-Location apps/web
        vercel --prod
        Set-Location ../..
        Write-Host "✅ Frontend deployment initiated" -ForegroundColor Green
    } else {
        Write-Host "📤 Vercel CLI not found. Please deploy manually:" -ForegroundColor Yellow
        Write-Host "  1. Push to GitHub" -ForegroundColor Cyan
        Write-Host "  2. Connect repository to Vercel" -ForegroundColor Cyan
        Write-Host "  3. Set root directory to apps/web" -ForegroundColor Cyan
        Write-Host "  4. Set build command to: npm run build" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check Render dashboard for backend status" -ForegroundColor White
Write-Host "2. Check Vercel dashboard for frontend status" -ForegroundColor White
Write-Host "3. Update environment variables in both platforms" -ForegroundColor White
Write-Host "4. Test the deployed application" -ForegroundColor White
