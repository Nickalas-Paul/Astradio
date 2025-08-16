# Astradio Unified Deployment Script
# This script triggers deployments for both backend (Render) and frontend (Vercel)
# using the existing GitHub Actions workflows

# Set Render API Key
$env:RENDER_API_KEY = "rnd_o4yU7mK7lryBwbFJcvm9s4yAD6SC"

Write-Host "🚀 Astradio Unified Deployment" -ForegroundColor Green
Write-Host "This will deploy both backend (Render) and frontend (Vercel)" -ForegroundColor Cyan

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository" -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow

# Check if we have uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor Gray
    
    $commit = Read-Host "Do you want to commit these changes before deploying? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if (-not $commitMessage) {
            $commitMessage = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        }
        git add .
        git commit -m $commitMessage
        Write-Host "✅ Changes committed" -ForegroundColor Green
    } else {
        Write-Host "❌ Please commit or stash your changes before deploying" -ForegroundColor Red
        exit 1
    }
}

# Check if we're on the correct branch for deployment
if ($currentBranch -ne "master" -and $currentBranch -ne "main") {
    Write-Host "⚠️  You are not on master/main branch" -ForegroundColor Yellow
    $switch = Read-Host "Do you want to switch to master branch? (y/n)"
    if ($switch -eq "y" -or $switch -eq "Y") {
        git checkout master
        $currentBranch = "master"
        Write-Host "✅ Switched to master branch" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment requires master/main branch" -ForegroundColor Red
        exit 1
    }
}

# Verify build before deployment
Write-Host "`n🔨 Verifying build..." -ForegroundColor Yellow
try {
    pnpm build
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed. Please fix build issues before deploying" -ForegroundColor Red
    exit 1
}

# Run smoke test
Write-Host "`n🧪 Running smoke test..." -ForegroundColor Yellow
try {
    # Start API server in background for testing
    $apiProcess = Start-Process -FilePath "pnpm" -ArgumentList "--filter", "api", "dev" -PassThru -WindowStyle Hidden
    
    # Wait for server to start
    Start-Sleep -Seconds 5
    
    # Run smoke test
    node scripts/smoke.js
    
    # Stop API server
    Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Smoke test passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Smoke test failed. Please fix issues before deploying" -ForegroundColor Red
    Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Push to trigger GitHub Actions deployment
Write-Host "`n🚀 Pushing to trigger deployment..." -ForegroundColor Yellow

# Check if we have a remote
$remotes = git remote -v
if (-not $remotes) {
    Write-Host "❌ No remote repository configured" -ForegroundColor Red
    Write-Host "Please add your GitHub repository as origin:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/yourusername/Astradio.git" -ForegroundColor Gray
    exit 1
}

# Deploy API to Render directly
Write-Host "`n🎯 Deploying API to Render..." -ForegroundColor Yellow
try {
    node scripts/renderDeploy.js
    Write-Host "✅ API deployed to Render successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Render deployment failed: $_" -ForegroundColor Red
    Write-Host "Continuing with GitHub Actions deployment..." -ForegroundColor Yellow
}

# Push to trigger GitHub Actions deployment for frontend
Write-Host "`n🚀 Pushing to trigger frontend deployment..." -ForegroundColor Yellow
try {
    git push origin $currentBranch
    Write-Host "✅ Code pushed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push code" -ForegroundColor Red
    exit 1
}

# Display deployment information
Write-Host "`n🎉 Deployment triggered!" -ForegroundColor Green
Write-Host "`n📋 Deployment Status:" -ForegroundColor Cyan
Write-Host "   • Backend (Render): https://dashboard.render.com/web/services" -ForegroundColor White
Write-Host "   • Frontend (Vercel): https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   • GitHub Actions: https://github.com/yourusername/Astradio/actions" -ForegroundColor White

Write-Host "`n⏱️  Deployment typically takes 2-5 minutes" -ForegroundColor Yellow
Write-Host "   • Backend: ~3 minutes" -ForegroundColor Gray
Write-Host "   • Frontend: ~2 minutes" -ForegroundColor Gray

Write-Host "`n🔗 Expected URLs:" -ForegroundColor Cyan
Write-Host "   • API: https://astradio-api.onrender.com" -ForegroundColor White
Write-Host "   • Web: https://astradio.vercel.app" -ForegroundColor White

Write-Host "`n✅ Deployment process completed!" -ForegroundColor Green
Write-Host "Check the URLs above in a few minutes to verify deployment success." -ForegroundColor Yellow
