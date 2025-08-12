# Force Render to redeploy with Node runtime
Write-Host "🔄 Forcing Render redeploy with Node runtime..." -ForegroundColor Yellow

# Check if render CLI is available
if (-not (Get-Command "render" -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing Render CLI..." -ForegroundColor Yellow
    npm install -g @render/cli
}

# Force redeploy
try {
    Write-Host "🚀 Triggering redeploy..." -ForegroundColor Cyan
    render deploy --service-type=web --name="astradio-api" --root-dir="apps/api" --force
    Write-Host "✅ Redeploy triggered successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ CLI redeploy failed. Manual intervention required:" -ForegroundColor Red
    Write-Host "1. Go to Render dashboard" -ForegroundColor White
    Write-Host "2. Find astradio-api service" -ForegroundColor White
    Write-Host "3. Click 'Manual Deploy'" -ForegroundColor White
    Write-Host "4. Or delete service and recreate as Node runtime" -ForegroundColor White
}
