# Deploy to Existing Render Service
# This script deploys to an existing service created via web UI

Write-Host "🚀 Deploying to existing Render service..."

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

# List existing services
Write-Host "📋 Listing existing services..."
.\render.exe services list

Write-Host ""
Write-Host "📝 To deploy your backend:"
Write-Host "1. Go to https://render.com/dashboard"
Write-Host "2. Click 'New +' → 'Web Service'"
Write-Host "3. Connect your GitHub repository"
Write-Host "4. Set service name: astradio-api"
Write-Host "5. Set root directory: apps/api"
Write-Host "6. Set build command: npm install && npm run build"
Write-Host "7. Set start command: npm start"
Write-Host "8. Choose 'Free' plan"
Write-Host "9. Click 'Create Web Service'"
Write-Host ""
Write-Host "After creating the service, run:"
Write-Host "  .\render.exe services deploy astradio-api"
Write-Host ""
Write-Host "To check deployment status:"
Write-Host "  .\render.exe services logs astradio-api" 