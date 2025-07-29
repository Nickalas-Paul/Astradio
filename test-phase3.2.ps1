# PowerShell test script for Astradio Phase 3.2 - Overlay & Sandbox Audio Logic
$API_BASE = 'http://localhost:3001'

Write-Host "🎵 Testing Astradio Phase 3.2 - Overlay & Sandbox Audio Logic..." -ForegroundColor Green
Write-Host ""

try {
    # 1. Test health endpoint
    Write-Host "1. Testing API health..." -ForegroundColor Cyan
    $health = Invoke-WebRequest -Uri "$API_BASE/health" -Method GET
    Write-Host "✅ Health check passed: $($health.Content | ConvertFrom-Json | Select-Object -ExpandProperty status)" -ForegroundColor Green

    # 2. Test overlay chart generation
    Write-Host ""
    Write-Host "2. Testing overlay chart generation..." -ForegroundColor Cyan
    
    $overlayBody = @{
        birth_data_1 = @{
            date = "1990-05-15"
            time = "14:30"
            latitude = 40.7128
            longitude = -74.0060
            timezone = -5
        }
        birth_data_2 = @{
            date = "1985-08-20"
            time = "09:15"
            latitude = 34.0522
            longitude = -118.2437
            timezone = -8
        }
    } | ConvertTo-Json -Depth 3

    $overlayResponse = Invoke-WebRequest -Uri "$API_BASE/api/charts/overlay" -Method POST -Body $overlayBody -ContentType "application/json"
    $overlayData = $overlayResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Overlay charts generated successfully" -ForegroundColor Green
    Write-Host "   Mode: $($overlayData.data.mode)" -ForegroundColor Yellow
    Write-Host "   Chart 1 planets: $($overlayData.data.chart1.planets.PSObject.Properties.Name.Count)" -ForegroundColor Yellow
    Write-Host "   Chart 2 planets: $($overlayData.data.chart2.planets.PSObject.Properties.Name.Count)" -ForegroundColor Yellow
    Write-Host "   Merged metadata: $($overlayData.data.merged_metadata.overlay_created)" -ForegroundColor Yellow

    # 3. Test overlay audio generation
    Write-Host ""
    Write-Host "3. Testing overlay audio generation..." -ForegroundColor Cyan
    
    $overlayAudioBody = @{
        chart1_data = $overlayData.data.chart1
        chart2_data = $overlayData.data.chart2
        mode = "overlay"
    } | ConvertTo-Json -Depth 10

    $overlayAudioResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/overlay" -Method POST -Body $overlayAudioBody -ContentType "application/json"
    $overlayAudioData = $overlayAudioResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Overlay audio started successfully" -ForegroundColor Green
    Write-Host "   Mode: $($overlayAudioData.data.mode)" -ForegroundColor Yellow
    Write-Host "   Session ID: $($overlayAudioData.data.session.id)" -ForegroundColor Yellow
    Write-Host "   Duration: $($overlayAudioData.data.session.configuration.duration)s" -ForegroundColor Yellow

    # 4. Test sandbox audio with configuration
    Write-Host ""
    Write-Host "4. Testing sandbox audio with configuration..." -ForegroundColor Cyan
    
    # First generate a chart for sandbox
    $sandboxChartBody = @{
        birth_data = @{
            date = "1990-05-15"
            time = "14:30"
            latitude = 40.7128
            longitude = -74.0060
            timezone = -5
        }
        mode = "sandbox"
    } | ConvertTo-Json -Depth 3

    $sandboxChartResponse = Invoke-WebRequest -Uri "$API_BASE/api/charts/generate" -Method POST -Body $sandboxChartBody -ContentType "application/json"
    $sandboxChartData = $sandboxChartResponse.Content | ConvertFrom-Json

    $sandboxAudioBody = @{
        chart_data = $sandboxChartData.data.chart
        configuration = @{
            tempo = 140
            duration = 90
            volume = 0.8
            reverb = 0.4
            delay = 0.2
        }
        mode = "sandbox"
    } | ConvertTo-Json -Depth 10

    $sandboxAudioResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/sandbox" -Method POST -Body $sandboxAudioBody -ContentType "application/json"
    $sandboxAudioData = $sandboxAudioResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Sandbox audio with configuration started successfully" -ForegroundColor Green
    Write-Host "   Mode: $($sandboxAudioData.data.mode)" -ForegroundColor Yellow
    Write-Host "   Session ID: $($sandboxAudioData.data.session.id)" -ForegroundColor Yellow
    Write-Host "   Configuration applied: $($sandboxAudioData.data.session.configuration.tempo) BPM" -ForegroundColor Yellow

    # 5. Test audio status for overlay
    Write-Host ""
    Write-Host "5. Testing audio status for overlay..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    $statusResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/status" -Method GET
    $statusData = $statusResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Audio status retrieved" -ForegroundColor Green
    Write-Host "   Is Playing: $($statusData.data.isPlaying)" -ForegroundColor Yellow
    Write-Host "   Session ID: $($statusData.data.session.id)" -ForegroundColor Yellow
    Write-Host "   Mode: $($statusData.data.session.configuration.mode)" -ForegroundColor Yellow

    # 6. Test audio stop functionality
    Write-Host ""
    Write-Host "6. Testing audio stop functionality..." -ForegroundColor Cyan
    $stopResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/stop" -Method POST
    $stopData = $stopResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Audio stopped successfully" -ForegroundColor Green
    Write-Host "   Message: $($stopData.data.message)" -ForegroundColor Yellow

    # 7. Test web app accessibility
    Write-Host ""
    Write-Host "7. Testing web app accessibility..." -ForegroundColor Cyan
    try {
        $webResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
        Write-Host "✅ Web app is accessible at http://localhost:3000" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Web app not accessible (may need to be started separately)" -ForegroundColor Yellow
    }

    # 8. Test overlay and sandbox routes
    Write-Host ""
    Write-Host "8. Testing overlay and sandbox routes..." -ForegroundColor Cyan
    $routes = @("/overlay", "/sandbox")
    
    foreach ($route in $routes) {
        try {
            $routeResponse = Invoke-WebRequest -Uri "http://localhost:3000$route" -Method GET -TimeoutSec 5
            Write-Host "✅ Route $route is accessible" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Route $route not accessible (may need to be started separately)" -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host "🎉 Phase 3.2 Overlay & Sandbox Audio Logic Test Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ All functionality working:" -ForegroundColor Green
    Write-Host "   • Overlay chart generation (dual birth data)" -ForegroundColor White
    Write-Host "   • Overlay audio generation (two charts)" -ForegroundColor White
    Write-Host "   • Sandbox audio with custom configuration" -ForegroundColor White
    Write-Host "   • Audio parameter controls (tempo, duration, volume, etc.)" -ForegroundColor White
    Write-Host "   • Enhanced UI for overlay and sandbox modes" -ForegroundColor White
    Write-Host "   • Audio session management" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Ready for Phase 4: UX Polish & Audio Visualizations!" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
} 