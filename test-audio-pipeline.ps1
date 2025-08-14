# Audio Pipeline Test Script
# Run this after deployment to verify everything works

Write-Host "🎵 Testing Astradio Audio Pipeline..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "https://astradio-1.onrender.com"
$FRONTEND_URL = "https://astradio.vercel.app"

Write-Host "`n📋 Testing Configuration:" -ForegroundColor Yellow
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White

# Test 1: Backend Health
Write-Host "`n🔍 Test 1: Backend Health Check" -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend Health: $($health.status)" -ForegroundColor Green
    if ($health.swiss_ephemeris) {
        Write-Host "   Swiss Ephemeris: $($health.swiss_ephemeris)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Backend Health Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure the backend is deployed and running" -ForegroundColor Yellow
    exit 1
}

# Test 2: Available Genres
Write-Host "`n🎶 Test 2: Available Genres" -ForegroundColor Green
try {
    $genres = Invoke-RestMethod -Uri "$BACKEND_URL/api/genres" -Method GET -TimeoutSec 10
    Write-Host "✅ Available Genres: $($genres.genres -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "❌ Genres Fetch Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Daily Chart Generation
Write-Host "`n🌅 Test 3: Daily Chart Generation" -ForegroundColor Green
try {
    $chartData = @{
        date = (Get-Date).ToString("yyyy-MM-dd")
        location = @{
            latitude = 40.7128
            longitude = -74.0060
            timezone = -5
        }
    }
    
    $chartResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/daily" -Method POST -Body ($chartData | ConvertTo-Json -Depth 3) -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Daily Chart Generated Successfully" -ForegroundColor Green
    Write-Host "   Track ID: $($chartResponse.track_id)" -ForegroundColor White
    Write-Host "   Genre: $($chartResponse.audio_config.genre)" -ForegroundColor White
    Write-Host "   Tempo: $($chartResponse.audio_config.tempo)" -ForegroundColor White
    Write-Host "   Key: $($chartResponse.audio_config.key)" -ForegroundColor White
    Write-Host "   Duration: $($chartResponse.audio_config.duration)s" -ForegroundColor White
    
    # Check if planets were calculated
    if ($chartResponse.chart.planets) {
        $planetCount = ($chartResponse.chart.planets | Get-Member -MemberType NoteProperty).Count
        Write-Host "   Planets Calculated: $planetCount" -ForegroundColor White
    }
    
    # Check if planet mappings were generated
    if ($chartResponse.planet_mappings) {
        Write-Host "   Planet Mappings: $($chartResponse.planet_mappings.Count) mappings" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Daily Chart Generation Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error Details: $errorBody" -ForegroundColor Red
    }
}

# Test 4: Music Play Endpoint
Write-Host "`n🎵 Test 4: Music Play Endpoint" -ForegroundColor Green
try {
    $playData = @{
        track_id = "test_track_$(Get-Date -Format 'yyyyMMddHHmmss')"
        genre = "ambient"
    }
    
    $playResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/music/play" -Method POST -Body ($playData | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Music Play Endpoint Working" -ForegroundColor Green
    Write-Host "   Status: $($playResponse.data.status)" -ForegroundColor White
    Write-Host "   Message: $($playResponse.data.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Music Play Endpoint Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Frontend Accessibility
Write-Host "`n🌐 Test 5: Frontend Accessibility" -ForegroundColor Green
try {
    $frontendResponse = Invoke-WebRequest -Uri $FRONTEND_URL -Method GET -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
        Write-Host "   Status Code: $($frontendResponse.StatusCode)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Frontend returned status: $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend Accessibility Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure the frontend is deployed to Vercel" -ForegroundColor Yellow
}

# Test 6: CORS Configuration
Write-Host "`n🔒 Test 6: CORS Configuration" -ForegroundColor Green
try {
    $corsHeaders = Invoke-WebRequest -Uri "$BACKEND_URL/health" -Method OPTIONS -TimeoutSec 10
    if ($corsHeaders.Headers.'Access-Control-Allow-Origin') {
        Write-Host "✅ CORS is configured" -ForegroundColor Green
        Write-Host "   Allow-Origin: $($corsHeaders.Headers.'Access-Control-Allow-Origin')" -ForegroundColor White
    } else {
        Write-Host "⚠️ CORS headers not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ CORS Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor White
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor White

Write-Host "`n🎉 Audio Pipeline Test Complete!" -ForegroundColor Green
Write-Host "If all tests passed, your astrological audio engine is working correctly!" -ForegroundColor Green

Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit $FRONTEND_URL in your browser" -ForegroundColor White
Write-Host "2. Check the browser console for any errors" -ForegroundColor White
Write-Host "3. Try the audio generation feature" -ForegroundColor White
Write-Host "4. Verify that different genres produce different audio" -ForegroundColor White
