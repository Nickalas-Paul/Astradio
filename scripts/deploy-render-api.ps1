param(
  [string]$ServiceName = "astradio-api",   # matches render.yaml name
  [int]$PollSeconds = 6
)

$ErrorActionPreference = "Stop"
if (-not $env:RENDER_API_KEY) { Write-Error "Set RENDER_API_KEY env var."; exit 1 }

$Headers = @{ Authorization = "Bearer $($env:RENDER_API_KEY)"; "Content-Type"="application/json" }
$Base = "https://api.render.com/v1"

Write-Host "Looking up service '$ServiceName'..." -ForegroundColor Cyan
$services = Invoke-RestMethod -Method Get -Headers $Headers -Uri "$Base/services?limit=100"
$svc = $services | Where-Object { $_.name -eq $ServiceName }
if (-not $svc) { Write-Error "Service '$ServiceName' not found. Create it once from render.yaml in the dashboard."; exit 1 }

Write-Host "Triggering deploy for $($svc.id)..." -ForegroundColor Yellow
$deploy = Invoke-RestMethod -Method Post -Headers $Headers -Uri "$Base/services/$($svc.id)/deploys" -Body (@{ clearCache = $true } | ConvertTo-Json)
$deployId = $deploy.id
Write-Host "Deploy created: $deployId" -ForegroundColor Green

# Poll until live/failed
while ($true) {
  Start-Sleep -Seconds $PollSeconds
  $d = Invoke-RestMethod -Method Get -Headers $Headers -Uri "$Base/deploys/$deployId"
  $status = $d.status
  Write-Host ("Status: {0} @ {1}" -f $status, $d.updatedAt)
  if ($status -in @("live","succeeded")) { break }
  if ($status -in @("failed","canceled","deactivated")) { Write-Error "Deploy $status"; exit 2 }
}

# Fetch service details (URL)
$svc2 = Invoke-RestMethod -Method Get -Headers $Headers -Uri "$Base/services/$($svc.id)"
$apiUrl = $svc2.serviceDetails.url
Write-Host ("✅ Deploy live. Service URL: {0}" -f $apiUrl) -ForegroundColor Green

# Quick health check (non-fatal)
try {
  $resp = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing -TimeoutSec 15
  Write-Host ("Health: {0}" -f $resp.StatusCode) -ForegroundColor Cyan
} catch {
  Write-Host "Health check did not return 200 yet (may still be warming)." -ForegroundColor DarkYellow
}
