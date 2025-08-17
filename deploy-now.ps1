# ====== QUICK DEPLOYMENT SCRIPT ======
# One-command deployment with full safety checks
# Usage: . deploy-now.ps1

Write-Host "🚀 Starting Astradio bulletproof deployment..." -ForegroundColor Cyan

# Run the comprehensive deployment runbook
if (Test-Path "scripts/deploy-runbook.ps1") {
    & "scripts/deploy-runbook.ps1"
} else {
    Write-Error "Deployment runbook not found: scripts/deploy-runbook.ps1"
    Write-Host "Please ensure all deployment scripts are in place." -ForegroundColor Red
    exit 1
}
