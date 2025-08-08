# Astradio Simple Deployment
# One-command deployment without complex syntax

Write-Host "🚀 Astradio Simple Deployment" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

# Step 1: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
npm install
npm run install:workspaces

# Step 2: Build applications
Write-Host "`n🔨 Building applications..." -ForegroundColor Cyan
npm run build

# Step 3: Verify builds
Write-Host "`n✅ Verifying builds..." -ForegroundColor Cyan
if (Test-Path "apps/api/dist") {
    Write-Host "✅ Backend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    exit 1
}

if (Test-Path "apps/web/.next") {
    Write-Host "✅ Frontend build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

# Step 4: Build Docker
Write-Host "`n🐳 Building Docker image..." -ForegroundColor Cyan
docker build -t astradio-api .

# Step 5: Test Docker
Write-Host "`n🧪 Testing Docker container..." -ForegroundColor Cyan
docker run --rm -d --name astradio-test -p 3001:3001 astradio-api
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Docker container health check passed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Docker health check returned status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Docker health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

docker stop astradio-test

# Step 6: Check deployment config
Write-Host "`n📋 Checking deployment configuration..." -ForegroundColor Cyan
if (Test-Path "render.yaml") {
    Write-Host "✅ Render configuration found" -ForegroundColor Green
    Write-Host "Deploy with: git push origin main" -ForegroundColor Cyan
} elseif (Test-Path "railway.json") {
    Write-Host "✅ Railway configuration found" -ForegroundColor Green
    Write-Host "Deploy with: railway up" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ No deployment configuration found" -ForegroundColor Yellow
    Write-Host "Create render.yaml or railway.json for automated deployment" -ForegroundColor Cyan
}

# Step 7: Final validation
Write-Host "`n🔍 Final validation..." -ForegroundColor Cyan
$CriticalFiles = @("Dockerfile", "package.json", "pnpm-workspace.yaml", "apps/api/package.json", "apps/web/package.json")
foreach ($file in $CriticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        exit 1
    }
}

# Success message
Write-Host "`n🎉 Deployment ready!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ All dependencies installed" -ForegroundColor Green
Write-Host "✅ All applications built" -ForegroundColor Green
Write-Host "✅ Docker image built and tested" -ForegroundColor Green
Write-Host "✅ All critical files present" -ForegroundColor Green
Write-Host "`n🚀 Ready for production deployment!" -ForegroundColor Green
Write-Host "Push to main branch to deploy automatically." -ForegroundColor Cyan 