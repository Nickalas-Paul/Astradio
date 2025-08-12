# Astradio Render API Token Setup
# Run this once to configure your Render API token

Write-Host "🔑 Astradio Render API Token Setup" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to https://render.com" -ForegroundColor Cyan
Write-Host "2. Click your profile -> Account Settings" -ForegroundColor Cyan
Write-Host "3. Scroll to 'API Keys' section" -ForegroundColor Cyan
Write-Host "4. Click 'Create API Key'" -ForegroundColor Cyan
Write-Host "5. Copy the generated token" -ForegroundColor Cyan

Write-Host "`n🔧 To set the token, run:" -ForegroundColor Yellow
Write-Host "[Environment]::SetEnvironmentVariable('RENDER_API_KEY','<YOUR_TOKEN>','User')" -ForegroundColor White
Write-Host '$env:RENDER_API_KEY = "<YOUR_TOKEN>"' -ForegroundColor White

Write-Host "`n✅ After setup, you can deploy with:" -ForegroundColor Green
Write-Host ".\scripts\deploy-render-api.ps1" -ForegroundColor White

Write-Host "`n📖 Check status with:" -ForegroundColor Green
Write-Host ".\scripts\status-render-api.ps1" -ForegroundColor White
