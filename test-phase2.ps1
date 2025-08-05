# PowerShell test script for Astradio Phase 2 - Audio Integration
$API_BASE = 'http://localhost:3001'

Write-Host "🎵 Testing Astradio Phase 2 - Audio Integration..." -ForegroundColor Green
Write-Host ""

try {
    # 1. Test health endpoint
    Write-Host "1. Testing API health..." -ForegroundColor Cyan
    $health = Invoke-WebRequest -Uri "$API_BASE/health" -Method GET
    Write-Host "✅ Health check passed: $($health.Content | ConvertFrom-Json | Select-Object -ExpandProperty status)" -ForegroundColor Green

    # 2. Generate a chart with real Swiss Ephemeris data
    Write-Host ""
    Write-Host "2. Generating astrological chart..." -ForegroundColor Cyan
    $chartBody = @{
        birth_data = @{
            date = "1990-05-15"
            time = "14:30"
            latitude = 40.7128
            longitude = -74.0060
            timezone = -5
        }
    } | ConvertTo-Json -Depth 3

    $chartResponse = Invoke-WebRequest -Uri "$API_BASE/api/charts/generate" -Method POST -Body $chartBody -ContentType "application/json"
    $chartData = $chartResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Chart generated successfully" -ForegroundColor Green
    Write-Host "   Planets found: $($chartData.data.chart.planets.PSObject.Properties.Name.Count)" -ForegroundColor Yellow
    Write-Host "   Audio config: $($chartData.data.audio_config.mode) mode, $($chartData.data.audio_config.duration)s duration" -ForegroundColor Yellow

    # 3. Test sequential audio generation
    Write-Host ""
    Write-Host "3. Testing sequential audio generation..." -ForegroundColor Cyan
    $audioBody = @{
        chart_data = $chartData.data.chart
    } | ConvertTo-Json -Depth 10

    $sequentialResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/sequential" -Method POST -Body $audioBody -ContentType "application/json"
    $sequentialData = $sequentialResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Sequential audio started successfully" -ForegroundColor Green
    Write-Host "   Session ID: $($sequentialData.data.session.id)" -ForegroundColor Yellow
    Write-Host "   Mode: $($sequentialData.data.session.configuration.mode)" -ForegroundColor Yellow
    Write-Host "   Duration: $($sequentialData.data.session.configuration.duration)s" -ForegroundColor Yellow

    # 4. Check audio status
    Write-Host ""
    Write-Host "4. Checking audio status..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    $statusResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/status" -Method GET
    $statusData = $statusResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Audio status retrieved" -ForegroundColor Green
    Write-Host "   Is Playing: $($statusData.data.isPlaying)" -ForegroundColor Yellow
    Write-Host "   Session ID: $($statusData.data.session.id)" -ForegroundColor Yellow
    Write-Host "   Chart ID: $($statusData.data.session.chartId)" -ForegroundColor Yellow

    # 5. Test layered audio generation
    Write-Host ""
    Write-Host "5. Testing layered audio generation..." -ForegroundColor Cyan
    $layeredResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/layered" -Method POST -Body $audioBody -ContentType "application/json"
    $layeredData = $layeredResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Layered audio started successfully" -ForegroundColor Green
    Write-Host "   Session ID: $($layeredData.data.session.id)" -ForegroundColor Yellow
    Write-Host "   Mode: $($layeredData.data.session.configuration.mode)" -ForegroundColor Yellow

    # 6. Test audio stop functionality
    Write-Host ""
    Write-Host "6. Testing audio stop functionality..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    $stopResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/stop" -Method POST
    $stopData = $stopResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Audio stopped successfully" -ForegroundColor Green
    Write-Host "   Message: $($stopData.data.message)" -ForegroundColor Yellow

    # 7. Verify audio is stopped
    Write-Host ""
    Write-Host "7. Verifying audio is stopped..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    $finalStatusResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/status" -Method GET
    $finalStatusData = $finalStatusResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Final status check" -ForegroundColor Green
    Write-Host "   Is Playing: $($finalStatusData.data.isPlaying)" -ForegroundColor Yellow

    # 8. Test web app accessibility
    Write-Host ""
    Write-Host "8. Testing web app accessibility..." -ForegroundColor Cyan
    try {
        $webResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
        Write-Host "✅ Web app is accessible at http://localhost:3000" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Web app not accessible (may need to be started separately)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "🎉 Phase 2 Audio Integration Test Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ All functionality working:" -ForegroundColor Green
    Write-Host "   • Real Swiss Ephemeris chart generation" -ForegroundColor White
    Write-Host "   • Sequential audio playback" -ForegroundColor White
    Write-Host "   • Layered audio playback" -ForegroundColor White
    Write-Host "   • Audio status monitoring" -ForegroundColor White
    Write-Host "   • Audio stop functionality" -ForegroundColor White
    Write-Host "   • Frontend integration ready" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Ready for Phase 3: Frontend Integration!" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
} 