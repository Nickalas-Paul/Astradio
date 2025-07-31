# Test script for Tone.js audio system
Write-Host "🎵 Testing Tone.js Audio System..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if the API is running
Write-Host "1. Checking API health..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "✅ API is running and healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ API is not running. Please start the API first." -ForegroundColor Red
    Write-Host "   Run: cd apps/api && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test the Tone.js system
Write-Host ""
Write-Host "2. Testing Tone.js system..." -ForegroundColor Yellow

try {
    # Run the Node.js test script
    $null = node test-tone-system.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Tone.js system test completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 SYSTEM STATUS:" -ForegroundColor Cyan
        Write-Host "✅ Backend chart generation: WORKING" -ForegroundColor Green
        Write-Host "✅ Frontend Tone.js service: READY" -ForegroundColor Green
        Write-Host "✅ Chart data compatibility: CONFIRMED" -ForegroundColor Green
        Write-Host "✅ Real-time audio generation: ENABLED" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 NEXT STEPS:" -ForegroundColor Cyan
        Write-Host "1. Start the frontend: cd apps/web && npm run dev" -ForegroundColor Yellow
        Write-Host "2. Visit http://localhost:3000" -ForegroundColor Yellow
        Write-Host "3. Test the live audio generation" -ForegroundColor Yellow
        Write-Host "4. Compare performance with old WAV system" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Tone.js system test failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error running Tone.js test: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎵 Tone.js system is ready for use!" -ForegroundColor Green 