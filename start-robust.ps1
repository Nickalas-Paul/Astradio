# Astradio Robust Startup Script
# Handles all common issues and provides preventative measures

param(
    [switch]$Force = $false,
    [switch]$Clean = $false,
    [switch]$Debug = $false
)

Write-Host "🚀 Astradio Robust Startup" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Function to check if port is in use
function Test-PortInUse {
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

# Function to kill process by port
function Stop-ProcessByPort {
    param([int]$Port)
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Killed process on port $Port" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
    }
    catch {
        Write-Host "⚠️ Could not kill process on port $Port" -ForegroundColor Yellow
    }
}

# Function to check and install dependencies
function Test-Dependencies {
    Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
    
    $dependencies = @(
        @{Path="apps/api/package.json"; Name="API Dependencies"},
        @{Path="apps/web/package.json"; Name="Web Dependencies"},
        @{Path="packages/types/package.json"; Name="Types Package"},
        @{Path="packages/astro-core/package.json"; Name="Astro Core"},
        @{Path="packages/audio-mappings/package.json"; Name="Audio Mappings"}
    )
    
    foreach ($dep in $dependencies) {
        if (Test-Path $dep.Path) {
            Write-Host "✅ $($dep.Name): Found" -ForegroundColor Green
        } else {
            Write-Host "❌ $($dep.Name): Missing" -ForegroundColor Red
        }
    }
}

# Function to clean build artifacts
function Clear-BuildArtifacts {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
    
    $artifacts = @(
        "apps/web/.next",
        "apps/web/node_modules/.cache",
        "apps/api/dist",
        "packages/*/dist",
        "packages/*/node_modules/.cache"
    )
    
    foreach ($artifact in $artifacts) {
        if (Test-Path $artifact) {
            Remove-Item -Recurse -Force $artifact -ErrorAction SilentlyContinue
            Write-Host "✅ Cleaned: $artifact" -ForegroundColor Green
        }
    }
}

# Function to check environment
function Test-Environment {
    Write-Host "🔍 Checking environment..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Node.js not found!" -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ npm not found!" -ForegroundColor Red
        exit 1
    }
    
    # Check environment file
    if (Test-Path ".env") {
        Write-Host "✅ Environment file found" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No .env file found" -ForegroundColor Yellow
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    
    $packages = @(
        "packages/types",
        "packages/astro-core", 
        "packages/audio-mappings",
        "apps/api",
        "apps/web"
    )
    
    foreach ($package in $packages) {
        if (Test-Path "$package/package.json") {
            Write-Host "📦 Installing $package..." -ForegroundColor Cyan
            Set-Location $package
            npm install --silent
            Set-Location ../..
        }
    }
}

# Function to build packages
function Build-Packages {
    Write-Host "🔨 Building packages..." -ForegroundColor Yellow
    
    $packages = @(
        "packages/types",
        "packages/astro-core",
        "packages/audio-mappings"
    )
    
    foreach ($package in $packages) {
        if (Test-Path "$package/package.json") {
            Write-Host "🔨 Building $package..." -ForegroundColor Cyan
            Set-Location $package
            npm run build --silent
            Set-Location ../..
        }
    }
}

# Function to start services
function Start-Services {
    Write-Host "🚀 Starting services..." -ForegroundColor Yellow
    
    # Check and kill existing processes
    $ports = @(3000, 3001, 3002, 3003, 3004)
    foreach ($port in $ports) {
        if (Test-PortInUse $port) {
            Write-Host "⚠️ Port $port is in use, killing process..." -ForegroundColor Yellow
            Stop-ProcessByPort $port
        }
    }
    
    # Start API server
    Write-Host "🎯 Starting API server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\api'; npm run dev" -WindowStyle Minimized
    
    # Wait for API to start
    Write-Host "⏳ Waiting for API to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Test API health
    $maxAttempts = 10
    $attempt = 0
    do {
        $attempt++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ API server is healthy" -ForegroundColor Green
                break
            }
        }
        catch {
            if ($attempt -eq $maxAttempts) {
                Write-Host "❌ API server failed to start after $maxAttempts attempts" -ForegroundColor Red
                return $false
            }
            Write-Host "⏳ Waiting for API... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    } while ($attempt -lt $maxAttempts)
    
    # Start web app
    Write-Host "🌐 Starting web application..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\web'; npm run dev" -WindowStyle Minimized
    
    return $true
}

# Function to display status
function Show-Status {
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    Write-Host "=================" -ForegroundColor Cyan
    
    $services = @(
        @{Port=3001; Name="API Server"; URL="http://localhost:3001/health"},
        @{Port=3000; Name="Web App"; URL="http://localhost:3000"}
    )
    
    foreach ($service in $services) {
        if (Test-PortInUse $service.Port) {
            Write-Host "✅ $($service.Name): Running on port $($service.Port)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($service.Name): Not running" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
    Write-Host "   Web App: http://localhost:3000" -ForegroundColor White
    Write-Host "   API Health: http://localhost:3001/health" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   - If services fail to start, run: .\start-robust.ps1 -Clean -Force" -ForegroundColor White
    Write-Host "   - For debugging: .\start-robust.ps1 -Debug" -ForegroundColor White
}

# Main execution
try {
    # Environment checks
    Test-Environment
    Test-Dependencies
    
    # Clean if requested
    if ($Clean) {
        Clear-BuildArtifacts
    }
    
    # Install dependencies
    Install-Dependencies
    
    # Build packages
    Build-Packages
    
    # Start services
    $success = Start-Services
    
    if ($success) {
        Write-Host ""
        Write-Host "🎉 Astradio started successfully!" -ForegroundColor Green
        Show-Status
    } else {
        Write-Host ""
        Write-Host "❌ Failed to start Astradio" -ForegroundColor Red
        Write-Host "💡 Try running with -Clean -Force flags" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Startup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Check the logs above for details" -ForegroundColor Yellow
} 