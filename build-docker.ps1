# Docker Build Script for Astradio API
# This script builds the Docker container using pnpm for proper workspace handling

Write-Host "🚀 Building Astradio API Docker Container..." -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Build the Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
docker build -t astradio-api .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker build successful!" -ForegroundColor Green
    
    # Test the container
    Write-Host "🧪 Testing container..." -ForegroundColor Yellow
    docker run --rm -d --name astradio-test -p 3001:3001 astradio-api
    
    # Wait for container to start
    Start-Sleep -Seconds 10
    
    # Test the API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ API is responding correctly!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ API responded with status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Could not test API endpoint: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Stop the test container
    docker stop astradio-test
    docker rm astradio-test
    
    Write-Host "🎉 Docker build and test completed successfully!" -ForegroundColor Green
    Write-Host "📋 To run the container: docker run -p 3001:3001 astradio-api" -ForegroundColor Cyan
    Write-Host "📋 To use docker-compose: docker-compose up" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
