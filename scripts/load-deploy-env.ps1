# Strict + fail-fast
$ErrorActionPreference = "Stop"; Set-StrictMode -Version Latest

# Load from scripts/deploy.env if present (KEY=VALUE per line, ignore comments/blank)
$envFile = Join-Path $PSScriptRoot "deploy.env"
if (Test-Path $envFile) {
  foreach ($line in Get-Content $envFile | Where-Object {$_ -and $_ -notmatch '^\s*#'}) {
    $kv = $line -split '=',2
    if ($kv.Count -eq 2) { [Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim(), "Process") }
  }
}

# Required envs (Render optional owner if service exists)
$required = @("VERCEL_TOKEN","VERCEL_ORG_ID")
$missing = @()
foreach ($k in $required) { if (-not $env:$k -or [string]::IsNullOrWhiteSpace($env:$k)) { $missing += $k } }
if ($missing.Count -gt 0) { throw "Missing env vars: $($missing -join ', '). Add them to scripts/deploy.env" }

# Defaults (non-secret)
if (-not $env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL = "https://astradio-1.onrender.com" }

Write-Host "Environment loaded."
