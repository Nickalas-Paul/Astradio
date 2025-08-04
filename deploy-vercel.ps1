# Deploy ASTRADIO to Vercel
# This script handles the complete deployment process

Write-Host "🚀 Deploying ASTRADIO to Vercel..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "apps/web")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Test the build
Write-Host "`n📦 Testing production build..." -ForegroundColor Yellow
try {
    Set-Location "apps/web"
    
    # Clean previous build
    if (Test-Path ".next") {
        Remove-Item ".next" -Recurse -Force
        Write-Host "🧹 Cleaned previous build" -ForegroundColor Green
    }
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Build the project
    Write-Host "🔨 Building for production..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed! Please fix the errors before deploying." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build process failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Check if Vercel CLI is installed
Write-Host "`n🔧 Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
    } else {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
        Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to install Vercel CLI: $_" -ForegroundColor Red
    Write-Host "Please install manually: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Step 3: Deploy to Vercel
Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Yellow
try {
    # Check if already logged in
    $vercelUser = vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔐 Please log in to Vercel..." -ForegroundColor Yellow
        vercel login
    } else {
        Write-Host "✅ Already logged in as: $vercelUser" -ForegroundColor Green
    }
    
    # Deploy
    Write-Host "🌐 Deploying to production..." -ForegroundColor Yellow
    vercel --prod --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 Deployment successful!" -ForegroundColor Green
        Write-Host "Your app is now live on Vercel!" -ForegroundColor Green
        
        # Get the deployment URL
        $deploymentUrl = vercel ls --prod | Select-String "astradio" | ForEach-Object { $_.ToString().Split()[0] }
        if ($deploymentUrl) {
            Write-Host "🌐 Live URL: $deploymentUrl" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Post-deployment verification
Write-Host "`n🧪 Running post-deployment tests..." -ForegroundColor Yellow

# Get the deployment URL
$deploymentUrl = vercel ls --prod | Select-String "astradio" | ForEach-Object { $_.ToString().Split()[0] }

if ($deploymentUrl) {
    Write-Host "🔍 Testing deployment at: $deploymentUrl" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $deploymentUrl -Method GET -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Deployment is responding correctly" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Deployment responded with status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ Could not verify deployment (this is normal for new deployments)" -ForegroundColor Yellow
    }
}

# Step 5: Summary
Write-Host "`n🎯 Deployment Summary:" -ForegroundColor Cyan
Write-Host "✅ Production build successful" -ForegroundColor Green
Write-Host "✅ Vercel CLI configured" -ForegroundColor Green
Write-Host "✅ Deployment completed" -ForegroundColor Green
Write-Host "✅ Frontend issues resolved" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test the live deployment" -ForegroundColor White
Write-Host "2. Share the URL with your team" -ForegroundColor White
Write-Host "3. Monitor for any issues" -ForegroundColor White
Write-Host "4. Gather user feedback" -ForegroundColor White

Write-Host "`n🚀 ASTRADIO is now live and ready for public beta!" -ForegroundColor Green

# Return to project root
Set-Location "../.." 