$ErrorActionPreference = "Stop"; Set-StrictMode -Version Latest
$api = $env:NEXT_PUBLIC_API_URL; if (-not $api) { $api = "https://astradio-1.onrender.com" }

Write-Host "SMOKE: API"
Invoke-WebRequest -Uri "$api/health" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
$ephem = Invoke-WebRequest -Uri "$api/api/ephemeris/today" -UseBasicParsing
if ($ephem.Content.Length -lt 50) { throw "Ephemeris payload too small." }

Write-Host "SMOKE: Web"
$proj = (vercel project ls | Select-String -Pattern "astradio-web")
if (-not $proj) { throw "astradio-web project not linked." }
$urls = vercel ls | Select-String -Pattern "https://.*vercel.app"
$first = ($urls | Select-Object -First 1).ToString().Trim().Split()[-1]
Invoke-WebRequest -Uri $first -UseBasicParsing | Select-Object -ExpandProperty StatusCode

Write-Host "Smoke passed."
