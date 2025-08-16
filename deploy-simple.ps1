# Astradio Simple Deployment Script
Write-Host "🚀 Astradio Deployment" -ForegroundColor Green

# Set Render API Key
$env:RENDER_API_KEY = "rnd_o4yU7mK7lryBwbFJcvm9s4yAD6SC"

# Check git status
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  You have uncommitted changes. Committing them..." -ForegroundColor Yellow
    git add .
    git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "✅ Changes committed" -ForegroundColor Green
}

# Build the project
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
pnpm build
Write-Host "✅ Build successful" -ForegroundColor Green

# Deploy API to Render
Write-Host "`n🎯 Deploying API to Render..." -ForegroundColor Yellow
try {
    node scripts/renderDeploy.js
    Write-Host "✅ API deployed to Render successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Render deployment failed: $_" -ForegroundColor Red
}

# Push to trigger GitHub Actions for frontend
Write-Host "`n🚀 Pushing to trigger frontend deployment..." -ForegroundColor Yellow
git push origin master
Write-Host "✅ Code pushed successfully" -ForegroundColor Green

# Display results
Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "   • Backend (Render): https://astradio-api.onrender.com" -ForegroundColor Cyan
Write-Host "   • Frontend (Vercel): https://astradio.vercel.app" -ForegroundColor Cyan
Write-Host "   • GitHub Actions: https://github.com/yourusername/Astradio/actions" -ForegroundColor Cyan


