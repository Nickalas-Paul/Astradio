# deploy-backend.ps1
# Astradio Backend Deployment Script for Render CLI

# Path to Render CLI
$render = ".\render.exe"

# Name of your Render service
$serviceName = "astradio-backend"

# Path to your service root
$servicePath = "apps/api"

# Build and start commands for Node.js backend
$buildCommand = "npm install && npm run build"
$startCommand = "npm start"

Write-Host "🚀 Deploying Astradio Backend to Render..."
Write-Host "Service Name: $serviceName"
Write-Host "Service Path: $servicePath"

# Check if render.exe exists
if (-not (Test-Path $render)) {
    Write-Host "❌ render.exe not found in current directory"
    exit 1
}

# Check authentication
Write-Host "🔐 Checking authentication..."
try {
    $null = & $render whoami 2>$null
    Write-Host "✅ Authenticated with Render"
} catch {
    Write-Host "❌ Not authenticated. Please run: .\render.exe login"
    exit 1
}

# Deploy the service (create or update)
Write-Host "📦 Creating/updating service..."
try {
    & $render services create `
        --name $serviceName `
        --type web `
        --env node `
        --region oregon `
        --branch main `
        --root-dir $servicePath `
        --build-command $buildCommand `
        --start-command $startCommand `
        --plan free
    
    Write-Host "✅ Service created/updated successfully"
} catch {
    Write-Host "❌ Failed to create/update service"
    Write-Host "Error: $($_.Exception.Message)"
    exit 1
}

# Deploy the service
Write-Host "🚀 Deploying service..."
try {
    & $render services deploy $serviceName
    Write-Host "✅ Deployment initiated successfully"
} catch {
    Write-Host "❌ Deployment failed"
    Write-Host "Error: $($_.Exception.Message)"
    exit 1
}

# Wait for deployment to complete
Write-Host "⏳ Waiting for deployment to complete..."
Write-Host "This may take a few minutes..."

# Poll deployment status
$DeploymentComplete = $false
$Attempts = 0
$MaxAttempts = 30

while (-not $DeploymentComplete -and $Attempts -lt $MaxAttempts) {
    Start-Sleep -Seconds 10
    $Attempts++
    
    try {
        $Status = & $render services logs $serviceName --tail 1 2>$null | Select-String -Pattern "(Build completed|Deploy completed|Failed)" | ForEach-Object { $_.Matches.Value }
        
        if ($Status -match "Build completed|Deploy completed") {
            $DeploymentComplete = $true
            Write-Host "✅ Deployment completed successfully!"
        } elseif ($Status -match "Failed") {
            Write-Host "❌ Deployment failed"
            Write-Host "Check logs with: .\render.exe services logs $serviceName"
            exit 1
        } else {
            Write-Host "⏳ Still deploying... (attempt $Attempts/$MaxAttempts)"
        }
    } catch {
        Write-Host "⏳ Still deploying... (attempt $Attempts/$MaxAttempts)"
    }
}

if (-not $DeploymentComplete) {
    Write-Host "⚠️  Deployment timeout. Check status manually:"
    Write-Host "  .\render.exe services logs $serviceName"
}

# Get service URL
Write-Host "🔗 Getting service URL..."
try {
    $ServiceUrl = & $render services list --name $serviceName --format json | ConvertFrom-Json | Select-Object -ExpandProperty service | Select-Object -ExpandProperty url
    
    if ($ServiceUrl -and $ServiceUrl -ne "null") {
        Write-Host "✅ Service deployed successfully!"
        Write-Host "🌐 Service URL: $ServiceUrl"
        Write-Host "📊 Health Check: $ServiceUrl/health"
    } else {
        Write-Host "⚠️  Could not retrieve service URL. Check Render dashboard."
    }
} catch {
    Write-Host "⚠️  Could not retrieve service URL. Check Render dashboard."
}

# Show useful commands
Write-Host ""
Write-Host "📋 Useful Commands:"
Write-Host "  View logs:     .\render.exe services logs $serviceName"
Write-Host "  View status:   .\render.exe services list --name $serviceName"
Write-Host "  Open service:  .\render.exe services open $serviceName"
Write-Host "  Delete service: .\render.exe services delete $serviceName"

Write-Host ""
Write-Host "🎉 Deployment script completed!" 