# Astradio Deployment Script
# This script helps prepare and deploy Astradio to production

Write-Host "🚀 Astradio Deployment Script" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "apps/web") -or -not (Test-Path "apps/api")) {
    Write-Host "❌ Error: Please run this script from the Astradio root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Pre-deployment checklist:" -ForegroundColor Cyan

# 1. Check git status
Write-Host "1. Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes" -ForegroundColor Yellow
    Write-Host "   Consider committing changes before deployment" -ForegroundColor Yellow
} else {
    Write-Host "✅ Git repository is clean" -ForegroundColor Green
}

# 2. Test API build
Write-Host ""
Write-Host "2. Testing API build..." -ForegroundColor Yellow
Set-Location apps/api
try {
    npm run build
    Write-Host "✅ API builds successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ API build failed" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Set-Location ../..

# 3. Check environment files
Write-Host ""
Write-Host "3. Checking environment files..." -ForegroundColor Yellow
if (Test-Path "apps/api/.env") {
    Write-Host "✅ API .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  API .env file missing - will be created during deployment" -ForegroundColor Yellow
}

if (Test-Path "apps/web/.env.local") {
    Write-Host "✅ Frontend .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env.local file missing - will be created during deployment" -ForegroundColor Yellow
}

# 4. Check package.json files
Write-Host ""
Write-Host "4. Checking package.json files..." -ForegroundColor Yellow
if (Test-Path "apps/api/package.json") {
    Write-Host "✅ API package.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ API package.json missing" -ForegroundColor Red
    exit 1
}

if (Test-Path "apps/web/package.json") {
    Write-Host "✅ Frontend package.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend package.json missing" -ForegroundColor Red
    exit 1
}

# 5. Display deployment instructions
Write-Host ""
Write-Host "Deployment Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Backend Deployment (Railway/Render):" -ForegroundColor Yellow
Write-Host "   1. Go to railway.app or render.com" -ForegroundColor White
Write-Host "   2. Create new project from GitHub repo" -ForegroundColor White
Write-Host "   3. Set root directory to 'apps/api'" -ForegroundColor White
Write-Host "   4. Add environment variables (see DEPLOYMENT-GUIDE.md)" -ForegroundColor White
Write-Host "   5. Deploy and note the API URL" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Frontend Deployment (Vercel):" -ForegroundColor Yellow
Write-Host "   1. Go to vercel.com" -ForegroundColor White
Write-Host "   2. Import GitHub repository" -ForegroundColor White
Write-Host "   3. Set root directory to 'apps/web'" -ForegroundColor White
Write-Host "   4. Add NEXT_PUBLIC_API_URL environment variable" -ForegroundColor White
Write-Host "   5. Deploy and note the frontend URL" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Post-deployment:" -ForegroundColor Yellow
Write-Host "   1. Update API URL in frontend environment" -ForegroundColor White
Write-Host "   2. Update frontend URL in backend environment" -ForegroundColor White
Write-Host "   3. Test all features" -ForegroundColor White
Write-Host "   4. Set up monitoring" -ForegroundColor White
Write-Host ""

# 6. Generate environment template
Write-Host "Environment Variables Template:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend (.env):" -ForegroundColor Yellow
Write-Host "PORT=3001" -ForegroundColor Gray
Write-Host "NODE_ENV=production" -ForegroundColor Gray
Write-Host "FRONTEND_URL=https://your-frontend-url.vercel.app" -ForegroundColor Gray
Write-Host "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" -ForegroundColor Gray
Write-Host "JWT_EXPIRES_IN=7d" -ForegroundColor Gray
Write-Host "DATABASE_URL=./data/astradio.db" -ForegroundColor Gray
Write-Host "ASTRO_CLIENT_ID=your-prokerala-client-id" -ForegroundColor Gray
Write-Host "ASTRO_CLIENT_SECRET=your-prokerala-client-secret" -ForegroundColor Gray
Write-Host "ASTRO_TOKEN_URL=https://api.prokerala.com/v2/astrology/" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend (.env.local):" -ForegroundColor Yellow
Write-Host "NEXT_PUBLIC_API_URL=https://your-api-url.railway.app" -ForegroundColor Gray
Write-Host ""

# 7. Check for Prokerala API keys
Write-Host "API Keys Required:" -ForegroundColor Cyan
Write-Host "   • Prokerala Client ID" -ForegroundColor White
Write-Host "   • Prokerala Client Secret" -ForegroundColor White
Write-Host "   • Get them from: https://api.prokerala.com/" -ForegroundColor White
Write-Host ""

Write-Host "Deployment preparation complete!" -ForegroundColor Green
Write-Host "See DEPLOYMENT-GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to deploy Astradio to production!" -ForegroundColor Green 