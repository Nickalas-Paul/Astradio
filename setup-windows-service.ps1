# Setup Astradio Backend as Windows Service
# This will keep your backend running even when you restart your laptop

Write-Host "🔧 Setting up Astradio Backend as Windows Service..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires administrator privileges" -ForegroundColor Red
    Write-Host "🔑 Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

# Check if NSSM is available (Non-Sucking Service Manager)
$nssmPath = "C:\nssm\nssm.exe"
if (-not (Test-Path $nssmPath)) {
    Write-Host "📥 Installing NSSM (Non-Sucking Service Manager)..." -ForegroundColor Yellow
    
    # Create directory
    New-Item -ItemType Directory -Force -Path "C:\nssm"
    
    # Download NSSM
    $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
    $tempZip = "$env:TEMP\nssm.zip"
    
    try {
        Invoke-WebRequest -Uri $nssmUrl -OutFile $tempZip
        Expand-Archive -Path $tempZip -DestinationPath "C:\nssm" -Force
        Remove-Item $tempZip
        Write-Host "✅ NSSM installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install NSSM. Please download manually from https://nssm.cc/" -ForegroundColor Red
        exit 1
    }
}

# Get current directory
$currentDir = Get-Location
$apiPath = Join-Path $currentDir "apps\api"
$nodePath = (Get-Command node).Source

Write-Host "📍 API Path: $apiPath" -ForegroundColor Cyan
Write-Host "📍 Node Path: $nodePath" -ForegroundColor Cyan

# Check if service already exists
$serviceName = "AstradioAPI"
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($existingService) {
    Write-Host "⚠️  Service '$serviceName' already exists" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to remove the existing service and recreate it? (y/n)"
    if ($choice -eq "y" -or $choice -eq "Y") {
        Write-Host "🗑️  Removing existing service..." -ForegroundColor Yellow
        & $nssmPath remove $serviceName confirm
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✅ Using existing service" -ForegroundColor Green
        exit 0
    }
}

# Install the service
Write-Host "🔧 Installing Astradio API as Windows Service..." -ForegroundColor Yellow

# Set the application path
& $nssmPath install $serviceName $nodePath

# Set the startup directory
& $nssmPath set $serviceName AppDirectory $apiPath

# Set the startup parameters
& $nssmPath set $serviceName AppParameters "dist\app.js"

# Set the service description
& $nssmPath set $serviceName Description "Astradio API Backend Service"

# Set startup type to automatic
& $nssmPath set $serviceName Start SERVICE_AUTO_START

# Set the service to restart on failure
& $nssmPath set $serviceName AppRestartDelay 10000
& $nssmPath set $serviceName AppStopMethodSkip 0
& $nssmPath set $serviceName AppStopMethodConsole 1500
& $nssmPath set $serviceName AppStopMethodWindow 1500
& $nssmPath set $serviceName AppStopMethodThreads 1500

# Set environment variables
& $nssmPath set $serviceName AppEnvironmentExtra "NODE_ENV=production"
& $nssmPath set $serviceName AppEnvironmentExtra "PORT=3001"

Write-Host "✅ Service installed successfully!" -ForegroundColor Green

# Start the service
Write-Host "🚀 Starting Astradio API Service..." -ForegroundColor Yellow
Start-Service -Name $serviceName

# Check if service is running
Start-Sleep -Seconds 3
$service = Get-Service -Name $serviceName
if ($service.Status -eq "Running") {
    Write-Host "✅ Service is running successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Service may not be running. Check with: Get-Service -Name $serviceName" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Service Management Commands:" -ForegroundColor Cyan
Write-Host "  Start Service:   Start-Service -Name $serviceName" -ForegroundColor White
Write-Host "  Stop Service:    Stop-Service -Name $serviceName" -ForegroundColor White
Write-Host "  Restart Service: Restart-Service -Name $serviceName" -ForegroundColor White
Write-Host "  Check Status:    Get-Service -Name $serviceName" -ForegroundColor White
Write-Host "  Remove Service:  & '$nssmPath' remove $serviceName confirm" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your API will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "💡 The service will start automatically when you boot your computer!" -ForegroundColor Green 