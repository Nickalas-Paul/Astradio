# Astradio Production Deployment Script
# Stable, scalable deployment for production

Write-Host "🚀 Astradio Production Deployment" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Clean and install dependencies
Write-Host "`n🧹 Cleaning and installing dependencies..." -ForegroundColor Yellow

# Clean previous builds
if (Test-Path "apps/web/.next") {
    Remove-Item "apps/web/.next" -Recurse -Force
    Write-Host "✅ Cleaned web build cache" -ForegroundColor Green
}

if (Test-Path "apps/api/dist") {
    Remove-Item "apps/api/dist" -Recurse -Force
    Write-Host "✅ Cleaned API build cache" -ForegroundColor Green
}

# Install all dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm run install:all
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency installation failed" -ForegroundColor Red
    exit 1
}

# Build API
Write-Host "`n🔧 Building API..." -ForegroundColor Yellow
Set-Location "apps/api"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API build failed" -ForegroundColor Red
    exit 1
}
Set-Location "../.."

# Build Web App
Write-Host "`n🌐 Building Web App..." -ForegroundColor Yellow
Set-Location "apps/web"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web app build failed" -ForegroundColor Red
    exit 1
}
Set-Location "../.."

Write-Host "✅ All builds completed successfully!" -ForegroundColor Green

# Deployment instructions
Write-Host "`n🚀 Deployment Instructions:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "`n📋 Backend (Render):" -ForegroundColor Yellow
Write-Host "1. Push to GitHub: git add . && git commit -m 'Production ready' && git push"
Write-Host "2. Deploy to Render: render deploy"
Write-Host "3. Set environment variables in Render dashboard:"
Write-Host "   - PORT=10000"
Write-Host "   - NODE_ENV=production"
Write-Host "   - JWT_SECRET=<generate-secret>"
Write-Host "   - SESSION_SECRET=<generate-secret>"
Write-Host "   - CORS_ORIGIN=https://your-frontend-domain.vercel.app"

Write-Host "`n📋 Frontend (Vercel):" -ForegroundColor Yellow
Write-Host "1. Deploy to Vercel: vercel --prod"
Write-Host "2. Set environment variables in Vercel dashboard:"
Write-Host "   - NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com"

Write-Host "`n✅ Production deployment script completed!" -ForegroundColor Green
Write-Host "The application is ready for stable, scalable deployment." -ForegroundColor Green
