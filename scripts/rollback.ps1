$ErrorActionPreference = "Stop"; Set-StrictMode -Version Latest
if (-not $env:VERCEL_TOKEN -or -not $env:VERCEL_ORG_ID) { throw "Load env first (scripts/load-deploy-env.ps1)." }
# Roll back to previous prod deployment
$ids = vercel ls --prod --token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID | Select-String -Pattern "https://.*vercel.app" | ForEach-Object {$_.ToString().Trim()}
if ($ids.Count -lt 2) { throw "Not enough prod deployments to rollback." }
$prev = $ids[1].Split()[-1]
Write-Host "Rollback target: $prev"
vercel alias set $prev astradio-web --token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID
Write-Host "Rollback done."
