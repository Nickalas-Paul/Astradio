# Build and deploy Astradio with Docker
# PowerShell script for Windows development

Write-Host "🚀 Building Astradio Docker containers..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if pnpm is available
try {
    pnpm --version | Out-Null
    Write-Host "✅ pnpm is available" -ForegroundColor Green
} catch {
    Write-Host "⚠️ pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
docker-compose down --volumes --remove-orphans
docker system prune -f

# Build packages locally first (for faster Docker builds)
Write-Host "📦 Building packages..." -ForegroundColor Cyan
pnpm install
pnpm run build:packages

# Build Docker images
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build --no-cache

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check health
Write-Host "🏥 Checking service health..." -ForegroundColor Cyan

try {
    $apiHealth = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 10
    Write-Host "✅ API health check passed" -ForegroundColor Green
    Write-Host "   Status: $($apiHealth.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API health check failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

try {
    $webResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "✅ Web frontend is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Web frontend is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Show running containers
Write-Host "`n📋 Running containers:" -ForegroundColor Cyan
docker-compose ps

# Show logs for any failed services
$failedServices = docker-compose ps --filter "status=exited" --format "table {{.Service}}"
if ($failedServices -ne "SERVICE") {
    Write-Host "`n❌ Some services failed. Showing logs:" -ForegroundColor Red
    docker-compose logs
}

Write-Host "`n🎉 Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🎵 Daily Player: http://localhost:3000/daily-player" -ForegroundColor Cyan
Write-Host "📊 Health Check: http://localhost:3001/health" -ForegroundColor Cyan

Write-Host "`n🛠️ Useful commands:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f          # Follow logs" -ForegroundColor Gray
Write-Host "   docker-compose down             # Stop services" -ForegroundColor Gray
Write-Host "   docker-compose restart          # Restart services" -ForegroundColor Gray
Write-Host "   docker-compose exec api sh      # Enter API container" -ForegroundColor Gray