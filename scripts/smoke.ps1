$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$api = "https://astradio-1.onrender.com"
$web = "https://astradio-web.vercel.app"
$iwrOpts = @{UseBasicParsing=$true}

Write-Host "Running smoke tests..." -ForegroundColor Cyan

try {
    Invoke-WebRequest "$api/health" @iwrOpts | Out-Null
    Write-Host "API health check: PASSED" -ForegroundColor Green
} catch {
    Write-Host "API health check: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $e = Invoke-WebRequest "$api/api/ephemeris/today" @iwrOpts
    if ($e.Content -match '"ephemeris"\s*:\s*\[') {
        Write-Host "Ephemeris API: PASSED" -ForegroundColor Green
    } else {
        Write-Host "Ephemeris API: FAILED - Unexpected format" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Ephemeris API: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $g = Invoke-WebRequest "$api/api/audio/generate" -Method Post -ContentType 'application/json' -Body '{"genre":"ambient"}' @iwrOpts
    if ($g.Content -match '"ok"\s*:\s*true') {
        Write-Host "Audio generation API: PASSED" -ForegroundColor Green
    } else {
        Write-Host "Audio generation API: FAILED - Unexpected format" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Audio generation API: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    Invoke-WebRequest $web @iwrOpts | Out-Null
    Write-Host "Web app: PASSED" -ForegroundColor Green
} catch {
    Write-Host "Web app: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Smoke tests completed!" -ForegroundColor Cyan
Write-Host "API: $api" -ForegroundColor Blue
Write-Host "Web: $web" -ForegroundColor Blue
