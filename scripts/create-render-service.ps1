param(
  [string]$ServiceName = "astradio-api"
)

$ErrorActionPreference = "Stop"
if (-not $env:RENDER_API_KEY) { Write-Error "Set RENDER_API_KEY (User env)."; exit 1 }

$Headers = @{ Authorization = "Bearer $($env:RENDER_API_KEY)"; "Content-Type"="application/json" }
$Base = "https://api.render.com/v1"

Write-Host "Creating service '$ServiceName'..." -ForegroundColor Cyan

# Create service payload
$payload = @{
  name = $ServiceName
  type = "web_service"
  env = "node"
  rootDir = "."
  buildCommand = "corepack enable && pnpm install --frozen-lockfile && pnpm --filter api build"
  startCommand = "node apps/api/dist/app.js"
  repo = "https://github.com/Nickalas-Paul/Astradio"
  branch = "master"
  autoDeploy = $true
} | ConvertTo-Json

Write-Host "Creating service with configuration:" -ForegroundColor Yellow
Write-Host "  Name: $ServiceName" -ForegroundColor White
Write-Host "  Root Directory: ." -ForegroundColor White
Write-Host "  Build Command: corepack enable && pnpm install --frozen-lockfile && pnpm --filter api build" -ForegroundColor White
Write-Host "  Start Command: node apps/api/dist/app.js" -ForegroundColor White
Write-Host "  Repository: https://github.com/Nickalas-Paul/Astradio" -ForegroundColor White
Write-Host "  Branch: master" -ForegroundColor White

try {
  $service = Invoke-RestMethod -Method Post -Headers $Headers -Uri "$Base/services" -Body $payload
  Write-Host "✅ Service created successfully!" -ForegroundColor Green
  Write-Host "Service ID: $($service.id)" -ForegroundColor Cyan
  Write-Host "Service URL: $($service.serviceDetails.url)" -ForegroundColor Cyan
  
  Write-Host "`n🔧 Next steps:" -ForegroundColor Yellow
  Write-Host "1. Set environment variables in Render dashboard:" -ForegroundColor White
  Write-Host "   - NODE_VERSION: 20" -ForegroundColor White
  Write-Host "   - WEB_ORIGIN: https://astradio-web.vercel.app,https://astradio.io" -ForegroundColor White
  Write-Host "2. Deploy with: .\scripts\deploy-render-api.ps1" -ForegroundColor White
  
} catch {
  Write-Error "Failed to create service: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody" -ForegroundColor Red
  }
  exit 1
}
