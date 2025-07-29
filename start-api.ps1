# PowerShell script to start the Astradio API server
Write-Host "🚀 Starting Astradio API Server..." -ForegroundColor Green

# Navigate to API directory
Set-Location "apps/api"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing API dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "🎯 Starting API server on http://localhost:3001" -ForegroundColor Cyan
Write-Host "⚠️  Note: Tone.js is browser-only, audio endpoints will show warnings but won't break the server" -ForegroundColor Yellow

try {
    npm run dev
} catch {
    Write-Host "❌ Failed to start API server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running 'npm install' in the apps/api directory first" -ForegroundColor Yellow
} 