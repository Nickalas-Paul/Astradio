# PowerShell test script for Astradio audio functionality
$API_BASE = 'http://localhost:3001'

Write-Host "🎵 Testing Astradio Audio Functionality..." -ForegroundColor Green
Write-Host ""

try {
    # 1. Test health endpoint
    Write-Host "1. Testing health endpoint..." -ForegroundColor Cyan
    $health = Invoke-WebRequest -Uri "$API_BASE/health" -Method GET
    Write-Host "✅ Health check passed: $($health.Content | ConvertFrom-Json | Select-Object -ExpandProperty status)" -ForegroundColor Green

    # 2. Generate a chart
    Write-Host ""
    Write-Host "2. Generating test chart..." -ForegroundColor Cyan
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
    
    Write-Host "✅ Sequential audio started: $($sequentialData.data.message)" -ForegroundColor Green
    Write-Host "   Session ID: $($sequentialData.data.session.id)" -ForegroundColor Yellow

    # 4. Check audio status
    Write-Host ""
    Write-Host "4. Checking audio status..." -ForegroundColor Cyan
    $statusResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/status" -Method GET
    $statusData = $statusResponse.Content | ConvertFrom-Json
    $playingStatus = if ($statusData.data.isPlaying) { 'Playing' } else { 'Stopped' }
    Write-Host "✅ Audio status: $playingStatus" -ForegroundColor Green

    # 5. Wait a bit then stop audio
    Write-Host ""
    Write-Host "5. Waiting 3 seconds then stopping audio..." -ForegroundColor Cyan
    Start-Sleep 3
    
    $stopResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/stop" -Method POST
    $stopData = $stopResponse.Content | ConvertFrom-Json
    Write-Host "✅ Audio stopped: $($stopData.data.message)" -ForegroundColor Green

    # 6. Test layered audio generation
    Write-Host ""
    Write-Host "6. Testing layered audio generation..." -ForegroundColor Cyan
    $layeredResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/layered" -Method POST -Body $audioBody -ContentType "application/json"
    $layeredData = $layeredResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Layered audio started: $($layeredData.data.message)" -ForegroundColor Green
    Write-Host "   Session ID: $($layeredData.data.session.id)" -ForegroundColor Yellow

    # 7. Wait and stop again
    Write-Host ""
    Write-Host "7. Waiting 3 seconds then stopping layered audio..." -ForegroundColor Cyan
    Start-Sleep 3
    
    Invoke-WebRequest -Uri "$API_BASE/api/audio/stop" -Method POST | Out-Null
    Write-Host "✅ Layered audio stopped" -ForegroundColor Green

    Write-Host ""
    Write-Host "🎉 All audio tests passed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   - Chart generation: ✅ Working" -ForegroundColor Green
    Write-Host "   - Sequential audio: ✅ Working" -ForegroundColor Green
    Write-Host "   - Layered audio: ✅ Working" -ForegroundColor Green
    Write-Host "   - Audio controls: ✅ Working" -ForegroundColor Green

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response details: $responseBody" -ForegroundColor Red
    }
    exit 1
} 