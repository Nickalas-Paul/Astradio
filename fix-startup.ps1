# Astradio Startup Fix Script
Write-Host "🔧 Fixing Astradio startup issues..." -ForegroundColor Green

# Kill any existing processes on ports 3000-3004
Write-Host "🛑 Stopping existing processes..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 3003, 3004)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Stopped process on port $port" -ForegroundColor Green
    }
}

# Clean up Next.js build artifacts
Write-Host "🧹 Cleaning Next.js build artifacts..." -ForegroundColor Yellow
if (Test-Path "apps\web\.next") {
    Remove-Item -Recurse -Force "apps\web\.next" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned .next directory" -ForegroundColor Green
}

# Remove conflicting lockfiles
Write-Host "📦 Fixing package lock conflicts..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Removed root package-lock.json" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location "apps\web"
npm install
Set-Location "..\.."

Set-Location "apps\api"
npm install
Set-Location "..\.."

# Build packages
Write-Host "🔨 Building packages..." -ForegroundColor Yellow
Set-Location "packages\types"
npm run build
Set-Location "..\.."

Set-Location "packages\astro-core"
npm run build
Set-Location "..\.."

Set-Location "packages\audio-mappings"
npm run build
Set-Location "..\.."

# Build web app
Write-Host "🌐 Building web application..." -ForegroundColor Yellow
Set-Location "apps\web"
npm run build
Set-Location "..\.."

Write-Host "✅ All builds completed successfully!" -ForegroundColor Green

# Start the application
Write-Host "🚀 Starting Astradio..." -ForegroundColor Green
Write-Host "📡 API will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Web app will run on: http://localhost:3000" -ForegroundColor Cyan

# Start API in background
Write-Host "🎯 Starting API server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\api'; npm run dev" -WindowStyle Minimized

# Wait a moment for API to start
Start-Sleep -Seconds 3

# Start web app in background
Write-Host "🌐 Starting web application..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\web'; npm run dev" -WindowStyle Minimized

Write-Host "🎉 Astradio is starting up!" -ForegroundColor Green
Write-Host "📊 Check the status at:" -ForegroundColor Cyan
Write-Host "   API Health: http://localhost:3001/health" -ForegroundColor White
Write-Host "   Web App: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "💡 If you see any errors, check the terminal windows that opened" -ForegroundColor Yellow 