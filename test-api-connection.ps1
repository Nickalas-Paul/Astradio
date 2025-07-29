# Test API Connection Script
Write-Host "🔍 Testing API connection..." -ForegroundColor Green

$apiUrl = "http://localhost:3001"
$webUrl = "http://localhost:3003"

Write-Host "📡 Testing API health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API is responding successfully!" -ForegroundColor Green
        Write-Host "📊 Response: $($response.Content)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ API returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Testing web app..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$webUrl" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Web app is responding successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Web app returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to web app: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Current URLs:" -ForegroundColor Cyan
Write-Host "   API: $apiUrl" -ForegroundColor White
Write-Host "   Web: $webUrl" -ForegroundColor White
Write-Host ""
Write-Host "💡 If the API test failed, check that the API server is running" -ForegroundColor Yellow
Write-Host "💡 If the web app test failed, check that the web server is running" -ForegroundColor Yellow 