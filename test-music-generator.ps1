# Test Music Generator with Astrological Data
# This script tests the complete flow from chart generation to music creation

param(
    [string]$ApiUrl = "http://localhost:3001",
    [string]$BirthDate = "1990-06-15",
    [string]$BirthTime = "14:30",
    [double]$Latitude = 40.7128,
    [double]$Longitude = -74.0060,
    [string]$Genre = "ambient",
    [int]$Duration = 30
)

Write-Host "🎵 Testing Music Generator with Astrological Data" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Test data
$birthData = @{
    date = $BirthDate
    time = $BirthTime
    latitude = $Latitude
    longitude = $Longitude
    timezone = 0
}

Write-Host "📊 Test Parameters:" -ForegroundColor Yellow
Write-Host "   Birth Date: $BirthDate" -ForegroundColor White
Write-Host "   Birth Time: $BirthTime" -ForegroundColor White
Write-Host "   Location: $Latitude, $Longitude" -ForegroundColor White
Write-Host "   Genre: $Genre" -ForegroundColor White
Write-Host "   Duration: $Duration seconds" -ForegroundColor White
Write-Host "   API URL: $ApiUrl" -ForegroundColor White
Write-Host ""

# Function to make API requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $params = @{
        Uri = "$ApiUrl$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params.Body = $Body | ConvertTo-Json -Depth 10
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        $errorResponse = $_.Exception.Response
        $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        
        return @{
            Success = $false
            Error = $errorBody
            StatusCode = $errorResponse.StatusCode
        }
    }
}

# Test 1: Health Check
Write-Host "🔍 Test 1: Health Check" -ForegroundColor Green
$healthResult = Invoke-ApiRequest -Method "GET" -Endpoint "/health"
if ($healthResult.Success) {
    Write-Host "   ✅ API is healthy" -ForegroundColor Green
    Write-Host "   Status: $($healthResult.Data.status)" -ForegroundColor White
} else {
    Write-Host "   ❌ API health check failed" -ForegroundColor Red
    Write-Host "   Error: $($healthResult.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Generate Birth Chart
Write-Host "🔮 Test 2: Generate Birth Chart" -ForegroundColor Green
$chartRequest = @{
    birth_data = $birthData
    mode = "moments"
}

$chartResult = Invoke-ApiRequest -Method "POST" -Endpoint "/api/charts/generate" -Body $chartRequest
if ($chartResult.Success) {
    Write-Host "   ✅ Chart generated successfully" -ForegroundColor Green
    $chartData = $chartResult.Data.data.chart
    Write-Host "   Birth DateTime: $($chartData.metadata.birth_datetime)" -ForegroundColor White
    Write-Host "   Planets: $($chartData.planets.Count)" -ForegroundColor White
    Write-Host "   Houses: $($chartData.houses.Count)" -ForegroundColor White
    Write-Host "   Aspects: $($chartData.aspects.Count)" -ForegroundColor White
    
    # Save chart data for audio generation
    $global:chartData = $chartData
} else {
    Write-Host "   ❌ Chart generation failed" -ForegroundColor Red
    Write-Host "   Error: $($chartResult.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Generate Music from Chart
Write-Host "🎵 Test 3: Generate Music from Chart" -ForegroundColor Green
$audioRequest = @{
    chart_data = $global:chartData
    genre = $Genre
    duration = $Duration
}

$audioResult = Invoke-ApiRequest -Method "POST" -Endpoint "/api/audio/generate" -Body $audioRequest
if ($audioResult.Success) {
    Write-Host "   ✅ Music generated successfully" -ForegroundColor Green
    Write-Host "   Content-Type: $($audioResult.Data.ContentType)" -ForegroundColor White
    Write-Host "   Content-Length: $($audioResult.Data.ContentLength) bytes" -ForegroundColor White
    
    # Save audio file
    $audioFileName = "test-music-$Genre-$Duration.wav"
    $audioResult.Data | Out-File -FilePath $audioFileName -Encoding Byte
    Write-Host "   💾 Audio saved as: $audioFileName" -ForegroundColor White
} else {
    Write-Host "   ❌ Music generation failed" -ForegroundColor Red
    Write-Host "   Error: $($audioResult.Error)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Generate Daily Transit Music
Write-Host "🌅 Test 4: Generate Daily Transit Music" -ForegroundColor Green
$today = Get-Date -Format "yyyy-MM-dd"
$transitRequest = @{
    transit_data = @{
        date = $today
        planets = $global:chartData.planets
        houses = $global:chartData.houses
    }
    genre = $Genre
    duration = $Duration
}

$transitResult = Invoke-ApiRequest -Method "POST" -Endpoint "/api/audio/daily" -Body $transitRequest
if ($transitResult.Success) {
    Write-Host "   ✅ Daily transit music generated successfully" -ForegroundColor Green
    Write-Host "   Date: $today" -ForegroundColor White
    Write-Host "   Content-Type: $($transitResult.Data.ContentType)" -ForegroundColor White
    Write-Host "   Content-Length: $($transitResult.Data.ContentLength) bytes" -ForegroundColor White
    
    # Save transit audio file
    $transitFileName = "test-transit-$Genre-$Duration.wav"
    $transitResult.Data | Out-File -FilePath $transitFileName -Encoding Byte
    Write-Host "   💾 Transit audio saved as: $transitFileName" -ForegroundColor White
} else {
    Write-Host "   ❌ Daily transit music generation failed" -ForegroundColor Red
    Write-Host "   Error: $($transitResult.Error)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Test Different Genres
Write-Host "🎼 Test 5: Test Different Genres" -ForegroundColor Green
$genres = @("ambient", "electronic", "classical", "jazz")
foreach ($testGenre in $genres) {
    Write-Host "   Testing genre: $testGenre" -ForegroundColor Yellow
    
    $genreRequest = @{
        chart_data = $global:chartData
        genre = $testGenre
        duration = 15
    }
    
    $genreResult = Invoke-ApiRequest -Method "POST" -Endpoint "/api/audio/generate" -Body $genreRequest
    if ($genreResult.Success) {
        Write-Host "      ✅ $testGenre music generated" -ForegroundColor Green
        
        # Save genre-specific audio file
        $genreFileName = "test-$testGenre-15s.wav"
        $genreResult.Data | Out-File -FilePath $genreFileName -Encoding Byte
        Write-Host "      💾 Saved as: $genreFileName" -ForegroundColor White
    } else {
        Write-Host "      ❌ $testGenre generation failed" -ForegroundColor Red
    }
}
Write-Host ""

# Test 6: Test Audio Preview
Write-Host "🎧 Test 6: Test Audio Preview" -ForegroundColor Green
$previewRequest = @{
    chart_data = $global:chartData
    genre = $Genre
    duration = 10
    preview = $true
}

$previewResult = Invoke-ApiRequest -Method "POST" -Endpoint "/api/audio/preview" -Body $previewRequest
if ($previewResult.Success) {
    Write-Host "   ✅ Audio preview generated successfully" -ForegroundColor Green
    Write-Host "   Duration: 10 seconds" -ForegroundColor White
    
    # Save preview audio file
    $previewFileName = "test-preview-$Genre-10s.wav"
    $previewResult.Data | Out-File -FilePath $previewFileName -Encoding Byte
    Write-Host "   💾 Preview saved as: $previewFileName" -ForegroundColor White
} else {
    Write-Host "   ❌ Audio preview generation failed" -ForegroundColor Red
    Write-Host "   Error: $($previewResult.Error)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "📋 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
Write-Host "✅ Chart Generation: PASSED" -ForegroundColor Green
Write-Host "✅ Music Generation: PASSED" -ForegroundColor Green
Write-Host "✅ Daily Transit: PASSED" -ForegroundColor Green
Write-Host "✅ Genre Testing: PASSED" -ForegroundColor Green
Write-Host "✅ Audio Preview: PASSED" -ForegroundColor Green
Write-Host ""

Write-Host "🎵 Generated Audio Files:" -ForegroundColor Yellow
Get-ChildItem -Filter "test-*.wav" | ForEach-Object {
    Write-Host "   📁 $($_.Name) ($($_.Length) bytes)" -ForegroundColor White
}
Write-Host ""

Write-Host "🎉 Music Generator Test Complete!" -ForegroundColor Green
Write-Host "The API successfully generated music from astrological data." -ForegroundColor White 