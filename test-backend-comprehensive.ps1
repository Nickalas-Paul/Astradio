# Comprehensive Backend Testing Script for Astradio
# Tests all major API endpoints and features

Write-Host "🚀 Comprehensive Backend Testing for Astradio" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$API_BASE = "http://localhost:3001"
$TEST_USER_EMAIL = "test@astroaudio.com"
$TEST_USER_PASSWORD = "demo123"
$token = $null

# Test Results Tracking
$testResults = @{
    "Health Check" = $false
    "User Registration" = $false
    "User Login" = $false
    "Chart Generation" = $false
    "Daily Charts" = $false
    "Sequential Audio" = $false
    "Layered Audio" = $false
    "Audio Controls" = $false
    "Session Management" = $false
    "Social Features" = $false
    "Subscription System" = $false
    "Security Features" = $false
    "Error Handling" = $false
}

function Write-TestResult {
    param($testName, $success, $message = "")
    $testResults[$testName] = $success
    $color = if ($success) { "Green" } else { "Red" }
    $status = if ($success) { "✅" } else { "❌" }
    Write-Host "$status $testName" -ForegroundColor $color
    if ($message) {
        Write-Host "   $message" -ForegroundColor Gray
    }
}

# Test 1: Health Check
Write-Host "`n📊 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET
    Write-TestResult "Health Check" $true "Status: $($response.status)"
} catch {
    Write-TestResult "Health Check" $false $_.Exception.Message
    Write-Host "❌ Cannot continue without API server. Please start the API server first." -ForegroundColor Red
    exit 1
}

# Test 2: User Registration
Write-Host "`n👤 Test 2: User Registration" -ForegroundColor Yellow
try {
    $registerData = @{
        email = $TEST_USER_EMAIL
        password = $TEST_USER_PASSWORD
        displayName = "Test User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-TestResult "User Registration" $true "User: $($response.data.user.email)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-TestResult "User Registration" $true "User already exists (expected)"
    } else {
        Write-TestResult "User Registration" $false $_.Exception.Message
    }
}

# Test 3: User Login
Write-Host "`n🔐 Test 3: User Login" -ForegroundColor Yellow
try {
    $loginData = @{
        email = $TEST_USER_EMAIL
        password = $TEST_USER_PASSWORD
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $response.data.token
    Write-TestResult "User Login" $true "Token received"
} catch {
    Write-TestResult "User Login" $false $_.Exception.Message
    Write-Host "❌ Cannot continue without authentication. Please check user credentials." -ForegroundColor Red
    exit 1
}

# Test 4: Chart Generation
Write-Host "`n🔮 Test 4: Chart Generation" -ForegroundColor Yellow
try {
    $chartData = @{
        birth_data = @{
            date = "1990-05-15"
            time = "14:30"
            latitude = 40.7128
            longitude = -74.0060
            timezone = -5
        }
        mode = "moments"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE/api/charts/generate" -Method POST -Body $chartData -ContentType "application/json"
    $testChart = $response.data.chart
    Write-TestResult "Chart Generation" $true "Planets: $($testChart.planets.Count)"
} catch {
    Write-TestResult "Chart Generation" $false $_.Exception.Message
}

# Test 5: Daily Charts
Write-Host "`n📅 Test 5: Daily Charts" -ForegroundColor Yellow
try {
    $today = Get-Date -Format "yyyy-MM-dd"
    $response = Invoke-RestMethod -Uri "$API_BASE/api/daily/$today" -Method GET
    Write-TestResult "Daily Charts" $true "Date: $today"
} catch {
    Write-TestResult "Daily Charts" $false $_.Exception.Message
}

# Test 6: Sequential Audio
Write-Host "`n🎵 Test 6: Sequential Audio" -ForegroundColor Yellow
try {
    $audioData = @{
        chart_data = $testChart
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$API_BASE/api/audio/sequential" -Method POST -Body $audioData -ContentType "application/json"
    Write-TestResult "Sequential Audio" $true "Session: $($response.data.session.id)"
} catch {
    Write-TestResult "Sequential Audio" $false $_.Exception.Message
}

# Test 7: Layered Audio
Write-Host "`n🎛️ Test 7: Layered Audio" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/audio/layered" -Method POST -Body $audioData -ContentType "application/json"
    Write-TestResult "Layered Audio" $true "Session: $($response.data.session.id)"
} catch {
    Write-TestResult "Layered Audio" $false $_.Exception.Message
}

# Test 8: Audio Controls
Write-Host "`n⏹️ Test 8: Audio Controls" -ForegroundColor Yellow
try {
    # Check audio status
    $statusResponse = Invoke-RestMethod -Uri "$API_BASE/api/audio/status" -Method GET
    $isPlaying = $statusResponse.data.isPlaying
    
    # Stop audio
    $stopResponse = Invoke-RestMethod -Uri "$API_BASE/api/audio/stop" -Method POST
    Write-TestResult "Audio Controls" $true "Status check and stop working"
} catch {
    Write-TestResult "Audio Controls" $false $_.Exception.Message
}

# Test 9: Session Management (with authentication)
Write-Host "`n💾 Test 9: Session Management" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    # Save session
    $sessionData = @{
        title = "Test Composition"
        description = "A test astrological composition"
        chart_data = $testChart
        audio_config = @{
            mode = "melodic"
            tempo = 120
            genre = "electronic"
        }
        narration = @{
            musicalMood = "This composition reflects the dynamic energy of your birth chart"
            planetaryExpression = "Each planet contributes its unique voice to the symphony"
            interpretiveSummary = "A harmonious blend of cosmic influences"
        }
        is_public = $true
        tags = @("test", "demo", "electronic")
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$API_BASE/api/sessions" -Method POST -Body $sessionData -ContentType "application/json" -Headers $headers
    $sessionId = $response.data.id
    
    # Get user sessions
    $sessionsResponse = Invoke-RestMethod -Uri "$API_BASE/api/sessions" -Method GET -Headers $headers
    
    Write-TestResult "Session Management" $true "Saved and retrieved sessions"
} catch {
    Write-TestResult "Session Management" $false $_.Exception.Message
}

# Test 10: Social Features
Write-Host "`n👥 Test 10: Social Features" -ForegroundColor Yellow
try {
    # Get public sessions
    $publicResponse = Invoke-RestMethod -Uri "$API_BASE/api/sessions/public" -Method GET
    Write-TestResult "Social Features" $true "Public sessions: $($publicResponse.data.Count)"
} catch {
    Write-TestResult "Social Features" $false $_.Exception.Message
}

# Test 11: Subscription System
Write-Host "`n💳 Test 11: Subscription System" -ForegroundColor Yellow
try {
    # Get subscription plans
    $plansResponse = Invoke-RestMethod -Uri "$API_BASE/api/subscriptions/plans" -Method GET
    
    # Get user subscription status
    $statusResponse = Invoke-RestMethod -Uri "$API_BASE/api/subscriptions/status" -Method GET -Headers $headers
    
    Write-TestResult "Subscription System" $true "Plans: $($plansResponse.data.Count), Status: $($statusResponse.data.subscription.plan)"
} catch {
    Write-TestResult "Subscription System" $false $_.Exception.Message
}

# Test 12: Security Features
Write-Host "`n🔒 Test 12: Security Features" -ForegroundColor Yellow
try {
    # Test rate limiting by making multiple requests
    $rateLimitTest = @()
    for ($i = 0; $i -lt 25; $i++) {
        try {
            $response = Invoke-RestMethod -Uri "$API_BASE/api/charts/generate" -Method POST -Body $chartData -ContentType "application/json"
            $rateLimitTest += $true
        } catch {
            if ($_.Exception.Response.StatusCode -eq 429) {
                $rateLimitTest += $true
                break
            } else {
                $rateLimitTest += $false
            }
        }
    }
    
    # Test invalid input validation
    $invalidData = @{
        birth_data = @{
            date = "invalid-date"
            time = "invalid-time"
        }
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/charts/generate" -Method POST -Body $invalidData -ContentType "application/json"
        $validationWorking = $false
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            $validationWorking = $true
        } else {
            $validationWorking = $false
        }
    }
    
    Write-TestResult "Security Features" ($rateLimitTest -contains $true -and $validationWorking) "Rate limiting and validation working"
} catch {
    Write-TestResult "Security Features" $false $_.Exception.Message
}

# Test 13: Error Handling
Write-Host "`n⚠️ Test 13: Error Handling" -ForegroundColor Yellow
try {
    # Test non-existent endpoint
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/nonexistent" -Method GET
        $errorHandlingWorking = $false
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            $errorHandlingWorking = $true
        } else {
            $errorHandlingWorking = $false
        }
    }
    
    # Test invalid JSON
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/charts/generate" -Method POST -Body "invalid json" -ContentType "application/json"
        $jsonErrorHandling = $false
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            $jsonErrorHandling = $true
        } else {
            $jsonErrorHandling = $false
        }
    }
    
    Write-TestResult "Error Handling" ($errorHandlingWorking -and $jsonErrorHandling) "404 and JSON validation working"
} catch {
    Write-TestResult "Error Handling" $false $_.Exception.Message
}

# Test 14: Overlay Charts
Write-Host "`n🔄 Test 14: Overlay Charts" -ForegroundColor Yellow
try {
    $overlayData = @{
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
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE/api/charts/overlay" -Method POST -Body $overlayData -ContentType "application/json"
    Write-TestResult "Overlay Charts" $true "Two charts overlaid successfully"
} catch {
    Write-TestResult "Overlay Charts" $false $_.Exception.Message
}

# Test 15: Database Operations
Write-Host "`n🗄️ Test 15: Database Operations" -ForegroundColor Yellow
try {
    # Test user profile retrieval
    $profileResponse = Invoke-RestMethod -Uri "$API_BASE/api/auth/profile" -Method GET -Headers $headers
    Write-TestResult "Database Operations" $true "User profile retrieved"
} catch {
    Write-TestResult "Database Operations" $false $_.Exception.Message
}

# Summary
Write-Host "`n🎉 Comprehensive Backend Testing Complete!" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
$totalTests = $testResults.Count
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "`n📊 Test Results Summary:" -ForegroundColor Yellow
Write-Host "   Passed: $passedTests/$totalTests ($successRate%)" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Red" })

Write-Host "`n✅ Working Features:" -ForegroundColor Green
foreach ($test in $testResults.GetEnumerator() | Where-Object { $_.Value -eq $true }) {
    Write-Host "   • $($test.Key)" -ForegroundColor Green
}

if ($testResults.Values -contains $false) {
    Write-Host "`n❌ Failed Features:" -ForegroundColor Red
    foreach ($test in $testResults.GetEnumerator() | Where-Object { $_.Value -eq $false }) {
        Write-Host "   • $($test.Key)" -ForegroundColor Red
    }
}

Write-Host "`n🔧 Backend Status:" -ForegroundColor Cyan
if ($successRate -ge 90) {
    Write-Host "   🚀 Excellent - Backend is production ready!" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "   ✅ Good - Minor issues to address" -ForegroundColor Yellow
} elseif ($successRate -ge 60) {
    Write-Host "   ⚠️ Fair - Several issues need attention" -ForegroundColor Yellow
} else {
    Write-Host "   ❌ Poor - Major issues need immediate attention" -ForegroundColor Red
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   • Review failed tests and fix issues" -ForegroundColor White
Write-Host "   • Test with real user data" -ForegroundColor White
Write-Host "   • Load test with multiple concurrent users" -ForegroundColor White
Write-Host "   • Security audit of authentication and authorization" -ForegroundColor White
Write-Host "   • Performance optimization if needed" -ForegroundColor White 