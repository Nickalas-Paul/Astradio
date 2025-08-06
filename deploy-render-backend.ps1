# 🚀 Astradio Backend Deployment Script for Render CLI (PowerShell)
# This script deploys the backend API to Render using CLI only

param(
    [string]$ServiceName = "astradio-api",
    [string]$ProjectName = "astradio",
    [string]$RootDir = "apps/api"
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = $Reset
    )
    Write-Host "$Color$Message$Reset"
}

Write-ColorOutput "🚀 Astradio Backend Deployment to Render" $Blue
Write-Host "=========================================="

# Check if Render CLI is installed
try {
    $null = Get-Command render -ErrorAction Stop
    Write-ColorOutput "✅ Render CLI is installed" $Green
} catch {
    Write-ColorOutput "❌ Render CLI is not installed." $Red
    Write-Host "Please install it first:"
    Write-Host "  npm install -g @render/cli"
    Write-Host "  or"
    Write-Host "  curl -sL https://render.com/download-cli/install.sh | bash"
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "render.yaml")) {
    Write-ColorOutput "❌ render.yaml not found. Please run this script from the project root." $Red
    exit 1
}

# Check if API directory exists
if (-not (Test-Path $RootDir)) {
    Write-ColorOutput "❌ API directory not found: $RootDir" $Red
    exit 1
}

Write-ColorOutput "✅ Prerequisites check passed" $Green

# Authenticate with Render (if not already authenticated)
Write-ColorOutput "🔐 Checking Render authentication..." $Yellow
try {
    $null = render whoami 2>$null
    Write-ColorOutput "✅ Already authenticated with Render" $Green
} catch {
    Write-ColorOutput "Please authenticate with Render..." $Yellow
    Write-Host "You'll need your Render API token."
    Write-Host "Get it from: https://render.com/docs/api#authentication"
    render login
}

# Check if service exists
Write-ColorOutput "🔍 Checking if service exists..." $Yellow
try {
    $null = render services list --name $ServiceName 2>$null
    Write-ColorOutput "✅ Service '$ServiceName' found" $Green
    $ServiceExists = $true
} catch {
    Write-ColorOutput "⚠️  Service '$ServiceName' not found, will create new service" $Yellow
    $ServiceExists = $false
}

# Create or update service
if (-not $ServiceExists) {
    Write-ColorOutput "📦 Creating new service..." $Yellow
    
    # Create service using render.yaml
    try {
        render services create --file render.yaml
        Write-ColorOutput "✅ Service created successfully" $Green
    } catch {
        Write-ColorOutput "❌ Failed to create service" $Red
        exit 1
    }
} else {
    Write-ColorOutput "🔄 Updating existing service..." $Yellow
    
    # Update service using render.yaml
    try {
        render services update $ServiceName --file render.yaml
        Write-ColorOutput "✅ Service updated successfully" $Green
    } catch {
        Write-ColorOutput "❌ Failed to update service" $Red
        exit 1
    }
}

# Deploy the service
Write-ColorOutput "🚀 Deploying service..." $Yellow
try {
    render services deploy $ServiceName
    Write-ColorOutput "✅ Deployment initiated successfully" $Green
} catch {
    Write-ColorOutput "❌ Deployment failed" $Red
    exit 1
}

# Wait for deployment to complete
Write-ColorOutput "⏳ Waiting for deployment to complete..." $Yellow
Write-Host "This may take a few minutes..."

# Poll deployment status
$DeploymentComplete = $false
$Attempts = 0
$MaxAttempts = 30

while (-not $DeploymentComplete -and $Attempts -lt $MaxAttempts) {
    Start-Sleep -Seconds 10
    $Attempts++
    
    try {
        $Status = render services logs $ServiceName --tail 1 2>$null | Select-String -Pattern "(Build completed|Deploy completed|Failed)" | ForEach-Object { $_.Matches.Value }
        
        if ($Status -match "Build completed|Deploy completed") {
            $DeploymentComplete = $true
            Write-ColorOutput "✅ Deployment completed successfully!" $Green
        } elseif ($Status -match "Failed") {
            Write-ColorOutput "❌ Deployment failed" $Red
            Write-Host "Check logs with: render services logs $ServiceName"
            exit 1
        } else {
            Write-ColorOutput "⏳ Still deploying... (attempt $Attempts/$MaxAttempts)" $Yellow
        }
    } catch {
        Write-ColorOutput "⏳ Still deploying... (attempt $Attempts/$MaxAttempts)" $Yellow
    }
}

if (-not $DeploymentComplete) {
    Write-ColorOutput "⚠️  Deployment timeout. Check status manually:" $Yellow
    Write-Host "  render services logs $ServiceName"
}

# Get service URL
Write-ColorOutput "🔗 Getting service URL..." $Yellow
try {
    $ServiceUrl = render services list --name $ServiceName --format json | ConvertFrom-Json | Select-Object -ExpandProperty service | Select-Object -ExpandProperty url
    
    if ($ServiceUrl -and $ServiceUrl -ne "null") {
        Write-ColorOutput "✅ Service deployed successfully!" $Green
        Write-ColorOutput "🌐 Service URL: $ServiceUrl" $Blue
        Write-ColorOutput "📊 Health Check: $ServiceUrl/health" $Blue
    } else {
        Write-ColorOutput "⚠️  Could not retrieve service URL. Check Render dashboard." $Yellow
    }
} catch {
    Write-ColorOutput "⚠️  Could not retrieve service URL. Check Render dashboard." $Yellow
}

# Show useful commands
Write-Host ""
Write-ColorOutput "📋 Useful Commands:" $Blue
Write-Host "  View logs:     render services logs $ServiceName"
Write-Host "  View status:   render services list --name $ServiceName"
Write-Host "  Open service:  render services open $ServiceName"
Write-Host "  Delete service: render services delete $ServiceName"

Write-Host ""
Write-ColorOutput "🎉 Deployment script completed!" $Green 