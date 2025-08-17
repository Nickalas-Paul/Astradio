$ErrorActionPreference = "Stop"; Set-StrictMode -Version Latest
Write-Host "Preflight checks…"

# Tools
$tools = @("node","pnpm","git","vercel","curl")
$absent = $tools | Where-Object { -not (Get-Command $_ -ErrorAction SilentlyContinue) }
if ($absent) { throw "Missing tools: $($absent -join ', ')" }

# Repo sanity
if (-not (Test-Path "package.json") -or -not (Test-Path "pnpm-workspace.yaml")) { throw "Run from repo root." }

# Buildability
pnpm -v | Out-Null
pnpm install --frozen-lockfile
pnpm verify
pnpm -w build

Write-Host "Preflight OK."
