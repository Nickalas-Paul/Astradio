$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest
function Write-Info($m){Write-Host $m -ForegroundColor Cyan}
function Write-Ok($m){Write-Host $m -ForegroundColor Green}
function Write-Warn($m){Write-Host $m -ForegroundColor Yellow}

Write-Info "Testing auto-discovery functionality..."

# Load environment with auto-discovery
. scripts/load-deploy-env.ps1

Write-Info "Current environment variables:"
Write-Host "RENDER_API_KEY: $([Environment]::GetEnvironmentVariable('RENDER_API_KEY', 'Process') -replace '.{4}$', '****')" -ForegroundColor Gray
Write-Host "RENDER_OWNER_ID: $([Environment]::GetEnvironmentVariable('RENDER_OWNER_ID', 'Process'))" -ForegroundColor Gray
Write-Host "VERCEL_TOKEN: $([Environment]::GetEnvironmentVariable('VERCEL_TOKEN', 'Process') -replace '.{4}$', '****')" -ForegroundColor Gray
Write-Host "VERCEL_ORG_ID: $([Environment]::GetEnvironmentVariable('VERCEL_ORG_ID', 'Process'))" -ForegroundColor Gray

Write-Info "Auto-discovery test complete!"
