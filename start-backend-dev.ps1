# Quick Start Astradio Backend for Development
# This starts your backend and keeps it running in the background

Write-Host "🚀 Starting Astradio Backend for Development..." -ForegroundColor Green

# Navigate to API directory
$apiPath = Join-Path (Get-Location) "apps\api"
if (-not (Test-Path $apiPath)) {
    Write-Host "❌ API directory not found: $apiPath" -ForegroundColor Red
    exit 1
}

Set-Location $apiPath
Write-Host "📍 Working in: $apiPath" -ForegroundColor Cyan

# Check if backend is already running
$portCheck = netstat -an | Select-String ":3001"
if ($portCheck) {
    Write-Host "⚠️  Backend is already running on port 3001" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to kill the existing process and restart? (y/n)"
    if ($choice -eq "y" -or $choice -eq "Y") {
        # Kill process on port 3001
        $processId = (netstat -ano | Select-String ":3001" | Select-Object -First 1) -split '\s+' | Select-Object -Last 1
        if ($processId) {
            Stop-Process -Id $processId -Force
            Write-Host "✅ Killed existing process" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
    } else {
        Write-Host "✅ Using existing backend" -ForegroundColor Green
        exit 0
    }
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

# Start the backend in background
Write-Host "🚀 Starting backend in background..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "dist/app.js" -WorkingDirectory $apiPath -WindowStyle Hidden

# Wait a moment for the server to start
Start-Sleep -Seconds 3

# Check if the server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend started but health check failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Backend may still be starting up..." -ForegroundColor Yellow
    Write-Host "💡 Check manually: http://localhost:3001/health" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Backend Started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your API is available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful endpoints:" -ForegroundColor Cyan
Write-Host "  Health Check:     http://localhost:3001/health" -ForegroundColor White
Write-Host "  API Status:       http://localhost:3001/api/status" -ForegroundColor White
Write-Host ""
Write-Host "💡 To stop the backend, use Task Manager or run:" -ForegroundColor Yellow
Write-Host "   Get-Process node | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process" -ForegroundColor White 