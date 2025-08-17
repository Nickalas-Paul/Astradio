# ====== BULLETPROOF DEPLOYMENT RUNBOOK ======
# Complete deployment workflow with all safety checks

# Fail fast and strict mode for reliability
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Write-Host "🚀 Astradio Bulletproof Deployment Runbook" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Step 0: Verify execution policy
Write-Host "`n📋 Step 0: Checking execution policy..." -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($currentPolicy -eq "Restricted") {
    Write-Host "⚠️  Setting execution policy to RemoteSigned..." -ForegroundColor Yellow
    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
    Write-Host "✅ Execution policy updated" -ForegroundColor Green
} else {
    Write-Host "✅ Execution policy is already permissive: $currentPolicy" -ForegroundColor Green
}

# Step 1: Check prerequisites
Write-Host "`n📋 Step 1: Verifying prerequisites..." -ForegroundColor Yellow
& "$PSScriptRoot\test-deploy-setup.ps1" -Verbose
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prerequisites check failed. Please fix the issues above." -ForegroundColor Red
    exit 1
}

# Step 2: Load environment variables
Write-Host "`n📋 Step 2: Loading environment variables..." -ForegroundColor Yellow
& "$PSScriptRoot\load-deploy-env.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Environment loading failed. Please check your deploy.env file." -ForegroundColor Red
    exit 1
}

# Step 3: Verify pnpm verify passes locally
Write-Host "`n📋 Step 3: Running local verification..." -ForegroundColor Yellow
Write-Host "Running: pnpm verify" -ForegroundColor Gray
pnpm verify
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Local verification failed. Please fix the issues before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Local verification passed" -ForegroundColor Green

# Step 4: Run deployment
Write-Host "`n📋 Step 4: Starting deployment..." -ForegroundColor Yellow
Write-Host "This will deploy both API (Render) and Web (Vercel)" -ForegroundColor Gray
Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

& "$PSScriptRoot\deploy.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    exit 1
}

# Step 5: Post-deploy smoke testing
Write-Host "`n📋 Step 5: Running post-deploy smoke tests..." -ForegroundColor Yellow
Write-Host "Waiting 30 seconds for services to stabilize..." -ForegroundColor Gray
Start-Sleep -Seconds 30

& "$PSScriptRoot\smoke.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Smoke tests failed! Consider rolling back." -ForegroundColor Red
    Write-Host "Run: . scripts/rollback.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 6: Final verification
Write-Host "`n📋 Step 6: Final verification..." -ForegroundColor Yellow
Write-Host "✅ Deployment and smoke tests completed successfully!" -ForegroundColor Green
Write-Host "`n🎉 Your Astradio application is now live and verified!" -ForegroundColor Cyan
Write-Host "• API: $env:NEXT_PUBLIC_API_URL" -ForegroundColor Green
Write-Host "• Web: https://$env:VERCEL_PROJECT_NAME.vercel.app" -ForegroundColor Green
Write-Host "`n📊 Monitoring:" -ForegroundColor Cyan
Write-Host "• Sentry: Error tracking active" -ForegroundColor Gray
Write-Host "• Health checks: /health endpoint" -ForegroundColor Gray
Write-Host "• Smoke tests: All endpoints verified" -ForegroundColor Gray
Write-Host "`n🛡️ Rollback available:" -ForegroundColor Cyan
Write-Host "• Run: . scripts/rollback.ps1" -ForegroundColor Gray
