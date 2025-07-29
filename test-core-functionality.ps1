# Core Functionality Test - Focus on Working Features
Write-Host "Core Functionality Test" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

$API_BASE = "http://localhost:3001"

# Test 1: Health Check
Write-Host "`nTest 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET
    Write-Host "PASS Health Check: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "FAIL Health Check: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Subscription Plans (no auth required)
Write-Host "`nTest 2: Subscription Plans" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/subscriptions/plans" -Method GET
    Write-Host "PASS Subscription Plans: $($response.data.Count) plans available" -ForegroundColor Green
} catch {
    Write-Host "FAIL Subscription Plans: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Public Sessions (no auth required)
Write-Host "`nTest 3: Public Sessions" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/sessions/public" -Method GET
    Write-Host "PASS Public Sessions: $($response.data.Count) sessions" -ForegroundColor Green
} catch {
    Write-Host "FAIL Public Sessions: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Daily Charts
Write-Host "`nTest 4: Daily Charts" -ForegroundColor Yellow
try {
    $today = Get-Date -Format "yyyy-MM-dd"
    $response = Invoke-RestMethod -Uri "$API_BASE/api/daily/$today" -Method GET
    Write-Host "PASS Daily Charts: Chart generated for $today" -ForegroundColor Green
} catch {
    Write-Host "FAIL Daily Charts: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Audio Status
Write-Host "`nTest 5: Audio Status" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/audio/status" -Method GET
    Write-Host "PASS Audio Status: $($response.data.isPlaying)" -ForegroundColor Green
} catch {
    Write-Host "FAIL Audio Status: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Error Handling
Write-Host "`nTest 6: Error Handling" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/nonexistent" -Method GET
    Write-Host "FAIL Error Handling: Should have returned 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "PASS Error Handling: 404 returned correctly" -ForegroundColor Green
    } else {
        Write-Host "FAIL Error Handling: Unexpected status $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`nCore Functionality Test Complete!" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan 