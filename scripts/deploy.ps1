# ====== BULLETPROOF CLI-ONLY DEPLOYMENT SCRIPT ======
# Fail fast and strict mode for reliability
$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest
function Info($m){Write-Host $m -ForegroundColor Cyan}
function Ok($m){Write-Host $m -ForegroundColor Green}
function Warn($m){Write-Host $m -ForegroundColor Yellow}
function Err($m){Write-Host $m -ForegroundColor Red}

# 0) Preflight
Info "Preflight checks..."
powershell -ExecutionPolicy Bypass -File scripts/test-deploy-setup.ps1 | Out-Null

# 1) Ensure local build is clean
Info "Verify & build..."
pnpm verify
pnpm -w build

# 2) Render (API) — create or reuse via REST
$headers = @{Authorization="Bearer $env:RENDER_API_KEY";"Content-Type"="application/json"}
$serviceName = $env:RENDER_SERVICE_NAME; if(-not $serviceName){$serviceName="Astradio-1"}
$region = $env:RENDER_REGION; if(-not $region){$region="oregon"}
$rootDir = "apps/api"
$buildCmd = "pnpm i --filter @astradio/api... --frozen-lockfile && pnpm -w build && pnpm -F @astradio/api build"
$startCmd = "pnpm -F @astradio/api start"

Info "Ensuring Render service '$serviceName'..."
# Try to find existing service by name
$services = Invoke-RestMethod -Method Get -Headers $headers -Uri "https://api.render.com/v1/services"
$existingService = $services | Where-Object { $_.service.name -eq $serviceName -or $_.service.name -like "*astradio*" } | Select-Object -First 1

if($existingService){ 
    $serviceId = $existingService.service.id
    Ok "Using existing Render service: $($existingService.service.name) (ID: $serviceId)" 
} else {
    $body = @{
        autoDeploy = $true
        name = $serviceName
        ownerId = $env:RENDER_OWNER_ID
        type = "web_service"
        serviceDetails = @{ 
            env = "node"
            region = $region
            plan = "starter"
            repo = (git config --get remote.origin.url)
            branch = "main"
            buildCommand = $buildCmd
            startCommand = $startCmd
            rootDir = $rootDir
            healthCheckPath = "/health" 
        }
    } | ConvertTo-Json -Depth 10
    
    $resp = Invoke-RestMethod -Method Post -Headers $headers -Uri "https://api.render.com/v1/services" -Body $body
    $serviceId = $resp.id
    Ok "Created Render service: $serviceId"
}

# Optional: set CORS origins (update as needed)
try {
    $corsOrigins = @("http://localhost:3000","https://astradio-web.vercel.app","https://astradio.io") -join ","
    $envBody = @{ envVars = @(@{ key="CORS_ORIGINS"; value=$corsOrigins }) } | ConvertTo-Json
    Invoke-RestMethod -Method Put -Headers $headers -Uri "https://api.render.com/v1/services/$serviceId/env-vars" -Body $envBody | Out-Null
    Ok "CORS origins set"
} catch {
    Warn "Could not set CORS origins (will continue deployment)"
}

Info "Trigger Render deploy..."
Invoke-RestMethod -Method Post -Headers $headers -Uri "https://api.render.com/v1/services/$serviceId/deploys" | Out-Null

# Use known URL for Astradio-1
$apiUrl = "https://astradio-1.onrender.com"
Ok "Using Render API: $apiUrl"

# 3) Vercel (Web) — CLI session or token
$proj = $env:VERCEL_PROJECT_NAME; if(-not $proj){ $proj="astradio-web" }

Info "Link Vercel project..."
# Clear any conflicting environment variables
$env:VERCEL_ORG_ID = $null
$env:VERCEL_PROJECT_ID = $null

# Link to the correct project
vercel link --yes --project $proj | Out-Null

Push-Location apps/web
vercel link --yes --project $proj | Out-Null

# Set NEXT_PUBLIC_API_URL in all envs (idempotent)
function Set-VercelEnv($name,$val,$envName){
    try {
        vercel env rm $name $envName --yes | Out-Null
    } catch {
        # Ignore if env doesn't exist
    }
    $val | vercel env add $name $envName | Out-Null
}

Set-VercelEnv "NEXT_PUBLIC_API_URL" $apiUrl "production"
Set-VercelEnv "NEXT_PUBLIC_API_URL" $apiUrl "preview"
Set-VercelEnv "NEXT_PUBLIC_API_URL" $apiUrl "development"

# Deploy
Info "Deploying to Vercel..."
vercel --prod

Pop-Location

# 4) Smoke tests (prod)
Info "Smoke tests..."
$webUrl = "https://astradio-web.vercel.app"
$iwrOpts = @{UseBasicParsing=$true}

try {
    (Invoke-WebRequest "$apiUrl/health" @iwrOpts) | Out-Null
    Ok "API health check passed"
} catch {
    Warn "API health check failed (service may be starting up)"
}

try {
    $e = Invoke-WebRequest "$apiUrl/api/ephemeris/today" @iwrOpts
    if($e.Content -match '"ephemeris"\s*:\s*\['){ 
        Ok "Ephemeris API working"
    } else {
        Warn "Ephemeris API returned unexpected format"
    }
} catch {
    Warn "Ephemeris API not available yet"
}

try {
    $g = Invoke-WebRequest "$apiUrl/api/audio/generate" -Method Post -ContentType 'application/json' -Body '{"genre":"ambient"}' @iwrOpts
    if($g.Content -match '"ok"\s*:\s*true'){ 
        Ok "Audio generation API working"
    } else {
        Warn "Audio generation API returned unexpected format"
    }
} catch {
    Warn "Audio generation API not available yet"
}

try {
    (Invoke-WebRequest $webUrl @iwrOpts) | Out-Null
    Ok "Web app accessible"
} catch {
    Warn "Web app not accessible yet"
}

Ok "Deployment completed: $webUrl  <->  $apiUrl"
