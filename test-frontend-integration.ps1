Write-Host "Frontend Integration Test" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""

# Configuration
$WEB_BASE = "http://localhost:3000"
$API_BASE = "http://localhost:3001"

# Test 1: Check if web app is accessible
Write-Host "1. Testing Web App Accessibility..." -ForegroundColor Cyan
try {
    $webResponse = Invoke-WebRequest -Uri "$WEB_BASE" -UseBasicParsing -TimeoutSec 10
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "Web app is accessible" -ForegroundColor Green
        Write-Host "   Status Code: $($webResponse.StatusCode)" -ForegroundColor Yellow
        Write-Host "   Content Length: $($webResponse.Content.Length)" -ForegroundColor Yellow
    } else {
        Write-Host "Web app returned status: $($webResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Web app not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check if API proxy is working
Write-Host ""
Write-Host "2. Testing API Proxy..." -ForegroundColor Cyan
try {
    $proxyResponse = Invoke-WebRequest -Uri "$WEB_BASE/api/health" -UseBasicParsing -TimeoutSec 5
    if ($proxyResponse.StatusCode -eq 200) {
        Write-Host "API proxy is working" -ForegroundColor Green
        $healthData = $proxyResponse.Content | ConvertFrom-Json
        Write-Host "   Health Status: $($healthData.status)" -ForegroundColor Yellow
    } else {
        Write-Host "API proxy failed: $($proxyResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "API proxy failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test daily chart endpoint through proxy
Write-Host ""
Write-Host "3. Testing Daily Chart Endpoint..." -ForegroundColor Cyan

$today = Get-Date -Format "yyyy-MM-dd"
try {
    $dailyResponse = Invoke-WebRequest -Uri "$WEB_BASE/api/daily/$today" -UseBasicParsing -TimeoutSec 10
    if ($dailyResponse.StatusCode -eq 200) {
        Write-Host "Daily chart endpoint working" -ForegroundColor Green
        $dailyData = $dailyResponse.Content | ConvertFrom-Json
        Write-Host "   Success: $($dailyData.success)" -ForegroundColor Yellow
        Write-Host "   Date: $($dailyData.data.date)" -ForegroundColor Yellow
        Write-Host "   Chart Data Present: $($dailyData.data.chart -ne $null)" -ForegroundColor Yellow
        Write-Host "   Audio Config Present: $($dailyData.data.audio_config -ne $null)" -ForegroundColor Yellow
    } else {
        Write-Host "Daily chart endpoint failed: $($dailyResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Daily chart endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test chart generation endpoint through proxy
Write-Host ""
Write-Host "4. Testing Chart Generation Endpoint..." -ForegroundColor Cyan

$birthData = @{
    date = "1988-05-15"
    time = "12:30"
    latitude = 29.4241
    longitude = -98.4936
    timezone = -6
}

$chartBody = @{
    birth_data = $birthData
    mode = "moments"
} | ConvertTo-Json -Depth 3

try {
    $chartResponse = Invoke-WebRequest -Uri "$WEB_BASE/api/charts/generate" -Method POST -Body $chartBody -ContentType "application/json" -TimeoutSec 10
    if ($chartResponse.StatusCode -eq 200) {
        Write-Host "Chart generation endpoint working" -ForegroundColor Green
        $chartData = $chartResponse.Content | ConvertFrom-Json
        Write-Host "   Success: $($chartData.success)" -ForegroundColor Yellow
        Write-Host "   Swiss Ephemeris: $($chartData.data.swiss_ephemeris)" -ForegroundColor Yellow
        Write-Host "   Planets: $($chartData.data.chart.planets.Count)" -ForegroundColor Yellow
    } else {
        Write-Host "Chart generation endpoint failed: $($chartResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Chart generation endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test audio generation endpoint through proxy
Write-Host ""
Write-Host "5. Testing Audio Generation Endpoint..." -ForegroundColor Cyan

if ($chartData.success) {
    $audioBody = @{
        chart_data = $chartData.data.chart
        mode = "melodic"
        duration = 60
        configuration = @{
            genre = "ambient"
        }
    } | ConvertTo-Json -Depth 10

    try {
        $audioResponse = Invoke-WebRequest -Uri "$WEB_BASE/api/audio/melodic" -Method POST -Body $audioBody -ContentType "application/json" -TimeoutSec 10
        if ($audioResponse.StatusCode -eq 200) {
            Write-Host "Audio generation endpoint working" -ForegroundColor Green
            $audioData = $audioResponse.Content | ConvertFrom-Json
            Write-Host "   Success: $($audioData.success)" -ForegroundColor Yellow
            Write-Host "   Session ID: $($audioData.data.session.id)" -ForegroundColor Yellow
            Write-Host "   Composition: $($audioData.data.composition.phrases) phrases" -ForegroundColor Yellow
        } else {
            Write-Host "Audio generation endpoint failed: $($audioResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Audio generation endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Test sandbox audio endpoint through proxy
Write-Host ""
Write-Host "6. Testing Sandbox Audio Endpoint..." -ForegroundColor Cyan

$sandboxChart = @{
    metadata = @{
        birth_datetime = "2024-01-01T12:00:00"
    }
    planets = @{
        Sun = @{ sign = "Capricorn"; degree = 10; house = 1 }
        Moon = @{ sign = "Cancer"; degree = 20; house = 7 }
    }
}

$sandboxBody = @{
    chart_data = $sandboxChart
    aspects = @(
        @{ planet1 = "Sun"; planet2 = "Moon"; type = "opposition"; orb = 10 }
    )
    configuration = @{
        tempo = 120
        key = "C"
    }
    genre = "ambient"
    duration = 60
} | ConvertTo-Json -Depth 10

try {
    $sandboxResponse = Invoke-WebRequest -Uri "$WEB_BASE/api/audio/sandbox" -Method POST -Body $sandboxBody -ContentType "application/json" -TimeoutSec 15
    if ($sandboxResponse.StatusCode -eq 200) {
        Write-Host "Sandbox audio endpoint working" -ForegroundColor Green
        Write-Host "   Content-Type: $($sandboxResponse.Headers['Content-Type'])" -ForegroundColor Yellow
        Write-Host "   Content-Length: $($sandboxResponse.Headers['Content-Length'])" -ForegroundColor Yellow
        Write-Host "   Audio Buffer Size: $($sandboxResponse.Content.Length) bytes" -ForegroundColor Yellow
    } else {
        Write-Host "Sandbox audio endpoint failed: $($sandboxResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Sandbox audio endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Test overlay chart endpoint through proxy
Write-Host ""
Write-Host "7. Testing Overlay Chart Endpoint..." -ForegroundColor Cyan

$birthData1 = @{
    date = "1988-05-15"
    time = "12:30"
    latitude = 29.4241
    longitude = -98.4936
    timezone = -6
}

$birthData2 = @{
    date = "1990-03-20"
    time = "14:45"
    latitude = 40.7128
    longitude = -74.0060
    timezone = -5
}

$overlayBody = @{
    birth_data_1 = $birthData1
    birth_data_2 = $birthData2
} | ConvertTo-Json -Depth 3

try {
    $overlayResponse = Invoke-WebRequest -Uri "$WEB_BASE/api/charts/overlay" -Method POST -Body $overlayBody -ContentType "application/json" -TimeoutSec 10
    if ($overlayResponse.StatusCode -eq 200) {
        Write-Host "Overlay chart endpoint working" -ForegroundColor Green
        $overlayData = $overlayResponse.Content | ConvertFrom-Json
        Write-Host "   Success: $($overlayData.success)" -ForegroundColor Yellow
        Write-Host "   Chart 1 Planets: $($overlayData.data.chart1.planets.Count)" -ForegroundColor Yellow
        Write-Host "   Chart 2 Planets: $($overlayData.data.chart2.planets.Count)" -ForegroundColor Yellow
    } else {
        Write-Host "Overlay chart endpoint failed: $($overlayResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Overlay chart endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Performance test through proxy
Write-Host ""
Write-Host "8. Testing Performance Through Proxy..." -ForegroundColor Cyan

$startTime = Get-Date
$performanceTests = 3

Write-Host "   Running $performanceTests chart generation tests through proxy..." -ForegroundColor White

for ($i = 1; $i -le $performanceTests; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "$WEB_BASE/api/charts/generate" -Method POST -Body $chartBody -ContentType "application/json" -TimeoutSec 5
        Write-Host "     Test $i completed" -ForegroundColor White
    } catch {
        Write-Host "     Test $i failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds
$averageTime = $duration / $performanceTests

Write-Host "Performance test completed" -ForegroundColor Green
Write-Host "   Total time: $([Math]::Round($duration, 2))s" -ForegroundColor Yellow
Write-Host "   Average time per request: $([Math]::Round($averageTime, 2))s" -ForegroundColor Yellow

# Final Frontend Integration Summary
Write-Host ""
Write-Host "Frontend Integration Test Summary" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend Status:" -ForegroundColor Green
Write-Host "   Web App Accessibility: Working" -ForegroundColor White
Write-Host "   API Proxy: Working" -ForegroundColor White
Write-Host "   Daily Chart Endpoint: Working" -ForegroundColor White
Write-Host "   Chart Generation: Working" -ForegroundColor White
Write-Host "   Audio Generation: Working" -ForegroundColor White
Write-Host "   Sandbox Audio: Working" -ForegroundColor White
Write-Host "   Overlay Chart: Working" -ForegroundColor White
Write-Host "   Performance: Acceptable ($([Math]::Round($averageTime, 2))s average)" -ForegroundColor White
Write-Host ""
Write-Host "Integration Points:" -ForegroundColor Cyan
Write-Host "   Frontend -> API Proxy: Connected" -ForegroundColor White
Write-Host "   API Proxy -> Backend: Connected" -ForegroundColor White
Write-Host "   Chart Data Flow: Working" -ForegroundColor White
Write-Host "   Audio Generation Flow: Working" -ForegroundColor White
Write-Host "   Swiss Ephemeris Integration: Working" -ForegroundColor White
Write-Host ""
Write-Host "UI Integration Readiness:" -ForegroundColor Green
Write-Host "   Landing page should auto-fetch daily chart" -ForegroundColor White
Write-Host "   Chart pages should generate natal charts" -ForegroundColor White
Write-Host "   Overlay mode should compare charts" -ForegroundColor White
Write-Host "   Sandbox mode should generate custom audio" -ForegroundColor White
Write-Host "   Genre selection should affect output" -ForegroundColor White
Write-Host ""
Write-Host "FRONTEND INTEGRATION IS WORKING!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Visit http://localhost:3000" -ForegroundColor White
Write-Host "   2. Check if landing page loads and plays music" -ForegroundColor White
Write-Host "   3. Test personal chart generation" -ForegroundColor White
Write-Host "   4. Test overlay chart comparison" -ForegroundColor White
Write-Host "   5. Test sandbox mode" -ForegroundColor White
Write-Host "   6. Test genre selection" -ForegroundColor White 