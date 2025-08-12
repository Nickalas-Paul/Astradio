param(
  [string]$ServiceName = "astradio-api"
)

$ErrorActionPreference = "Stop"
if (-not $env:RENDER_API_KEY) { Write-Error "Set RENDER_API_KEY (User env)."; exit 1 }

$Headers = @{ Authorization = "Bearer $($env:RENDER_API_KEY)"; "Content-Type"="application/json" }
$Base = "https://api.render.com/v1"

Write-Host "Locating service '$ServiceName'..." -ForegroundColor Cyan
$services = Invoke-RestMethod -Headers $Headers -Uri "$Base/services?limit=100"
$svc = $services | Where-Object { $_.name -eq $ServiceName }
if (-not $svc) { Write-Error "Service '$ServiceName' not found. Create it once in the dashboard."; exit 1 }

# We build from the REPO ROOT so the workspace is visible.
# Start from root too, pointing to the API dist file.
$payload = @{
  rootDir      = "."
  buildCommand = "corepack enable && pnpm install --frozen-lockfile && pnpm --filter api build"
  startCommand = "node apps/api/dist/app.js"
} | ConvertTo-Json

Write-Host "Patching service build/start commands..." -ForegroundColor Yellow
Invoke-RestMethod -Method Patch -Headers $Headers -Uri "$Base/services/$($svc.id)" -Body $payload | Out-Null

Write-Host "✅ Service updated. Triggering fresh deploy..." -ForegroundColor Green
# Trigger deploy (clear cache)
$deploy = Invoke-RestMethod -Method Post -Headers $Headers -Uri "$Base/services/$($svc.id)/deploys" -Body (@{ clearCache = $true } | ConvertTo-Json)
$deployId = $deploy.id

# Poll deploy until live/failed
while ($true) {
  Start-Sleep -Seconds 6
  $d = Invoke-RestMethod -Headers $Headers -Uri "$Base/deploys/$deployId"
  $status = $d.status
  Write-Host ("Status: {0} @ {1}" -f $status, $d.updatedAt)
  if ($status -in @("live","succeeded")) { break }
  if ($status -in @("failed","canceled","deactivated")) {
    Write-Error ("Deploy {0}. Log: {1}" -f $status, $d.deployLogs)
    exit 2
  }
}

# Print final URL + health
$svc2 = Invoke-RestMethod -Headers $Headers -Uri "$Base/services/$($svc.id)"
$apiUrl = $svc2.serviceDetails.url
Write-Host ("✅ Deploy live. URL: {0}" -f $apiUrl) -ForegroundColor Green
try {
  $resp = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing -TimeoutSec 15
  Write-Host ("Health: {0}" -f $resp.StatusCode) -ForegroundColor Cyan
} catch {
  Write-Host "Health not 200 yet (still warming)." -ForegroundColor DarkYellow
}
