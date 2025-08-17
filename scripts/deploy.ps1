$ErrorActionPreference = "Stop"; Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSCommandPath
. (Join-Path $root "load-deploy-env.ps1")

# Link to single Vercel project
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
vercel link --project astradio-web --yes --scope $env:VERCEL_ORG_ID --token $env:VERCEL_TOKEN | Out-Null

# Set envs idempotently for ALL envs
foreach ($envName in @("production","preview","development")) {
  vercel env rm NEXT_PUBLIC_API_URL $envName --yes --token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID 2>$null | Out-Null
  $env:NEXT_PUBLIC_API_URL | vercel env add NEXT_PUBLIC_API_URL $envName --token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID | Out-Null
}
vercel env ls --token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID

# Build monorepo and deploy prebuilt
pnpm verify
pnpm -w build
vercel build --token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID
$deployUrl = vercel deploy --prebuilt --prod --yes --token $env:VERCEL_TOKEN --scope $env:VERCEL_ORG_ID
Write-Host "Vercel production URL: $deployUrl"

# Basic smoke
Invoke-WebRequest -Uri "$deployUrl" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri "$($env:NEXT_PUBLIC_API_URL)/health" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Write-Host "Deploy complete."
