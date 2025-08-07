Write-Host "🚀 Deploying Astradio for testing..." -ForegroundColor Green

# Step 1: Build backend
Write-Host "📦 Building backend..." -ForegroundColor Yellow
Set-Location "api-deployment"
npm install
npm run build
Set-Location ".."

# Step 2: Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location "apps/web"
npm install
npm run build
Set-Location "../.."

# Step 3: Deploy to Render (Backend)
Write-Host "🚀 Deploying backend to Render..." -ForegroundColor Yellow
if (Test-Path "render.exe") {
    .\render.exe services deploy astradio-api
} else {
    Write-Host "⚠️  Render CLI not found. Please deploy manually to Render dashboard." -ForegroundColor Yellow
}

# Step 4: Deploy to Vercel (Frontend)
Write-Host "🚀 Deploying frontend to Vercel..." -ForegroundColor Yellow
if (Test-Path "node_modules\.bin\vercel") {
    npx vercel --prod
} else {
    Write-Host "⚠️  Vercel CLI not found. Please deploy manually to Vercel dashboard." -ForegroundColor Yellow
}

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "📊 Check your deployment platforms for status." -ForegroundColor Cyan 