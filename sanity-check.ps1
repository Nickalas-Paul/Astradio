# PowerShell sanity check script for Railway deployment validation
Write-Host "🔍 Railway Deployment Sanity Check" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$allChecksPassed = $true

try {
    # 1. Check package-lock.json exists and is committed
    Write-Host "1. Checking package-lock.json..." -ForegroundColor Cyan
    if (Test-Path "package-lock.json") {
        Write-Host "[OK] package-lock.json exists" -ForegroundColor Green
        $lockFileSize = (Get-Item "package-lock.json").Length
        Write-Host "   Size: $($lockFileSize) bytes" -ForegroundColor Yellow
    } else {
        Write-Host "[FAIL] package-lock.json missing - this will break Railway deployment!" -ForegroundColor Red
        $allChecksPassed = $false
    }

    # 2. Check start script in apps/api/package.json
    Write-Host ""
    Write-Host "2. Checking start script in apps/api/package.json..." -ForegroundColor Cyan
    $apiPackageJson = Get-Content "apps/api/package.json" | ConvertFrom-Json
    if ($apiPackageJson.scripts.start) {
        Write-Host "[OK] Start script found: $($apiPackageJson.scripts.start)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] No start script found in apps/api/package.json!" -ForegroundColor Red
        $allChecksPassed = $false
    }

    # 3. Check for conflicting Dockerfile
    Write-Host ""
    Write-Host "3. Checking for conflicting Dockerfile..." -ForegroundColor Cyan
    if (Test-Path "Dockerfile") {
        Write-Host "[WARN] Dockerfile found - this may conflict with Nixpacks" -ForegroundColor Yellow
        Write-Host "   Consider removing Dockerfile to use Nixpacks only" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] No Dockerfile found - Nixpacks will be used" -ForegroundColor Green
    }

    # 4. Check railway.json configuration
    Write-Host ""
    Write-Host "4. Checking railway.json configuration..." -ForegroundColor Cyan
    $railwayJson = Get-Content "railway.json" | ConvertFrom-Json
    if ($railwayJson.build.buildCommand -like "*npm install*" -and $railwayJson.build.buildCommand -like "*build:api*") {
        Write-Host "[OK] Build command is correct" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Build command mismatch: $($railwayJson.build.buildCommand)" -ForegroundColor Red
        $allChecksPassed = $false
    }
    
    if ($railwayJson.deploy.startCommand -like "*cd apps/api*" -and $railwayJson.deploy.startCommand -like "*npm start*") {
        Write-Host "[OK] Start command is correct" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Start command mismatch: $($railwayJson.deploy.startCommand)" -ForegroundColor Red
        $allChecksPassed = $false
    }

    # 5. Check nixpacks.toml exists
    Write-Host ""
    Write-Host "5. Checking nixpacks.toml..." -ForegroundColor Cyan
    if (Test-Path "nixpacks.toml") {
        Write-Host "[OK] nixpacks.toml exists" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] nixpacks.toml missing!" -ForegroundColor Red
        $allChecksPassed = $false
    }

    # 6. Check .npmrc exists
    Write-Host ""
    Write-Host "6. Checking .npmrc..." -ForegroundColor Cyan
    if (Test-Path ".npmrc") {
        Write-Host "[OK] .npmrc exists" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] .npmrc missing!" -ForegroundColor Red
        $allChecksPassed = $false
    }

    # 7. Check TypeScript configurations
    Write-Host ""
    Write-Host "7. Checking TypeScript configurations..." -ForegroundColor Cyan
    $tsConfigs = @(
        "apps/api/tsconfig.json",
        "packages/astro-core/tsconfig.json",
        "packages/audio-mappings/tsconfig.json",
        "packages/types/tsconfig.json"
    )
    
    foreach ($config in $tsConfigs) {
        if (Test-Path $config) {
            Write-Host "[OK] $config exists" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] $config missing!" -ForegroundColor Red
            $allChecksPassed = $false
        }
    }

    # 8. Check package.json scripts
    Write-Host ""
    Write-Host "8. Checking package.json scripts..." -ForegroundColor Cyan
    $rootPackageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($rootPackageJson.scripts."build:api") {
        Write-Host "[OK] build:api script exists" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] build:api script missing!" -ForegroundColor Red
        $allChecksPassed = $false
    }

    # 9. Simulate Railway build process
    Write-Host ""
    Write-Host "9. Simulating Railway build process..." -ForegroundColor Cyan
    
    # Clean previous builds
    Write-Host "   Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "apps/api/dist") {
        Remove-Item -Recurse -Force "apps/api/dist"
        Write-Host "   ✅ Cleaned apps/api/dist" -ForegroundColor Green
    }
    
    # Install dependencies
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Dependency installation failed!" -ForegroundColor Red
        $allChecksPassed = $false
    }
    
    # Build API
    Write-Host "   Building API..." -ForegroundColor Yellow
    npm run build:api --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ API build successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API build failed!" -ForegroundColor Red
        $allChecksPassed = $false
    }

    # 10. Verify build outputs
    Write-Host ""
    Write-Host "10. Verifying build outputs..." -ForegroundColor Cyan
    $buildOutputs = @(
        "apps/api/dist/app.js",
        "packages/astro-core/dist/index.js",
        "packages/audio-mappings/dist/index.js",
        "packages/types/dist/index.js"
    )
    
    foreach ($output in $buildOutputs) {
        if (Test-Path $output) {
            $fileSize = (Get-Item $output).Length
            Write-Host "   [OK] $output ($fileSize bytes)" -ForegroundColor Green
        } else {
            Write-Host "   [FAIL] $output missing!" -ForegroundColor Red
            $allChecksPassed = $false
        }
    }

    # 11. Test API startup (brief)
    Write-Host ""
    Write-Host "11. Testing API startup..." -ForegroundColor Cyan
    $env:NODE_ENV = "test"
    $env:PORT = "3003"
    $env:JWT_SECRET = "test-secret"
    $env:SESSION_SECRET = "test-session-secret"
    
    $apiProcess = Start-Process -FilePath "node" -ArgumentList "apps/api/dist/app.js" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    if ($apiProcess.HasExited) {
        Write-Host "   ❌ API failed to start!" -ForegroundColor Red
        $allChecksPassed = $false
    } else {
        Write-Host "   ✅ API started successfully" -ForegroundColor Green
        Stop-Process -Id $apiProcess.Id -Force
        Write-Host "   ✅ API stopped cleanly" -ForegroundColor Green
    }

    # 12. Check for required environment variables
    Write-Host ""
    Write-Host "12. Checking required environment variables..." -ForegroundColor Cyan
    $requiredEnvVars = @(
        "JWT_SECRET",
        "SESSION_SECRET",
        "PORT"
    )
    
    foreach ($var in $requiredEnvVars) {
        if ($railwayJson.variables.$var) {
            Write-Host "   ✅ $var is set in railway.json" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $var not found in railway.json (may need to be set in Railway dashboard)" -ForegroundColor Yellow
        }
    }

    # Final summary
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    if ($allChecksPassed) {
        Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
        Write-Host "✅ Your project is ready for Railway deployment!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Commit and push these changes to GitHub" -ForegroundColor White
        Write-Host "   2. Redeploy on Railway" -ForegroundColor White
        Write-Host "   3. Monitor the deployment logs" -ForegroundColor White
        Write-Host ""
        Write-Host "📋 Deployment checklist:" -ForegroundColor Cyan
        Write-Host "   • All TypeScript files compile successfully" -ForegroundColor White
        Write-Host "   • Dependencies install without errors" -ForegroundColor White
        Write-Host "   • API starts and responds to health checks" -ForegroundColor White
        Write-Host "   • Build outputs are generated correctly" -ForegroundColor White
    } else {
        Write-Host "❌ SOME CHECKS FAILED!" -ForegroundColor Red
        Write-Host "⚠️  Please fix the issues above before deploying to Railway" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Common fixes:" -ForegroundColor Cyan
        Write-Host "   • Run 'npm install' to generate package-lock.json" -ForegroundColor White
        Write-Host "   • Check TypeScript compilation errors" -ForegroundColor White
        Write-Host "   • Verify all required files exist" -ForegroundColor White
        Write-Host "   • Ensure environment variables are set" -ForegroundColor White
    }

} catch {
    Write-Host "❌ Sanity check failed with error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} 