# ====== DEPLOYMENT ROLLBACK SCRIPT ======
# Quickly rollback to previous deployment if issues arise
# Usage: . scripts/rollback.ps1 [web|api|both]

param([ValidateSet("web","api","both")][string]$target="both")
$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest
function Ok($m){Write-Host $m -ForegroundColor Green}

if($target -in @("web","both")){
  # Roll back to previous Vercel deployment
  $proj=$env:VERCEL_PROJECT_NAME
  if(-not $proj){$proj="astradio-web"}
  vercel rollback --safe --yes $(if($env:VERCEL_TOKEN){"--token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID"})
  Ok "Web rollback issued"
}
if($target -in @("api","both")){
  Write-Host "Use Render: redeploy previous commit or prior deploy id (manual step via API call if you store deploy ids)."
}
