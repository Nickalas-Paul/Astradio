$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

function Write-Ok($m){Write-Host $m -ForegroundColor Green}
function Write-Warn($m){Write-Host $m -ForegroundColor Yellow}
function Write-Info($m){Write-Host $m -ForegroundColor Cyan}

Write-Info "Loading deployment environment..."

# Load from .env if present
$envFile = "scripts/deploy.env"
if (Test-Path $envFile) {
    (Get-Content $envFile) | ForEach-Object {
        if ($_ -match "^\s*#") { return }
        $i = $_.IndexOf("=")
        if ($i -gt 0) {
            $k = $_.Substring(0, $i).Trim()
            $v = $_.Substring($i + 1).Trim()
            if ($k) {
                [Environment]::SetEnvironmentVariable($k, $v, "Process")
            }
        }
    }
    Write-Ok "Loaded env from $envFile"
}

# Set Render API key if not already set
if (-not $env:RENDER_API_KEY -or $env:RENDER_API_KEY -eq "your_render_api_key_here") {
    $env:RENDER_API_KEY = "rnd_gKmqXJ9NIcYhZB0PrDJ989uH2H1n"
    Write-Ok "Set RENDER_API_KEY"
}

# Set Render Owner ID if not already set
if (-not $env:RENDER_OWNER_ID -or $env:RENDER_OWNER_ID -eq "your_user_or_team_id_here") {
    $env:RENDER_OWNER_ID = "tea-cvu1lsh5pdvs73e3dfe0"
    Write-Ok "Set RENDER_OWNER_ID"
}

Write-Ok "Environment loaded successfully!"
Write-Info "Render Owner ID: $($env:RENDER_OWNER_ID)"
