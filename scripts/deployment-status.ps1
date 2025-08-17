$ErrorActionPreference = "Stop"; Set-StrictMode -Version Latest
Write-Host "Vercel envs:"
vercel env ls 2>$null
Write-Host "`nRecent deployments:"
vercel ls 2>$null | Select-Object -First 10
Write-Host "`nAPI health:"
$api = $env:NEXT_PUBLIC_API_URL; if (-not $api) {$api="https://astradio-1.onrender.com"}
try {
  Invoke-WebRequest -Uri "$api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
} catch { Write-Host "API health error: $($_.Exception.Message)" }
