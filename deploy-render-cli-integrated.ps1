Write-Host "🚀 Astradio Deployment with Render CLI Integration" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# Step 1: Check Render CLI authentication
Write-Host "🔐 Checking Render CLI authentication..." -ForegroundColor Yellow
try {
    $whoami = .\render.exe whoami 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Authenticated with Render CLI" -ForegroundColor Green
    } else {
        Write-Host "❌ Not authenticated. Please run: .\render.exe login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Render CLI not found or authentication failed" -ForegroundColor Red
    Write-Host "Please ensure render.exe is in the current directory" -ForegroundColor Yellow
    exit 1
}

# Step 2: Build backend with new infrastructure
Write-Host "📦 Building backend with new infrastructure..." -ForegroundColor Yellow
Set-Location "api-deployment"

# Install dependencies
Write-Host "  Installing dependencies..." -ForegroundColor Cyan
npm install

# Build the project
Write-Host "  Building TypeScript..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "✅ Backend built successfully" -ForegroundColor Green
Set-Location ".."

# Step 3: Deploy backend to Render
Write-Host "🚀 Deploying backend to Render..." -ForegroundColor Yellow

# Check if service exists
Write-Host "  Checking service status..." -ForegroundColor Cyan
try {
    $serviceInfo = .\render.exe services list --name astradio-api --format json 2>$null | ConvertFrom-Json
    if ($serviceInfo) {
        Write-Host "  ✅ Service 'astradio-api' found" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Service 'astradio-api' not found, will create new service" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Could not check service status, proceeding with deployment" -ForegroundColor Yellow
}

# Deploy the service
Write-Host "  Deploying service..." -ForegroundColor Cyan
try {
    .\render.exe services deploy astradio-api
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend deployment initiated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend deployment failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend deployment failed with error" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for deployment and get service URL
Write-Host "⏳ Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan

# Poll deployment status
$maxAttempts = 30
$attempt = 0
$deploymentComplete = $false

while (-not $deploymentComplete -and $attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 10
    $attempt++
    
    try {
        $logs = .\render.exe services logs astradio-api --tail 5 2>$null
        if ($logs -match "Build completed|Deploy completed") {
            $deploymentComplete = $true
            Write-Host "✅ Backend deployment completed successfully!" -ForegroundColor Green
        } elseif ($logs -match "Failed|Error") {
            Write-Host "❌ Backend deployment failed" -ForegroundColor Red
            Write-Host "Check logs with: .\render.exe services logs astradio-api" -ForegroundColor Yellow
            exit 1
        } else {
            Write-Host "⏳ Still deploying... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⏳ Still deploying... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
    }
}

if (-not $deploymentComplete) {
    Write-Host "⚠️  Deployment timeout. Check status manually:" -ForegroundColor Yellow
    Write-Host "  .\render.exe services logs astradio-api" -ForegroundColor Cyan
}

# Get service URL
Write-Host "🔗 Getting service URL..." -ForegroundColor Yellow
try {
    $serviceInfo = .\render.exe services list --name astradio-api --format json 2>$null | ConvertFrom-Json
    if ($serviceInfo -and $serviceInfo.service -and $serviceInfo.service.url) {
        $serviceUrl = $serviceInfo.service.url
        Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
        Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Blue
        Write-Host "📊 Health Check: $serviceUrl/health" -ForegroundColor Blue
    } else {
        Write-Host "⚠️  Could not retrieve service URL. Check Render dashboard." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not retrieve service URL. Check Render dashboard." -ForegroundColor Yellow
}

# Step 5: Build and deploy frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location "apps/web"

# Install dependencies
Write-Host "  Installing frontend dependencies..." -ForegroundColor Cyan
npm install

# Build the project
Write-Host "  Building Next.js..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Set-Location "../.."

# Step 6: Deploy frontend to Vercel
Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Yellow

# Check if Vercel CLI is available
if (Test-Path "node_modules\.bin\vercel") {
    Write-Host "  Deploying to Vercel..." -ForegroundColor Cyan
    try {
        npx vercel --prod --yes
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend deployed to Vercel successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Frontend deployment failed with error" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Vercel CLI not found. Please deploy manually:" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor Cyan
    Write-Host "  vercel --prod" -ForegroundColor Cyan
}

# Step 7: Show useful commands
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Blue
Write-Host "  View backend logs:     .\render.exe services logs astradio-api" -ForegroundColor White
Write-Host "  View backend status:   .\render.exe services list --name astradio-api" -ForegroundColor White
Write-Host "  Open backend service:  .\render.exe services open astradio-api" -ForegroundColor White
Write-Host "  Frontend deployment:   npx vercel --prod" -ForegroundColor White

# Step 8: Test the deployment
Write-Host ""
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
if ($serviceUrl) {
    try {
        $healthResponse = Invoke-RestMethod -Uri "$serviceUrl/health" -Method Get -TimeoutSec 10
        if ($healthResponse.status -eq "OK") {
            Write-Host "✅ Backend health check passed!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Backend health check failed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not test backend health check" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Backend: $serviceUrl" -ForegroundColor Blue
Write-Host "Frontend: Check Vercel dashboard for URL" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Cyan 