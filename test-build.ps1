# PowerShell test script for Railway build verification
Write-Host "🔧 Testing Railway build process locally..." -ForegroundColor Green
Write-Host ""

try {
    # 1. Clean previous builds
    Write-Host "1. Cleaning previous builds..." -ForegroundColor Cyan
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "✅ Removed node_modules" -ForegroundColor Green
    }
    if (Test-Path "apps/api/dist") {
        Remove-Item -Recurse -Force "apps/api/dist"
        Write-Host "✅ Removed apps/api/dist" -ForegroundColor Green
    }
    if (Test-Path "packages/astro-core/dist") {
        Remove-Item -Recurse -Force "packages/astro-core/dist"
        Write-Host "✅ Removed packages/astro-core/dist" -ForegroundColor Green
    }
    if (Test-Path "packages/audio-mappings/dist") {
        Remove-Item -Recurse -Force "packages/audio-mappings/dist"
        Write-Host "✅ Removed packages/audio-mappings/dist" -ForegroundColor Green
    }
    if (Test-Path "packages/types/dist") {
        Remove-Item -Recurse -Force "packages/types/dist"
        Write-Host "✅ Removed packages/types/dist" -ForegroundColor Green
    }

    # 2. Install dependencies
    Write-Host ""
    Write-Host "2. Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        throw "Failed to install dependencies"
    }

    # 3. Build packages
    Write-Host ""
    Write-Host "3. Building packages..." -ForegroundColor Cyan
    npm run build:api
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Packages built successfully" -ForegroundColor Green
    } else {
        throw "Failed to build packages"
    }

    # 4. Verify build outputs
    Write-Host ""
    Write-Host "4. Verifying build outputs..." -ForegroundColor Cyan
    
    $buildOutputs = @(
        "apps/api/dist/app.js",
        "packages/astro-core/dist/index.js",
        "packages/audio-mappings/dist/index.js",
        "packages/types/dist/index.js"
    )
    
    foreach ($output in $buildOutputs) {
        if (Test-Path $output) {
            Write-Host "✅ $output exists" -ForegroundColor Green
        } else {
            Write-Host "❌ $output missing" -ForegroundColor Red
            throw "Build output $output is missing"
        }
    }

    # 5. Test API startup
    Write-Host ""
    Write-Host "5. Testing API startup..." -ForegroundColor Cyan
    $env:NODE_ENV = "test"
    $env:PORT = "3002"
    $env:JWT_SECRET = "test-secret"
    $env:SESSION_SECRET = "test-session-secret"
    
    $apiProcess = Start-Process -FilePath "node" -ArgumentList "apps/api/dist/app.js" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    if ($apiProcess.HasExited) {
        Write-Host "❌ API failed to start" -ForegroundColor Red
        throw "API startup failed"
    } else {
        Write-Host "✅ API started successfully" -ForegroundColor Green
        Stop-Process -Id $apiProcess.Id -Force
        Write-Host "✅ API stopped cleanly" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "🎉 Railway build test completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ All build steps working:" -ForegroundColor Green
    Write-Host "   • Dependencies installation" -ForegroundColor White
    Write-Host "   • Package compilation" -ForegroundColor White
    Write-Host "   • Build output generation" -ForegroundColor White
    Write-Host "   • API startup verification" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Ready for Railway deployment!" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Build test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
} 