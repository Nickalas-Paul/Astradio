$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

function Write-Ok($m){Write-Host $m -ForegroundColor Green}
function Write-Warn($m){Write-Host $m -ForegroundColor Yellow}
function Write-Info($m){Write-Host $m -ForegroundColor Cyan}
function Write-Err($m){Write-Host $m -ForegroundColor Red}

Write-Info "Astradio Deployment Status"
Write-Host "=========================" -ForegroundColor White

# Load environment
if (Test-Path "scripts/deploy.env") {
    (Get-Content "scripts/deploy.env") | ForEach-Object {
        if ($_ -match "^\s*#") { return }
        $i = $_.IndexOf("=")
        if ($i -gt 0) {
            $k = $_.Substring(0, $i).Trim()
            $v = $_.Substring($i + 1).Trim()
            if ($k) {
                [Environment]::SetEnvironmentVariable($k, $v, "Process")
            }
        }
    }
    Write-Ok "Loaded env from scripts/deploy.env"
}

# Check environment configuration
Write-Info "Environment Configuration:"
if ($env:RENDER_API_KEY) {
    Write-Ok "RENDER_API_KEY: Configured"
} else {
    Write-Err "RENDER_API_KEY: Not configured"
}

if ($env:RENDER_OWNER_ID) {
    Write-Ok "RENDER_OWNER_ID: $($env:RENDER_OWNER_ID)"
} else {
    Write-Warn "RENDER_OWNER_ID: Will be auto-detected or prompted"
}

if ($env:VERCEL_TOKEN) {
    Write-Ok "VERCEL_TOKEN: Configured"
} else {
    Write-Warn "VERCEL_TOKEN: Will use 'vercel login' session"
}

if ($env:VERCEL_ORG_ID) {
    Write-Ok "VERCEL_ORG_ID: $($env:VERCEL_ORG_ID)"
} else {
    Write-Warn "VERCEL_ORG_ID: Will be auto-detected or prompted"
}

# Check deployment readiness
Write-Host ""
Write-Info "Deployment Readiness:"
if (-not $env:RENDER_API_KEY) {
    Write-Err "Cannot deploy: RENDER_API_KEY required"
    Write-Host ""
    Write-Info "Setup Required:"
    Write-Info "1. Get Render API key from: https://render.com/docs/api#authentication"
    Write-Info "2. Run: . scripts/load-deploy-env.ps1"
    Write-Info "3. Enter your Render API key when prompted"
    exit 1
} else {
    Write-Ok "Ready to deploy!"
}

# Check current deployment status
Write-Host ""
Write-Info "Current Deployment Status:"

# API Status
$apiUrl = "https://astradio-1.onrender.com"
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Ok "API: $apiUrl - HEALTHY"
    } else {
        Write-Warn "API: $apiUrl - Status: $($response.StatusCode)"
    }
} catch {
    Write-Err "API: $apiUrl - UNREACHABLE ($($_.Exception.Message))"
}

# Web App Status
$webUrl = "https://astradio-web.vercel.app"
try {
    $response = Invoke-WebRequest -Uri $webUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Ok "Web: $webUrl - HEALTHY"
    } else {
        Write-Warn "Web: $webUrl - Status: $($response.StatusCode)"
    }
} catch {
    Write-Err "Web: $webUrl - UNREACHABLE ($($_.Exception.Message))"
}

# Check Vercel project status
Write-Host ""
Write-Info "Vercel Project Status:"
try {
    $projects = vercel projects 2>$null
    if ($projects -match "astradio") {
        Write-Ok "Vercel project found: astradio"
    } else {
        Write-Warn "Vercel project 'astradio' not found"
    }
} catch {
    Write-Warn "Could not check Vercel projects"
}

# Check environment variables
Write-Host ""
Write-Info "Environment Variables:"
try {
    $envVars = vercel env ls 2>$null
    if ($envVars -match "NEXT_PUBLIC_API_URL") {
        Write-Ok "NEXT_PUBLIC_API_URL: Configured"
    } else {
        Write-Warn "NEXT_PUBLIC_API_URL: Not configured"
    }
} catch {
    Write-Warn "Could not check Vercel environment variables"
}

Write-Host ""
Write-Info "Next Steps:"
Write-Info "• Deploy: . scripts/load-deploy-env.ps1; powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1"
Write-Info "• Smoke Test: powershell -ExecutionPolicy Bypass -File scripts/smoke.ps1"
Write-Info "• Rollback: powershell -ExecutionPolicy Bypass -File scripts/rollback.ps1"
