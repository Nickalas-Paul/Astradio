# Simple Astradio Installation Script
Write-Host "🎵 Installing Astradio..." -ForegroundColor Green

# Step 1: Install root dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Install package dependencies
Write-Host "📦 Installing package dependencies..." -ForegroundColor Yellow

Write-Host "  Installing types package..." -ForegroundColor Cyan
Set-Location "packages\types"
npm install
Set-Location ..\..

Write-Host "  Installing astro-core package..." -ForegroundColor Cyan
Set-Location "packages\astro-core"
npm install
Set-Location ..\..

Write-Host "  Installing audio-mappings package..." -ForegroundColor Cyan
Set-Location "packages\audio-mappings"
npm install
Set-Location ..\..

Write-Host "  Installing API dependencies..." -ForegroundColor Cyan
Set-Location "apps\api"
npm install
Set-Location ..\..

# Step 3: Build packages
Write-Host "🔨 Building packages..." -ForegroundColor Yellow

Write-Host "  Building types package..." -ForegroundColor Cyan
Set-Location "packages\types"
npm run build
Set-Location ..\..

Write-Host "  Building astro-core package..." -ForegroundColor Cyan
Set-Location "packages\astro-core"
npm run build
Set-Location ..\..

Write-Host "  Building audio-mappings package..." -ForegroundColor Cyan
Set-Location "packages\audio-mappings"
npm run build
Set-Location ..\..

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start API: cd apps\api; npm run dev" -ForegroundColor White
Write-Host "2. Create web app: cd apps\web; npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias '@/*' --yes" -ForegroundColor White
Write-Host "3. Install web dependencies: cd apps\web; npm install @supabase/supabase-js@^2.38.0 zustand@^4.4.7 framer-motion@^10.16.4 three@^0.158.0 @types/three@^0.158.0" -ForegroundColor White
Write-Host "4. Start web app: cd apps\web; npm run dev" -ForegroundColor White
Write-Host "5. Open: http://localhost:3000" -ForegroundColor White
Write-Host "" 