# Deploy Astradio to production
# PowerShell script for production deployment

param(
    [string]$Environment = "production",
    [string]$Registry = "",
    [string]$Tag = "latest",
    [switch]$Push = $false
)

Write-Host "🚀 Deploying Astradio to $Environment..." -ForegroundColor Cyan

# Set environment variables
$env:NODE_ENV = $Environment
$env:DOCKER_BUILDKIT = "1"

# Generate production secrets if not set
if (-not $env:JWT_SECRET) {
    $env:JWT_SECRET = -join ((1..64) | ForEach {[char]((65..90) + (97..122) | Get-Random)})
    Write-Host "🔐 Generated JWT_SECRET" -ForegroundColor Yellow
}

if (-not $env:SESSION_SECRET) {
    $env:SESSION_SECRET = -join ((1..64) | ForEach {[char]((65..90) + (97..122) | Get-Random)})
    Write-Host "🔐 Generated SESSION_SECRET" -ForegroundColor Yellow
}

# Build optimized production images
Write-Host "🔨 Building production images..." -ForegroundColor Cyan

if ($Registry) {
    $apiImage = "$Registry/astradio-api:$Tag"
    $webImage = "$Registry/astradio-web:$Tag"
    
    docker build --target api-production -t $apiImage .
    docker build --target web-production -t $webImage .
    
    if ($Push) {
        Write-Host "📤 Pushing images to registry..." -ForegroundColor Cyan
        docker push $apiImage
        docker push $webImage
    }
} else {
    docker-compose -f docker-compose.yml -f docker-compose.production.yml build
}

# Deploy
Write-Host "🚀 Starting production deployment..." -ForegroundColor Cyan

if (Test-Path "docker-compose.production.yml") {
    docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
} else {
    docker-compose up -d
}

# Wait for startup
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

# Health checks
Write-Host "🏥 Running health checks..." -ForegroundColor Cyan

$maxRetries = 10
$retryCount = 0
$healthy = $false

while ($retryCount -lt $maxRetries -and -not $healthy) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
        if ($health.status -eq "healthy" -or $health.status -eq "ok") {
            Write-Host "✅ API is healthy" -ForegroundColor Green
            $healthy = $true
        }
    } catch {
        $retryCount++
        Write-Host "⏳ Health check attempt $retryCount/$maxRetries..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $healthy) {
    Write-Host "❌ Health checks failed" -ForegroundColor Red
    docker-compose logs api
    exit 1
}

# Test daily chart endpoint
try {
    $dailyChart = Invoke-RestMethod -Uri "http://localhost:3001/api/status" -TimeoutSec 10
    Write-Host "✅ Swiss Ephemeris status: $($dailyChart.calculation_method)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not check Swiss Ephemeris status" -ForegroundColor Yellow
}

# Test frontend
try {
    $webCheck = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    if ($webCheck.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend check failed" -ForegroundColor Red
}

# Show deployment summary
Write-Host "`n🎉 Production deployment complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🌐 Endpoints:" -ForegroundColor Cyan
Write-Host "   Frontend:      http://localhost:3000" -ForegroundColor White
Write-Host "   API:           http://localhost:3001" -ForegroundColor White
Write-Host "   Daily Player:  http://localhost:3000/daily-player" -ForegroundColor White
Write-Host "   Health:        http://localhost:3001/health" -ForegroundColor White
Write-Host "   Swiss Status:  http://localhost:3001/api/status" -ForegroundColor White
Write-Host "   Genres:        http://localhost:3001/api/genres" -ForegroundColor White

Write-Host "`n🔧 Management Commands:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f                    # View logs" -ForegroundColor Gray
Write-Host "   docker-compose exec api sh                # Enter API container" -ForegroundColor Gray
Write-Host "   docker-compose restart api                # Restart API" -ForegroundColor Gray
Write-Host "   docker-compose down                       # Stop all services" -ForegroundColor Gray

Write-Host "`n🔐 Environment:" -ForegroundColor Magenta
Write-Host "   NODE_ENV: $Environment" -ForegroundColor Gray
Write-Host "   JWT_SECRET: ****$(($env:JWT_SECRET).Substring(($env:JWT_SECRET).Length - 4))" -ForegroundColor Gray
Write-Host "   SESSION_SECRET: ****$(($env:SESSION_SECRET).Substring(($env:SESSION_SECRET).Length - 4))" -ForegroundColor Gray

if ($Registry -and $Push) {
    Write-Host "`n📤 Images pushed to:" -ForegroundColor Cyan
    Write-Host "   API: $apiImage" -ForegroundColor Gray
    Write-Host "   Web: $webImage" -ForegroundColor Gray
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🎵 Astradio is now running in $Environment mode!" -ForegroundColor Green
