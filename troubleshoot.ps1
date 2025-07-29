# Astradio Troubleshooting Script
param([switch]$Fix = $false)

Write-Host "🔍 Astradio Troubleshooting Tool" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check Node.js and npm
Write-Host "📦 Checking Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js or npm not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check directory structure
Write-Host "📁 Checking directory structure..." -ForegroundColor Yellow
$requiredDirs = @(
    "apps",
    "apps\web",
    "apps\api", 
    "packages",
    "packages\types",
    "packages\astro-core",
    "packages\audio-mappings"
)

$missingDirs = @()
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        $missingDirs += $dir
        Write-Host "❌ Missing: $dir" -ForegroundColor Red
    }
    else {
        Write-Host "✅ Found: $dir" -ForegroundColor Green
    }
}

if ($missingDirs.Count -gt 0) {
    Write-Host "⚠️  Missing directories detected!" -ForegroundColor Yellow
    if ($Fix) {
        Write-Host "🔧 Creating missing directories..." -ForegroundColor Yellow
        foreach ($dir in $missingDirs) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
            Write-Host "✅ Created: $dir" -ForegroundColor Green
        }
    }
    else {
        Write-Host "   Run with -Fix to automatically create missing directories" -ForegroundColor Yellow
    }
}

# Check package.json files
Write-Host "📦 Checking package.json files..." -ForegroundColor Yellow
$packageFiles = @(
    "package.json",
    "packages\types\package.json",
    "packages\astro-core\package.json", 
    "packages\audio-mappings\package.json",
    "apps\api\package.json"
)

foreach ($file in $packageFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
    }
}

# Check if ports are in use
Write-Host "🔌 Checking port availability..." -ForegroundColor Yellow

function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 (Web) is in use" -ForegroundColor Yellow
    if ($Fix) {
        Write-Host "🔧 Attempting to find and stop process on port 3000..." -ForegroundColor Yellow
        $process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Stop-Process -Id $process -Force
            Write-Host "✅ Stopped process on port 3000" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "✅ Port 3000 (Web) is available" -ForegroundColor Green
}

if (Test-Port 3001) {
    Write-Host "⚠️  Port 3001 (API) is in use" -ForegroundColor Yellow
    if ($Fix) {
        Write-Host "🔧 Attempting to find and stop process on port 3001..." -ForegroundColor Yellow
        $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Stop-Process -Id $process -Force
            Write-Host "✅ Stopped process on port 3001" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "✅ Port 3001 (API) is available" -ForegroundColor Green
}

# Check node_modules
Write-Host "📦 Checking node_modules..." -ForegroundColor Yellow
$nodeModulesPaths = @(
    "node_modules",
    "packages\types\node_modules",
    "packages\astro-core\node_modules",
    "packages\audio-mappings\node_modules",
    "apps\api\node_modules",
    "apps\web\node_modules"
)

foreach ($path in $nodeModulesPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found: $path" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Missing: $path" -ForegroundColor Red
        if ($Fix) {
            Write-Host "🔧 Installing dependencies for $path..." -ForegroundColor Yellow
            $parentDir = Split-Path $path -Parent
            if (Test-Path "$parentDir\package.json") {
                Set-Location $parentDir
                npm install
                Set-Location ..\..
                Write-Host "✅ Installed dependencies for $parentDir" -ForegroundColor Green
            }
        }
    }
}

# Check TypeScript compilation
Write-Host "🔧 Testing TypeScript compilation..." -ForegroundColor Yellow
$tsPackages = @("types", "astro-core", "audio-mappings")

foreach ($package in $tsPackages) {
    $packagePath = "packages\$package"
    if (Test-Path "$packagePath\package.json") {
        Set-Location $packagePath
        try {
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $package compiles successfully" -ForegroundColor Green
            }
            else {
                Write-Host "❌ $package compilation failed" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ $package compilation error: $($_.Exception.Message)" -ForegroundColor Red
        }
        Set-Location ..\..
    }
}

# Check environment file
Write-Host "🔐 Checking environment file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content ".env"
    if ($envContent -match "your_prokerala_client_id") {
        Write-Host "⚠️  .env contains placeholder values - update with real API keys" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ .env file missing" -ForegroundColor Red
    if ($Fix) {
        Write-Host "🔧 Creating .env file..." -ForegroundColor Yellow
        $envContent = @"
# ProKerala API (get from https://api.prokerala.com)
ASTRO_CLIENT_ID="your_prokerala_client_id"
ASTRO_CLIENT_SECRET="your_prokerala_client_secret"

# Supabase (get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# API Configuration
FRONTEND_URL="http://localhost:3000"
API_PORT=3001
NODE_ENV="development"
"@
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Created .env file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🔍 Troubleshooting Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If issues were found:" -ForegroundColor Yellow
Write-Host "1. Run: .\troubleshoot.ps1 -Fix" -ForegroundColor White
Write-Host "2. Or run: .\setup-robust.ps1 -Verbose" -ForegroundColor White
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host "1. .\start-dev.ps1" -ForegroundColor White
Write-Host "2. Or manually: cd apps\api && npm run dev (Terminal 1)" -ForegroundColor White
Write-Host "3. And: cd apps\web && npm run dev (Terminal 2)" -ForegroundColor White 