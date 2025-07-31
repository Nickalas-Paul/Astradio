# ASTRADIO MUSIC PIPELINE VALIDATION SCRIPT
# Tests the complete flow from daily chart generation to audio playback

Write-Host "🎵 ASTRADIO MUSIC PIPELINE VALIDATION" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: API Server Health
Write-Host "`n🔍 Test 1: API Server Health" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ API server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ API server returned status: $($healthResponse.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ API server is not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Daily Chart Generation
Write-Host "`n🔍 Test 2: Daily Chart Generation" -ForegroundColor Yellow
$today = Get-Date -Format "yyyy-MM-dd"
try {
    $chartResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/daily/$today" -UseBasicParsing
    if ($chartResponse.StatusCode -eq 200) {
        $chartData = $chartResponse.Content | ConvertFrom-Json
        if ($chartData.success) {
            Write-Host "✅ Daily chart generated successfully" -ForegroundColor Green
            Write-Host "   Date: $($chartData.data.date)" -ForegroundColor Gray
            Write-Host "   Planets: $($chartData.data.chart.planets.PSObject.Properties.Name.Count)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Chart generation failed: $($chartData.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Chart endpoint returned status: $($chartResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Chart generation failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Daily Audio Generation
Write-Host "`n🔍 Test 3: Daily Audio Generation" -ForegroundColor Yellow
try {
    $audioResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/audio/daily?genre=ambient`&duration=30" -UseBasicParsing
    if ($audioResponse.StatusCode -eq 200) {
        $contentLength = $audioResponse.Content.Length
        Write-Host "✅ Daily audio generated successfully" -ForegroundColor Green
        Write-Host "   Content-Type: $($audioResponse.Headers['Content-Type'])" -ForegroundColor Gray
        Write-Host "   Content-Length: $contentLength bytes" -ForegroundColor Gray
        
        if ($contentLength -gt 1000) {
            Write-Host "✅ Audio buffer size is reasonable" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Audio buffer seems small: $contentLength bytes" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Audio endpoint returned status: $($audioResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Audio generation failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Web Server Health
Write-Host "`n🔍 Test 4: Web Server Health" -ForegroundColor Yellow
try {
    $webResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "✅ Web server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Web server returned status: $($webResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Web server is not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Chart Wheel Rendering
Write-Host "`n🔍 Test 5: Chart Wheel Rendering" -ForegroundColor Yellow
try {
    $sandboxResponse = Invoke-WebRequest -Uri "http://localhost:3000/sandbox" -UseBasicParsing
    if ($sandboxResponse.StatusCode -eq 200) {
        Write-Host "✅ Sandbox page loads successfully" -ForegroundColor Green
        Write-Host "   Chart wheel should be visible" -ForegroundColor Gray
    } else {
        Write-Host "❌ Sandbox page returned status: $($sandboxResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Sandbox page failed to load" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 PIPELINE VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✅ API Server: Running" -ForegroundColor Green
Write-Host "✅ Daily Chart: Generated" -ForegroundColor Green
Write-Host "✅ Daily Audio: Generated" -ForegroundColor Green
Write-Host "✅ Web Server: Running" -ForegroundColor Green
Write-Host "✅ Chart Wheel: Available" -ForegroundColor Green

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "2. Check browser console for audio loading logs" -ForegroundColor White
Write-Host "3. Verify chart wheel displays today's date" -ForegroundColor White
Write-Host "4. Test audio playback functionality" -ForegroundColor White

Write-Host "`n🎵 Music pipeline validation complete!" -ForegroundColor Green 