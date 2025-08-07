# Setup PM2 for Persistent Astradio Backend
# This keeps your backend running with auto-restart and startup persistence

Write-Host "🔧 Setting up PM2 for persistent Astradio Backend..." -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "📥 Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green

# Check if PM2 is installed globally
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing PM2 globally..." -ForegroundColor Yellow
    npm install -g pm2
    Write-Host "✅ PM2 installed successfully" -ForegroundColor Green
} else {
    Write-Host "✅ PM2 already installed: $(pm2 --version)" -ForegroundColor Green
}

# Navigate to API directory
$apiPath = Join-Path (Get-Location) "apps\api"
if (-not (Test-Path $apiPath)) {
    Write-Host "❌ API directory not found: $apiPath" -ForegroundColor Red
    exit 1
}

Set-Location $apiPath
Write-Host "📍 Working in: $apiPath" -ForegroundColor Cyan

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

# Check if PM2 process already exists
$existingProcess = pm2 list | Select-String "astradio-api"
if ($existingProcess) {
    Write-Host "⚠️  Astradio API process already exists in PM2" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to restart the existing process? (y/n)"
    if ($choice -eq "y" -or $choice -eq "Y") {
        pm2 restart astradio-api
    } else {
        Write-Host "✅ Using existing process" -ForegroundColor Green
        exit 0
    }
} else {
    # Start the application with PM2
    Write-Host "🚀 Starting Astradio API with PM2..." -ForegroundColor Yellow
    
    # Create PM2 ecosystem file
    $ecosystemContent = @"
module.exports = {
  apps: [{
    name: 'astradio-api',
    script: 'dist/app.js',
    cwd: '$apiPath',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
"@

    $ecosystemContent | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8
    Write-Host "✅ Created PM2 ecosystem file" -ForegroundColor Green

    # Create logs directory
    New-Item -ItemType Directory -Force -Path "logs" | Out-Null

    # Start the application
    pm2 start ecosystem.config.js
}

# Save PM2 configuration for startup persistence
Write-Host "💾 Saving PM2 configuration for startup persistence..." -ForegroundColor Yellow
pm2 save

# Setup PM2 startup script
Write-Host "🔧 Setting up PM2 startup script..." -ForegroundColor Yellow
pm2 startup

Write-Host ""
Write-Host "🎉 PM2 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 PM2 Management Commands:" -ForegroundColor Cyan
Write-Host "  View Processes:    pm2 list" -ForegroundColor White
Write-Host "  View Logs:        pm2 logs astradio-api" -ForegroundColor White
Write-Host "  Restart:          pm2 restart astradio-api" -ForegroundColor White
Write-Host "  Stop:             pm2 stop astradio-api" -ForegroundColor White
Write-Host "  Delete:           pm2 delete astradio-api" -ForegroundColor White
Write-Host "  Monitor:          pm2 monit" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your API will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "💡 PM2 will automatically restart the backend if it crashes!" -ForegroundColor Green
Write-Host "🚀 The backend will start automatically when you boot your computer!" -ForegroundColor Green 