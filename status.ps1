Write-Host "🔍 Astradio Service Status" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check API
Write-Host "📡 API Server (Port 3001):" -ForegroundColor Yellow
$apiProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($apiProcess) {
    Write-Host "✅ Running (PID: $apiProcess)" -ForegroundColor Green
} else {
    Write-Host "❌ Not running" -ForegroundColor Red
}

# Check Web App
Write-Host "🌐 Web App (Port 3003):" -ForegroundColor Yellow
$webProcess = Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($webProcess) {
    Write-Host "✅ Running (PID: $webProcess)" -ForegroundColor Green
} else {
    Write-Host "❌ Not running" -ForegroundColor Red
}

# Test API Health
Write-Host "🔍 Testing API Health:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API responding correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ API returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Web App: http://localhost:3003" -ForegroundColor White
Write-Host "   API Health: http://localhost:3001/health" -ForegroundColor White
Write-Host ""
Write-Host "💡 If you see 'API Server Unreachable', try refreshing the web page" -ForegroundColor Yellow 