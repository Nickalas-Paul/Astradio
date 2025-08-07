# Test Audio Fix Script
Write-Host "🎵 Testing Audio Fixes..." -ForegroundColor Green

# Test 1: Check if frontend is running
Write-Host "`n1. Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check if API is running
Write-Host "`n2. Testing API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ API not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test audio generation
Write-Host "`n3. Testing Audio Generation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/audio/daily" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Audio generation working (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Audio generation failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎵 Audio Fix Test Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Open DevTools (F12) → Console tab" -ForegroundColor White
Write-Host "3. Click anywhere on the page to enable audio" -ForegroundColor White
Write-Host "4. Try generating audio and check for console messages" -ForegroundColor White
Write-Host "5. Look for '🎵 Audio context resumed' messages" -ForegroundColor White 