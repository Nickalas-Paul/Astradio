# Simple Astradio Backend Deployment Script
# This script deploys the backend API to Render using CLI only

Write-Host "🚀 Deploying Astradio Backend to Render..."

# Check if render.exe exists
if (-not (Test-Path "render.exe")) {
    Write-Host "❌ render.exe not found in current directory"
    exit 1
}

Write-Host "✅ Render CLI found"

# Check authentication
Write-Host "🔐 Checking authentication..."
try {
    $null = .\render.exe whoami 2>$null
    Write-Host "✅ Authenticated with Render"
} catch {
    Write-Host "❌ Not authenticated. Please run: .\render.exe login"
    exit 1
}

# Create/update service using render.yaml
Write-Host "📦 Creating/updating service from render.yaml..."
try {
    .\render.exe services create --file render.yaml
    Write-Host "✅ Service created/updated successfully"
} catch {
    Write-Host "⚠️  Service might already exist, trying to update..."
    try {
        .\render.exe services update astradio-api --file render.yaml
        Write-Host "✅ Service updated successfully"
    } catch {
        Write-Host "❌ Failed to create/update service"
        exit 1
    }
}

# Deploy the service
Write-Host "🚀 Deploying service..."
try {
    .\render.exe services deploy astradio-api
    Write-Host "✅ Deployment initiated successfully"
} catch {
    Write-Host "❌ Deployment failed"
    exit 1
}

Write-Host "⏳ Deployment in progress..."
Write-Host "Check status with: .\render.exe services logs astradio-api"
Write-Host "View service with: .\render.exe services list --name astradio-api"

Write-Host ""
Write-Host "🎉 Deployment script completed!" 