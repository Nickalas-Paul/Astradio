# Production Communication Test Script for Astradio
# Tests backend/frontend communication and domain integration

Write-Host "🌐 Testing Astradio Production Communication" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuration
$ProductionAPI = "https://astradio.vercel.app/api"
$ProductionSite = "https://astradio.io"
$StagingAPI = "https://astradio-staging.vercel.app/api"

# Function to test API endpoint
function Test-APIEndpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "`nTesting: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ PASS - Status: $($response.StatusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ⚠️  WARNING - Status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "   ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test CORS headers
function Test-CORSHeaders {
    param(
        [string]$Url,
        [string]$Origin
    )
    
    Write-Host "`nTesting CORS for: $Origin" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Origin" = $Origin
        }
        
        $response = Invoke-WebRequest -Uri $Url -Method OPTIONS -Headers $headers -TimeoutSec 10
        
        $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
        if ($corsHeader -and ($corsHeader -eq "*" -or $corsHeader -eq $Origin)) {
            Write-Host "   ✅ CORS configured correctly" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ❌ CORS not configured for $Origin" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test environment variables
function Test-EnvironmentVariables {
    Write-Host "`nTesting Environment Variables" -ForegroundColor Yellow
    
    $requiredVars = @(
        "NEXT_PUBLIC_API_URL",
        "NODE_ENV"
    )
    
    $allGood = $true
    
    foreach ($var in $requiredVars) {
        $value = [Environment]::GetEnvironmentVariable($var)
        if ($value) {
            Write-Host "   ✅ $var = $value" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $var not set" -ForegroundColor Red
            $allGood = $false
        }
    }
    
    return $allGood
}

# Function to test domain accessibility
function Test-DomainAccess {
    param(
        [string]$Domain,
        [string]$Description
    )
    
    Write-Host "`nTesting Domain: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Domain" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Domain -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Domain accessible" -ForegroundColor Green
            return $true
        } else {
            Write-Host "   ⚠️  Domain accessible but status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "   ❌ Domain not accessible: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test API functionality
function Test-APIFunctionality {
    param(
        [string]$BaseUrl
    )
    
    Write-Host "`nTesting API Functionality" -ForegroundColor Yellow
    
    # Test health endpoint
    $healthUrl = "$BaseUrl/health"
    $healthResult = Test-APIEndpoint -Url $healthUrl -Description "Health Check"
    
    # Test daily chart endpoint
    $today = Get-Date -Format "yyyy-MM-dd"
    $dailyUrl = "$BaseUrl/daily/$today"
    $dailyResult = Test-APIEndpoint -Url $dailyUrl -Description "Daily Chart"
    
    return $healthResult -and $dailyResult
}

# Main test execution
Write-Host "`n🔍 Starting Production Communication Tests..." -ForegroundColor Cyan

# Test 1: Environment Variables
$envTest = Test-EnvironmentVariables

# Test 2: Production API Health
$prodApiHealth = Test-APIEndpoint -Url "$ProductionAPI/health" -Description "Production API Health"

# Test 3: Staging API Health (if available)
$stagingApiHealth = Test-APIEndpoint -Url "$StagingAPI/health" -Description "Staging API Health"

# Test 4: CORS Configuration
$corsTest1 = Test-CORSHeaders -Url "$ProductionAPI/health" -Origin "https://astradio.io"
$corsTest2 = Test-CORSHeaders -Url "$ProductionAPI/health" -Origin "https://www.astradio.io"

# Test 5: Domain Accessibility
$domainTest1 = Test-DomainAccess -Domain "https://astradio.io" -Description "Main Domain"
$domainTest2 = Test-DomainAccess -Domain "https://www.astradio.io" -Description "WWW Subdomain"

# Test 6: API Functionality
$apiFunctionality = Test-APIFunctionality -BaseUrl $ProductionAPI

# Summary Report
Write-Host "`n📊 Production Communication Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$tests = @(
    @{ Name = "Environment Variables"; Status = $envTest },
    @{ Name = "Production API Health"; Status = $prodApiHealth },
    @{ Name = "Staging API Health"; Status = $stagingApiHealth },
    @{ Name = "CORS (astradio.io)"; Status = $corsTest1 },
    @{ Name = "CORS (www.astradio.io)"; Status = $corsTest2 },
    @{ Name = "Domain (astradio.io)"; Status = $domainTest1 },
    @{ Name = "Domain (www.astradio.io)"; Status = $domainTest2 },
    @{ Name = "API Functionality"; Status = $apiFunctionality }
)

$passed = ($tests | Where-Object { $_.Status }).Count
$total = $tests.Count

Write-Host "`nResults: $passed/$total tests passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

foreach ($test in $tests) {
    $status = if ($test.Status) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($test.Status) { "Green" } else { "Red" }
    Write-Host "   $($test.Name): $status" -ForegroundColor $color
}

# Recommendations
Write-Host "`n🎯 Recommendations:" -ForegroundColor Cyan

if ($passed -eq $total) {
    Write-Host "✅ All systems operational! Ready for production use." -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "1. Begin beta testing with live domain" -ForegroundColor White
    Write-Host "2. Monitor error logs and performance" -ForegroundColor White
    Write-Host "3. Set up analytics and user tracking" -ForegroundColor White
    Write-Host "4. Prepare for public launch" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues detected. Review failed tests above." -ForegroundColor Yellow
    Write-Host "`nTroubleshooting Steps:" -ForegroundColor Cyan
    Write-Host "1. Check DNS configuration" -ForegroundColor White
    Write-Host "2. Verify Vercel deployment" -ForegroundColor White
    Write-Host "3. Review CORS settings" -ForegroundColor White
    Write-Host "4. Check environment variables" -ForegroundColor White
}

Write-Host "`n🌐 Domain Integration Status:" -ForegroundColor Cyan
if ($domainTest1 -and $domainTest2) {
    Write-Host "✅ astradio.io domain integration complete" -ForegroundColor Green
} else {
    Write-Host "❌ Domain integration needs attention" -ForegroundColor Red
}

Write-Host "`n🔒 Security Status:" -ForegroundColor Cyan
if ($corsTest1 -and $corsTest2) {
    Write-Host "✅ CORS properly configured for production domains" -ForegroundColor Green
} else {
    Write-Host "❌ CORS configuration needs review" -ForegroundColor Red
}

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor Gray 