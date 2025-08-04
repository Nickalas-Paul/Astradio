# Railway Deployment Script for Astradio API
# This script prepares the application for Railway deployment

Write-Host "🚀 Preparing Astradio for Railway deployment..." -ForegroundColor Green

# Step 1: Clean previous builds
Write-Host "📦 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "packages/types/dist") { Remove-Item "packages/types/dist" -Recurse -Force }
if (Test-Path "packages/astro-core/dist") { Remove-Item "packages/astro-core/dist" -Recurse -Force }
if (Test-Path "packages/audio-mappings/dist") { Remove-Item "packages/audio-mappings/dist" -Recurse -Force }
if (Test-Path "apps/api/dist") { Remove-Item "apps/api/dist" -Recurse -Force }

# Step 2: Install dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Build packages in order
Write-Host "🔨 Building packages..." -ForegroundColor Yellow

Write-Host "  Building types package..." -ForegroundColor Cyan
Set-Location "packages/types"
npm install
npm run build
Set-Location "../.."

Write-Host "  Building astro-core package..." -ForegroundColor Cyan
Set-Location "packages/astro-core"
npm install
npm run build
Set-Location "../.."

Write-Host "  Building audio-mappings package..." -ForegroundColor Cyan
Set-Location "packages/audio-mappings"
npm install
npm run build
Set-Location "../.."

# Step 4: Build API
Write-Host "🔨 Building API..." -ForegroundColor Yellow
Set-Location "apps/api"
npm install
npm run build
Set-Location "../.."

# Step 5: Verify builds
Write-Host "✅ Verifying builds..." -ForegroundColor Yellow
$buildErrors = @()

if (-not (Test-Path "packages/types/dist")) {
    $buildErrors += "Types package not built"
}

if (-not (Test-Path "packages/astro-core/dist")) {
    $buildErrors += "Astro-core package not built"
}

if (-not (Test-Path "packages/audio-mappings/dist")) {
    $buildErrors += "Audio-mappings package not built"
}

if (-not (Test-Path "apps/api/dist")) {
    $buildErrors += "API not built"
}

if ($buildErrors.Count -gt 0) {
    Write-Host "❌ Build verification failed:" -ForegroundColor Red
    foreach ($buildError in $buildErrors) {
        Write-Host "  - $buildError" -ForegroundColor Red
    }
    exit 1
}

# Step 6: Check Railway configuration
Write-Host "🔧 Checking Railway configuration..." -ForegroundColor Yellow
if (-not (Test-Path "railway.json")) {
    Write-Host "❌ railway.json not found" -ForegroundColor Red
    exit 1
}

$railwayConfig = Get-Content "railway.json" | ConvertFrom-Json
if (-not $railwayConfig.variables.ASTRO_CLIENT_ID -or $railwayConfig.variables.ASTRO_CLIENT_ID -eq "your-prokerala-client-id") {
    Write-Host "⚠️  Warning: ASTRO_CLIENT_ID not set in railway.json" -ForegroundColor Yellow
}

if (-not $railwayConfig.variables.ASTRO_CLIENT_SECRET -or $railwayConfig.variables.ASTRO_CLIENT_SECRET -eq "your-prokerala-client-secret") {
    Write-Host "⚠️  Warning: ASTRO_CLIENT_SECRET not set in railway.json" -ForegroundColor Yellow
}

# Step 7: Create deployment summary
Write-Host "📋 Deployment Summary:" -ForegroundColor Green
Write-Host "  ✅ All packages built successfully" -ForegroundColor Green
Write-Host "  ✅ API compiled and ready" -ForegroundColor Green
Write-Host "  ✅ Railway configuration present" -ForegroundColor Green
Write-Host "  📦 Ready for Railway deployment" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Set ASTRO_CLIENT_ID and ASTRO_CLIENT_SECRET in Railway dashboard" -ForegroundColor White
Write-Host "  2. Deploy to Railway using: railway up" -ForegroundColor White
Write-Host "  3. Monitor deployment logs for any issues" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Deployment preparation complete!" -ForegroundColor Green 