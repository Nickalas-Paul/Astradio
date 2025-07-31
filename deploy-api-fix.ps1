# Railway API Deployment Fix Script
# This script commits and pushes the custom Dockerfile to fix Railway deployment

Write-Host "🚀 Railway API Deployment Fix" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "apps/api/Dockerfile")) {
    Write-Host "❌ Error: Dockerfile not found in apps/api/" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# Add the Dockerfile and .dockerignore to git
Write-Host "📦 Adding Dockerfile and .dockerignore to git..." -ForegroundColor Cyan
git add apps/api/Dockerfile
git add apps/api/.dockerignore

# Commit the changes
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m "Add custom Dockerfile for Railway backend deployment - fixes monorepo workspace dependencies"

# Push to remote
Write-Host "🚀 Pushing to remote repository..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "✅ Changes pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to Railway dashboard" -ForegroundColor White
Write-Host "2. Navigate to your project Settings" -ForegroundColor White
Write-Host "3. Under Build and Deploy section:" -ForegroundColor White
Write-Host "   - Set Root Directory: apps/api" -ForegroundColor White
Write-Host "   - Set Install Command: npm install" -ForegroundColor White
Write-Host "   - Set Build Command: npm run build" -ForegroundColor White
Write-Host "   - Set Start Command: npm run start" -ForegroundColor White
Write-Host "4. Save settings and redeploy" -ForegroundColor White
Write-Host ""
Write-Host "🎯 This should resolve the workspace dependency errors!" -ForegroundColor Green 