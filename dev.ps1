# Astradio Development Script
# Starts both frontend and backend development servers

Write-Host "🚀 Starting Astradio Development Environment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

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

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    try {
        npm run install:all
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
}

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
try {
    if (-not (Test-Path "apps/api/data")) {
        New-Item -ItemType Directory -Path "apps/api/data" -Force | Out-Null
    }
    if (-not (Test-Path "apps/api/public/audio")) {
        New-Item -ItemType Directory -Path "apps/api/public/audio" -Force | Out-Null
    }
    Write-Host "✅ Directories created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create directories" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Start development servers
Write-Host "🚀 Starting development servers..." -ForegroundColor Yellow
Write-Host "   Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Health Check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "   Daily Audio: http://localhost:3001/api/audio/daily" -ForegroundColor Cyan
Write-Host ""

try {
    # Start both servers concurrently
    npm run dev
} catch {
    Write-Host "❌ Failed to start development servers" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Start servers manually:" -ForegroundColor Yellow
    Write-Host "   Terminal 1: cd apps/api && npm run dev" -ForegroundColor White
    Write-Host "   Terminal 2: cd apps/web && npm run dev" -ForegroundColor White
}
