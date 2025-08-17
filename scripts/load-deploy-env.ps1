$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

function Write-Ok($m){Write-Host $m -ForegroundColor Green}
function Write-Warn($m){Write-Host $m -ForegroundColor Yellow}
function Write-Info($m){Write-Host $m -ForegroundColor Cyan}

# Helper function for JSON API calls
function Get-Json($url, $headers) {
    try {
        return Invoke-RestMethod -Headers $headers -Uri $url -Method Get -ErrorAction Stop
    } catch {
        Write-Warn "API call failed: $($_.Exception.Message)"
        return $null
    }
}

# Secure token storage in Windows Credential Manager
function Get-SecretOrPrompt($name, $prompt) {
    $target = "Astradio:$name"
    $cred = (cmdkey /list | Select-String $target)
    
    if ($cred) {
        $raw = (cmdkey /list | Select-String -Context 0,8 $target).Context.PostContext -join "`n"
        $pwdLine = ($raw | Where-Object {$_ -match "Password:"}) -replace "Password:\s*", ""
        if ($pwdLine) {
            return $pwdLine.Trim()
        }
    }
    
    $val = [Environment]::GetEnvironmentVariable($name, "Process")
    if ([string]::IsNullOrWhiteSpace($val)) {
        $val = Read-Host -AsSecureString "$prompt (input hidden)"
        $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($val)
        $val = [Runtime.InteropServices.Marshal]::PtrToStringAuto($b)
        if ($val) {
            cmdkey /generic:$target /user:token /pass:$val | Out-Null
        }
    }
    return $val
}

Write-Info "Loading deployment environment..."

# Load from .env if present (fallback)
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

# ==== RENDER AUTO-DISCOVERY ====
Write-Info "Configuring Render..."

# Get Render API key
$env:RENDER_API_KEY = Get-SecretOrPrompt "RENDER_API_KEY" "Enter Render API key"

# Auto-discover RENDER_OWNER_ID if missing
if (-not $env:RENDER_OWNER_ID -and $env:RENDER_API_KEY) {
    Write-Info "Auto-discovering Render Owner ID..."
    $renderHeaders = @{ Authorization = "Bearer $env:RENDER_API_KEY" }
    $owners = Get-Json "https://api.render.com/v1/owners" $renderHeaders
    
    if ($owners) {
        # Prefer team; else user
        $team = ($owners | Where-Object { $_.type -eq "team" } | Select-Object -First 1)
        $owner = if ($team) { $team } else { $owners | Select-Object -First 1 }
        
        if ($owner.id) {
            $env:RENDER_OWNER_ID = $owner.id
            Write-Ok "Auto-discovered RENDER_OWNER_ID: $($owner.id)"
        }
    }
}

# Prompt for RENDER_OWNER_ID if still missing
if (-not $env:RENDER_OWNER_ID) {
    $env:RENDER_OWNER_ID = Read-Host "Enter Render Owner ID (user/team)"
}

# ==== VERCEL AUTO-DISCOVERY ====
Write-Info "Configuring Vercel..."

# Get Vercel token (optional - can use CLI session)
if (-not $env:VERCEL_TOKEN) {
    Write-Warn "VERCEL_TOKEN not set. Will use interactive 'vercel login' session."
}

# Auto-discover VERCEL_ORG_ID if missing
if (-not $env:VERCEL_ORG_ID) {
    if ($env:VERCEL_TOKEN) {
        Write-Info "Auto-discovering Vercel Org ID..."
        $vercelHeaders = @{ Authorization = "Bearer $env:VERCEL_TOKEN" }
        $teams = Get-Json "https://api.vercel.com/v2/teams?limit=100" $vercelHeaders
        
        if ($teams -and $teams.teams) {
            $org = $teams.teams | Select-Object -First 1
            if ($org.slug) {
                $env:VERCEL_ORG_ID = $org.slug
                Write-Ok "Auto-discovered VERCEL_ORG_ID: $($org.slug)"
            } elseif ($org.id) {
                $env:VERCEL_ORG_ID = $org.id
                Write-Ok "Auto-discovered VERCEL_ORG_ID: $($org.id)"
            }
        }
    } else {
        Write-Warn "VERCEL_TOKEN not provided — will fall back to 'vercel login' interactive session."
    }
}

# Auto-discover VERCEL_PROJECT_ID if missing
if (-not $env:VERCEL_PROJECT_ID) {
    if ($env:VERCEL_TOKEN -and $env:VERCEL_ORG_ID) {
        Write-Info "Auto-discovering Vercel Project ID..."
        $vercelHeaders = @{ Authorization = "Bearer $env:VERCEL_TOKEN" }
        $projects = Get-Json "https://api.vercel.com/v9/projects?teamId=$($env:VERCEL_ORG_ID)" $vercelHeaders
        
        if ($projects -and $projects.projects) {
            $astradioProject = $projects.projects | Where-Object { $_.name -like "*astradio*" } | Select-Object -First 1
            if ($astradioProject) {
                $env:VERCEL_PROJECT_ID = $astradioProject.id
                Write-Ok "Auto-discovered VERCEL_PROJECT_ID: $($astradioProject.id) ($($astradioProject.name))"
            }
        }
    }
}

# Prompt for missing Vercel IDs if needed
if (-not $env:VERCEL_ORG_ID) {
    $env:VERCEL_ORG_ID = Read-Host "Enter Vercel Org ID (team/user id)"
}

Write-Ok "Environment loaded successfully!"
Write-Info "Render Owner ID: $($env:RENDER_OWNER_ID)"
Write-Info "Vercel Org ID: $($env:VERCEL_ORG_ID)"
if ($env:VERCEL_PROJECT_ID) {
    Write-Info "Vercel Project ID: $($env:VERCEL_PROJECT_ID)"
}
