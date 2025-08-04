# PowerShell test script for Astradio audio functionality
param(
    [string]$ApiBase = "http://localhost:3001"
)

Write-Host "🎵 Testing Astradio Audio Functionality..." -ForegroundColor Green
Write-Host ""

try {
    # 1. Test health endpoint
    Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-RestMethod -Uri "$ApiBase/health" -Method GET
    Write-Host "✅ Health check passed: $($healthResponse.status)" -ForegroundColor Green

    # 2. Generate a chart
    Write-Host "`n2. Generating test chart..." -ForegroundColor Yellow
    $chartBody = @{
        birth_data = @{
            date = "1990-05-15"
            time = "14:30"
            latitude = 40.7128
            longitude = -74.0060
            timezone = -5
        }
    } | ConvertTo-Json -Depth 3

    $chartResponse = Invoke-RestMethod -Uri "$ApiBase/api/charts/generate" -Method POST -Body $chartBody -ContentType "application/json"
    
    Write-Host "✅ Chart generated successfully" -ForegroundColor Green
    Write-Host "   Response structure: $($chartResponse.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
    
    if ($chartResponse.data.chart) {
        Write-Host "   Chart structure: $($chartResponse.data.chart.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
        Write-Host "   Planets found: $($chartResponse.data.chart.planets.PSObject.Properties.Name.Count)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ No chart data in response" -ForegroundColor Red
        Write-Host "   Full response: $($chartResponse | ConvertTo-Json -Depth 5)" -ForegroundColor Red
        return
    }

    # 3. Test audio generation
    Write-Host "`n3. Testing audio generation..." -ForegroundColor Yellow
    $audioBody = @{
        chart_data = $chartResponse.data.chart
        duration = 30
        genre = "ambient"
    } | ConvertTo-Json -Depth 5

    $audioResponse = Invoke-RestMethod -Uri "$ApiBase/api/audio/generate" -Method POST -Body $audioBody -ContentType "application/json"
    
    Write-Host "✅ Audio generation successful" -ForegroundColor Green
    Write-Host "   Audio buffer size: $($audioResponse.data.audio_buffer.Length) bytes" -ForegroundColor Gray
    Write-Host "   Duration: $($audioResponse.data.duration) seconds" -ForegroundColor Gray

    Write-Host "`n🎉 All audio tests passed successfully!" -ForegroundColor Green
    Write-Host "`n📊 Summary:" -ForegroundColor Cyan
    Write-Host "   - Chart generation: ✅ Working" -ForegroundColor Green
    Write-Host "   - Audio generation: ✅ Working" -ForegroundColor Green
    Write-Host "   - API endpoints: ✅ Responding" -ForegroundColor Green

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response details: $($_.Exception.Response)" -ForegroundColor Red
    }
    exit 1
} 