# PowerShell test script for Astradio Internal QA - Core Feature Validation
$API_BASE = 'http://localhost:3001'
$WEB_BASE = 'http://localhost:3000'

Write-Host "🧪 Testing Astradio Internal QA - Core Feature Validation" -ForegroundColor Green
Write-Host ""

# Test Results Tracking
$testResults = @{
    "Authentication" = @{
        "Signup" = $false
        "Login" = $false
        "Session Restore" = $false
        "Logout" = $false
    }
    "Chart Features" = @{
        "Chart A - Birth Input" = $false
        "Chart A - Rendering" = $false
        "Chart B - Auto Transit" = $false
        "Chart B - Toggle Sandbox" = $false
        "Chart B - Birth Input" = $false
        "Drag Drop Fallback" = $false
    }
    "Audio Generation" = @{
        "Genre Selector" = $false
        "Music Generation" = $false
        "Output Preview" = $false
        "Export MP3" = $false
        "Export WAV" = $false
    }
    "Subscription System" = @{
        "Usage Limits" = $false
        "Plan Enforcement" = $false
        "Stripe Test Flow" = $false
        "Upgrade Process" = $false
    }
    "Library System" = @{
        "Save Track" = $false
        "Retrieve Tracks" = $false
        "Delete Track" = $false
        "Export Track" = $false
    }
}

function Write-TestResult {
    param($Category, $Test, $Success, $Message)
    
    $testResults[$Category][$Test] = $Success
    $color = if ($Success) { "Green" } else { "Red" }
    $status = if ($Success) { "✅" } else { "❌" }
    
    Write-Host "$status $Category - $Test" -ForegroundColor $color
    if ($Message) {
        Write-Host "   $Message" -ForegroundColor Gray
    }
}

try {
    # 1. Test API Health
    Write-Host "1. Testing API Health..." -ForegroundColor Cyan
    $health = Invoke-WebRequest -Uri "$API_BASE/health" -Method GET
    Write-TestResult "System" "API Health" $true "API responding correctly"

    # 2. Test Authentication System
    Write-Host ""
    Write-Host "2. Testing Authentication System..." -ForegroundColor Cyan
    
    # Test user registration
    $registerData = @{
        email = "qa-test@astradio.com"
        password = "TestPassword123!"
        displayName = "QATester"
    } | ConvertTo-Json -Depth 3

    $registerResponse = Invoke-WebRequest -Uri "$API_BASE/api/auth/signup" -Method POST -Body $registerData -ContentType "application/json"
    $registerResult = $registerResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Authentication" "Signup" $registerResult.success "User ID: $($registerResult.data.user.id)"

    # Test user login
    $loginData = @{
        email = "qa-test@astradio.com"
        password = "TestPassword123!"
    } | ConvertTo-Json -Depth 3

    $loginResponse = Invoke-WebRequest -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    $token = $loginResult.data.token

    Write-TestResult "Authentication" "Login" $loginResult.success "Token received: $($token.Substring(0, 20))..."

    # Set headers for authenticated requests
    $headers = @{
        'Authorization' = "Bearer $token"
        'Content-Type' = 'application/json'
    }

    # Test session restore
    $profileResponse = Invoke-WebRequest -Uri "$API_BASE/api/auth/profile" -Method GET -Headers $headers
    $profileData = $profileResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Authentication" "Session Restore" $profileData.success "Profile retrieved successfully"

    # 3. Test Chart Features
    Write-Host ""
    Write-Host "3. Testing Chart Features..." -ForegroundColor Cyan
    
    # Test Chart A - Birth Input
    $birthData = @{
        date = "1990-05-15"
        time = "14:30"
        latitude = 40.7128
        longitude = -74.0060
        timezone = -5
    } | ConvertTo-Json -Depth 3

    $chartBody = @{
        birth_data = $birthData | ConvertFrom-Json
        mode = "moments"
    } | ConvertTo-Json -Depth 3

    $chartResponse = Invoke-WebRequest -Uri "$API_BASE/api/charts/generate" -Method POST -Body $chartBody -Headers $headers
    $chartData = $chartResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Chart Features" "Chart A - Birth Input" $chartData.success "Chart ID: $($chartData.data.chart.id)"

    # Test Chart A - Rendering (check if chart data is complete)
    $hasPlanets = $chartData.data.chart.planets -and $chartData.data.chart.planets.Count -gt 0
    Write-TestResult "Chart Features" "Chart A - Rendering" $hasPlanets "Planets: $($chartData.data.chart.planets.Count)"

    # Test Chart B - Auto Transit
    $transitResponse = Invoke-WebRequest -Uri "$API_BASE/api/daily/$(Get-Date -Format 'yyyy-MM-dd')" -Method GET
    $transitData = $transitResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Chart Features" "Chart B - Auto Transit" $transitData.success "Transit chart generated"

    # Test Chart B - Toggle Sandbox (simulate sandbox mode)
    $sandboxData = @{
        planets = @(
            @{ name = "Sun"; sign = "Aries"; degree = 15; retrograde = $false },
            @{ name = "Moon"; sign = "Taurus"; degree = 25; retrograde = $false }
        )
        mode = "sandbox"
    } | ConvertTo-Json -Depth 5

    $sandboxResponse = Invoke-WebRequest -Uri "$API_BASE/api/charts/generate" -Method POST -Body $sandboxData -Headers $headers
    $sandboxResult = $sandboxResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Chart Features" "Chart B - Toggle Sandbox" $sandboxResult.success "Sandbox chart created"

    # Test Drag Drop Fallback (simulate manual placement)
    $manualData = @{
        planets = @(
            @{ name = "Mercury"; sign = "Gemini"; degree = 10; retrograde = $false },
            @{ name = "Venus"; sign = "Cancer"; degree = 5; retrograde = $false }
        )
        mode = "manual"
    } | ConvertTo-Json -Depth 5

    $manualResponse = Invoke-WebRequest -Uri "$API_BASE/api/charts/generate" -Method POST -Body $manualData -Headers $headers
    $manualResult = $manualResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Chart Features" "Drag Drop Fallback" $manualResult.success "Manual placement working"

    # 4. Test Audio Generation
    Write-Host ""
    Write-Host "4. Testing Audio Generation..." -ForegroundColor Cyan
    
    # Test Genre Selector (check available genres)
    $genres = @("ambient", "techno", "classical", "lofi", "jazz", "experimental")
    $genreResponse = Invoke-WebRequest -Uri "$API_BASE/api/genres" -Method GET
    $genreData = $genreResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Audio Generation" "Genre Selector" $genreData.success "Available genres: $($genreData.data.Count)"

    # Test Music Generation
    $audioBody = @{
        chart_data = $chartData.data.chart
        mode = "moments"
        genre = "ambient"
    } | ConvertTo-Json -Depth 10

    $audioResponse = Invoke-WebRequest -Uri "$API_BASE/api/audio/sequential" -Method POST -Body $audioBody -Headers $headers
    $audioData = $audioResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Audio Generation" "Music Generation" $audioData.success "Session ID: $($audioData.data.session.id)"

    # Test Output Preview (check if audio URL is generated)
    $hasAudioUrl = $audioData.data.session.audio_url -and $audioData.data.session.audio_url.Length -gt 0
    Write-TestResult "Audio Generation" "Output Preview" $hasAudioUrl "Audio URL generated"

    # Test Export MP3
    $exportMP3Data = @{
        session_id = $audioData.data.session.id
        format = "mp3"
        metadata = @{
            title = "Test MP3 Export"
            exportedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    } | ConvertTo-Json -Depth 5

    $exportMP3Response = Invoke-WebRequest -Uri "$API_BASE/api/session/export" -Method POST -Body $exportMP3Data -Headers $headers
    $exportMP3Result = $exportMP3Response.Content | ConvertFrom-Json
    
    Write-TestResult "Audio Generation" "Export MP3" $exportMP3Result.success "MP3 export URL: $($exportMP3Result.data.download_url)"

    # Test Export WAV
    $exportWAVData = @{
        session_id = $audioData.data.session.id
        format = "wav"
        metadata = @{
            title = "Test WAV Export"
            exportedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    } | ConvertTo-Json -Depth 5

    $exportWAVResponse = Invoke-WebRequest -Uri "$API_BASE/api/session/export" -Method POST -Body $exportWAVData -Headers $headers
    $exportWAVResult = $exportWAVResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Audio Generation" "Export WAV" $exportWAVResult.success "WAV export URL: $($exportWAVResult.data.download_url)"

    # 5. Test Subscription System
    Write-Host ""
    Write-Host "5. Testing Subscription System..." -ForegroundColor Cyan
    
    # Test Usage Limits
    $usageResponse = Invoke-WebRequest -Uri "$API_BASE/api/subscriptions/usage" -Method GET -Headers $headers
    $usageData = $usageResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Subscription System" "Usage Limits" $usageData.success "Usage tracked: $($usageData.data.usage.chartGenerations) generations"

    # Test Plan Enforcement
    $accessData = @{
        feature = "chartGenerations"
    } | ConvertTo-Json -Depth 3

    $accessResponse = Invoke-WebRequest -Uri "$API_BASE/api/subscriptions/check-access" -Method POST -Body $accessData -Headers $headers
    $accessResult = $accessResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Subscription System" "Plan Enforcement" $accessResult.success "Access check: $($accessResult.data.hasAccess)"

    # Test Stripe Test Flow
    $checkoutData = @{
        planId = "pro"
    } | ConvertTo-Json -Depth 3

    $checkoutResponse = Invoke-WebRequest -Uri "$API_BASE/api/subscriptions/checkout" -Method POST -Body $checkoutData -Headers $headers
    $checkoutResult = $checkoutResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Subscription System" "Stripe Test Flow" $checkoutResult.success "Checkout session: $($checkoutResult.data.sessionId)"

    # Test Upgrade Process
    $upgradeData = @{
        planId = "pro"
        paymentMethod = "demo"
    } | ConvertTo-Json -Depth 3

    $upgradeResponse = Invoke-WebRequest -Uri "$API_BASE/api/subscriptions/upgrade" -Method POST -Body $upgradeData -Headers $headers
    $upgradeResult = $upgradeResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Subscription System" "Upgrade Process" $upgradeResult.success "Upgrade successful"

    # 6. Test Library System
    Write-Host ""
    Write-Host "6. Testing Library System..." -ForegroundColor Cyan
    
    # Test Save Track
    $saveTrackData = @{
        title = "QA Test Track"
        chartType = "daily"
        genre = "ambient"
        chartData = $chartData.data.chart
        interpretation = "A beautiful cosmic composition for testing"
        isPublic = false
    } | ConvertTo-Json -Depth 10

    $saveResponse = Invoke-WebRequest -Uri "$API_BASE/api/tracks/save" -Method POST -Body $saveTrackData -Headers $headers
    $saveResult = $saveResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Library System" "Save Track" $saveResult.success "Track saved: $($saveResult.data.track.id)"

    # Test Retrieve Tracks
    $tracksResponse = Invoke-WebRequest -Uri "$API_BASE/api/tracks" -Method GET -Headers $headers
    $tracksData = $tracksResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Library System" "Retrieve Tracks" $tracksData.success "Tracks retrieved: $($tracksData.data.Count)"

    # Test Export Track
    $exportTrackData = @{
        session_id = $saveResult.data.track.id
        format = "json"
        metadata = @{
            title = "Exported Track"
            exportedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    } | ConvertTo-Json -Depth 5

    $exportTrackResponse = Invoke-WebRequest -Uri "$API_BASE/api/session/export" -Method POST -Body $exportTrackData -Headers $headers
    $exportTrackResult = $exportTrackResponse.Content | ConvertFrom-Json
    
    Write-TestResult "Library System" "Export Track" $exportTrackResult.success "Track exported successfully"

    # 7. Test Web Interface
    Write-Host ""
    Write-Host "7. Testing Web Interface..." -ForegroundColor Cyan
    
    # Test main page accessibility
    try {
        $webResponse = Invoke-WebRequest -Uri "$WEB_BASE" -Method GET
        Write-TestResult "Web Interface" "Main Page" $true "Status: $($webResponse.StatusCode)"
    } catch {
        Write-TestResult "Web Interface" "Main Page" $false "Error: $($_.Exception.Message)"
    }

    # Test Audio Lab page
    try {
        $audioLabResponse = Invoke-WebRequest -Uri "$WEB_BASE/audio-lab" -Method GET
        Write-TestResult "Web Interface" "Audio Lab Page" $true "Status: $($audioLabResponse.StatusCode)"
    } catch {
        Write-TestResult "Web Interface" "Audio Lab Page" $false "Error: $($_.Exception.Message)"
    }

    # 8. Generate Test Report
    Write-Host ""
    Write-Host "8. Generating Test Report..." -ForegroundColor Cyan
    
    $totalTests = 0
    $passedTests = 0
    
    foreach ($category in $testResults.Keys) {
        foreach ($test in $testResults[$category].Keys) {
            $totalTests++
            if ($testResults[$category][$test]) {
                $passedTests++
            }
        }
    }
    
    $successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    
    Write-Host ""
    Write-Host "📊 INTERNAL QA TEST RESULTS" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host "Total Tests: $totalTests" -ForegroundColor White
    Write-Host "Passed: $passedTests" -ForegroundColor Green
    Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } else { "Yellow" })
    
    if ($successRate -ge 90) {
        Write-Host ""
        Write-Host "✅ INTERNAL QA PASSED - Ready for UI/UX Review" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ INTERNAL QA FAILED - Critical issues need fixing" -ForegroundColor Red
    }

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
} 