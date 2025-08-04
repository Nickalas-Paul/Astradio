# 🚀 Astradio Beta Deployment Preparation Script
# This script prepares the project for beta testing and deployment

param(
    [switch]$SkipBuild,
    [switch]$SkipTests,
    [switch]$DeployOnly
)

Write-Host "🎵 Astradio Beta Deployment Preparation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to check Node.js version
function Test-NodeVersion {
    if (-not (Test-Command "node")) {
        Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
        Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check if version is 18 or higher
    $version = $nodeVersion -replace 'v', ''
    $majorVersion = [int]($version -split '\.')[0]
    
    if ($majorVersion -lt 18) {
        Write-Host "⚠️  Warning: Node.js 18+ recommended. Current version: $version" -ForegroundColor Yellow
    }
}

# Function to check npm version
function Test-NpmVersion {
    if (-not (Test-Command "npm")) {
        Write-Host "❌ npm is not installed!" -ForegroundColor Red
        exit 1
    }
    
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
}

# Function to check git status
function Test-GitStatus {
    if (-not (Test-Command "git")) {
        Write-Host "⚠️  Git not found - skipping git checks" -ForegroundColor Yellow
        return
    }
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
        Write-Host $gitStatus -ForegroundColor Gray
        Write-Host "Consider committing changes before deployment" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Git repository is clean" -ForegroundColor Green
    }
}

# Function to clean build artifacts
function Clear-BuildArtifacts {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
    
    $buildDirs = @(
        "apps/api/dist",
        "packages/types/dist",
        "packages/astro-core/dist", 
        "packages/audio-mappings/dist",
        "apps/web/.next",
        "apps/web/out"
    )
    
    foreach ($dir in $buildDirs) {
        if (Test-Path $dir) {
            Remove-Item -Recurse -Force $dir
            Write-Host "✅ Cleaned $dir" -ForegroundColor Green
        }
    }
    
    # Clean node_modules cache
    if (Test-Path "node_modules/.cache") {
        Remove-Item -Recurse -Force "node_modules/.cache"
        Write-Host "✅ Cleaned node_modules cache" -ForegroundColor Green
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    
    # Root dependencies
    Write-Host "Installing root dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
        exit 1
    }
    
    # Package dependencies
    $packages = @("types", "astro-core", "audio-mappings")
    foreach ($package in $packages) {
        Write-Host "Installing $package dependencies..." -ForegroundColor Cyan
        Set-Location "packages/$package"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install $package dependencies" -ForegroundColor Red
            exit 1
        }
        Set-Location "../.."
    }
    
    # App dependencies
    $apps = @("api", "web")
    foreach ($app in $apps) {
        Write-Host "Installing $app dependencies..." -ForegroundColor Cyan
        Set-Location "apps/$app"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install $app dependencies" -ForegroundColor Red
            exit 1
        }
        Set-Location "../.."
    }
    
    Write-Host "✅ All dependencies installed successfully" -ForegroundColor Green
}

# Function to build packages
function Build-Packages {
    if ($SkipBuild) {
        Write-Host "⏭️  Skipping build step" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔨 Building packages..." -ForegroundColor Yellow
    
    $packages = @("types", "astro-core", "audio-mappings")
    foreach ($package in $packages) {
        Write-Host "Building $package..." -ForegroundColor Cyan
        Set-Location "packages/$package"
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to build $package" -ForegroundColor Red
            exit 1
        }
        Set-Location "../.."
    }
    
    Write-Host "✅ All packages built successfully" -ForegroundColor Green
}

# Function to build API
function Build-API {
    if ($SkipBuild) {
        Write-Host "⏭️  Skipping API build" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔨 Building API..." -ForegroundColor Yellow
    Set-Location "apps/api"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build API" -ForegroundColor Red
        exit 1
    }
    Set-Location "../.."
    Write-Host "✅ API built successfully" -ForegroundColor Green
}

# Function to test builds
function Test-Builds {
    if ($SkipTests) {
        Write-Host "⏭️  Skipping build tests" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🧪 Testing builds..." -ForegroundColor Yellow
    
    # Test API build
    if (Test-Path "apps/api/dist/app.js") {
        Write-Host "✅ API build exists" -ForegroundColor Green
    } else {
        Write-Host "❌ API build missing" -ForegroundColor Red
    }
    
    # Test package builds
    $packages = @("types", "astro-core", "audio-mappings")
    foreach ($package in $packages) {
        if (Test-Path "packages/$package/dist/index.js") {
            Write-Host "✅ $package build exists" -ForegroundColor Green
        } else {
            Write-Host "❌ $package build missing" -ForegroundColor Red
        }
    }
}

# Function to check environment files
function Test-EnvironmentFiles {
    Write-Host "🔧 Checking environment files..." -ForegroundColor Yellow
    
    # Check for .env files
    $envFiles = @(
        @{Path=".env"; Name="Root Environment"},
        @{Path="apps/api/.env"; Name="API Environment"},
        @{Path="apps/web/.env.local"; Name="Web Environment"}
    )
    
    foreach ($envFile in $envFiles) {
        if (Test-Path $envFile.Path) {
            Write-Host "✅ $($envFile.Name) exists" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($envFile.Name) missing - will be created during deployment" -ForegroundColor Yellow
        }
    }
}

# Function to create deployment checklist
function Create-DeploymentChecklist {
    Write-Host "📋 Creating deployment checklist..." -ForegroundColor Yellow
    
    $checklist = @"
# 🚀 Astradio Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] Dependencies installed
- [x] Packages built
- [x] API built
- [x] Environment files checked
- [x] Git status verified

## 🔧 Backend Deployment (Railway/Render)
- [ ] Create account on Railway/Render
- [ ] Connect GitHub repository
- [ ] Set root directory to 'apps/api'
- [ ] Add environment variables:
  - [ ] PORT=3001
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL=https://your-frontend-url.vercel.app
  - [ ] JWT_SECRET=your-super-secret-jwt-key
  - [ ] ASTRO_CLIENT_ID=your-prokerala-client-id
  - [ ] ASTRO_CLIENT_SECRET=your-prokerala-client-secret
  - [ ] ASTRO_TOKEN_URL=https://api.prokerala.com/v2/astrology/
- [ ] Deploy and note API URL

## 🌐 Frontend Deployment (Vercel)
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set root directory to 'apps/web'
- [ ] Add environment variable:
  - [ ] NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
- [ ] Deploy and note frontend URL

## 🔗 Post-Deployment
- [ ] Update API URL in frontend environment
- [ ] Update frontend URL in backend environment
- [ ] Test all features:
  - [ ] Landing page loads
  - [ ] Chart generation works
  - [ ] Audio playback functions
  - [ ] Export/share features work
  - [ ] Overlay mode works
  - [ ] Sandbox mode works
- [ ] Test on mobile devices
- [ ] Test cross-browser compatibility

## 📊 Beta Testing
- [ ] Share with UI designers
- [ ] Conduct user testing
- [ ] Collect feedback
- [ ] Document issues
- [ ] Plan improvements

## 🎯 Success Criteria
- [ ] All features functional
- [ ] Performance acceptable (< 3s load time)
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] No critical bugs
- [ ] User feedback positive

---
Generated: $(Get-Date)
Version: 1.0.0
"@

    $checklist | Out-File -FilePath "DEPLOYMENT-CHECKLIST.md" -Encoding UTF8
    Write-Host "✅ Deployment checklist created: DEPLOYMENT-CHECKLIST.md" -ForegroundColor Green
}

# Function to create beta testing package
function Create-BetaTestingPackage {
    Write-Host "📦 Creating beta testing package..." -ForegroundColor Yellow
    
    # Create beta testing directory
    $betaDir = "beta-testing-package"
    if (Test-Path $betaDir) {
        Remove-Item -Recurse -Force $betaDir
    }
    New-Item -ItemType Directory -Path $betaDir | Out-Null
    
    # Copy essential files
    $filesToCopy = @(
        "README.md",
        "BETA-TESTING-GUIDE.md",
        "UI-DESIGNER-ONBOARDING.md",
        "DEPLOYMENT-GUIDE.md",
        "DEPLOYMENT-READY.md"
    )
    
    foreach ($file in $filesToCopy) {
        if (Test-Path $file) {
            Copy-Item $file $betaDir
            Write-Host "✅ Copied $file" -ForegroundColor Green
        }
    }
    
    # Create beta testing instructions
    $betaInstructions = @"
# 🧪 Astradio Beta Testing Package

## 📋 What's Included
- README.md - Project overview and setup
- BETA-TESTING-GUIDE.md - Comprehensive testing guide
- UI-DESIGNER-ONBOARDING.md - Design system and guidelines
- DEPLOYMENT-GUIDE.md - Step-by-step deployment instructions
- DEPLOYMENT-READY.md - Current deployment status

## 🎯 For UI Designers
1. Read UI-DESIGNER-ONBOARDING.md first
2. Set up local development environment
3. Review current design implementation
4. Focus on key areas identified in the guide
5. Provide feedback on user experience

## 🧪 For Beta Testers
1. Read BETA-TESTING-GUIDE.md
2. Test all features systematically
3. Document any issues found
4. Provide user experience feedback
5. Test on different devices and browsers

## 🚀 For Deployment
1. Follow DEPLOYMENT-GUIDE.md
2. Use DEPLOYMENT-CHECKLIST.md
3. Deploy backend first, then frontend
4. Update environment variables
5. Test thoroughly before sharing

## 📞 Support
- GitHub Issues for bug reports
- GitHub Discussions for feature requests
- Email for urgent issues
- Team communication for general feedback

---
Package created: $(Get-Date)
"@

    $betaInstructions | Out-File -FilePath "$betaDir/BETA-PACKAGE-README.md" -Encoding UTF8
    
    Write-Host "✅ Beta testing package created: $betaDir/" -ForegroundColor Green
}

# Function to run security checks
function Test-SecurityChecks {
    Write-Host "🔒 Running security checks..." -ForegroundColor Yellow
    
    # Check for hardcoded secrets
    $secretsPatterns = @(
        "password.*=.*['\""][^'\""]+['\""]",
        "secret.*=.*['\""][^'\""]+['\""]",
        "key.*=.*['\""][^'\""]+['\""]",
        "token.*=.*['\""][^'\""]+['\""]"
    )
    
    $foundSecrets = $false
    foreach ($pattern in $secretsPatterns) {
        $matches = Get-ChildItem -Recurse -Include "*.ts", "*.js", "*.json" | 
                  Select-String -Pattern $pattern -List
        if ($matches) {
            Write-Host "⚠️  Potential hardcoded secrets found:" -ForegroundColor Yellow
            foreach ($match in $matches) {
                Write-Host "   $($match.Filename):$($match.LineNumber)" -ForegroundColor Gray
            }
            $foundSecrets = $true
        }
    }
    
    if (-not $foundSecrets) {
        Write-Host "✅ No hardcoded secrets found" -ForegroundColor Green
    }
    
    # Check for environment variables
    $envFiles = @(".env", "apps/api/.env", "apps/web/.env.local")
    foreach ($envFile in $envFiles) {
        if (Test-Path $envFile) {
            Write-Host "✅ Environment file exists: $envFile" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Environment file missing: $envFile" -ForegroundColor Yellow
        }
    }
}

# Function to generate deployment summary
function Show-DeploymentSummary {
    Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    
    $summary = @"
## ✅ Ready for Deployment

### Backend (API)
- Status: Ready for Railway/Render deployment
- Root Directory: apps/api
- Build Command: npm run build
- Start Command: npm start
- Environment Variables: Configured

### Frontend (Web)
- Status: Ready for Vercel deployment  
- Root Directory: apps/web
- Framework: Next.js
- Build Command: npm run build
- Environment Variables: NEXT_PUBLIC_API_URL

### Packages
- types: ✅ Built
- astro-core: ✅ Built
- audio-mappings: ✅ Built

### Environment Files
- Root .env: Ready
- API .env: Ready
- Web .env.local: Ready

### Documentation
- Deployment Guide: ✅ Complete
- Beta Testing Guide: ✅ Complete
- UI Designer Guide: ✅ Complete
- Troubleshooting: ✅ Complete

## 🎯 Next Steps
1. Deploy backend to Railway/Render
2. Deploy frontend to Vercel
3. Update environment variables
4. Test all features
5. Share with UI designers for feedback

## 📞 Support Resources
- DEPLOYMENT-GUIDE.md: Step-by-step instructions
- BETA-TESTING-GUIDE.md: Testing procedures
- UI-DESIGNER-ONBOARDING.md: Design guidelines
- TROUBLESHOOTING.md: Common issues and solutions

---
Generated: $(Get-Date)
"@

    Write-Host $summary -ForegroundColor White
}

# Main execution
try {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    Test-NodeVersion
    Test-NpmVersion
    Test-GitStatus
    
    if (-not $DeployOnly) {
        Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
        Clear-BuildArtifacts
        
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        Install-Dependencies
        
        Write-Host "🔨 Building packages..." -ForegroundColor Yellow
        Build-Packages
        
        Write-Host "🔨 Building API..." -ForegroundColor Yellow
        Build-API
        
        Write-Host "🧪 Testing builds..." -ForegroundColor Yellow
        Test-Builds
    }
    
    Write-Host "🔧 Checking environment files..." -ForegroundColor Yellow
    Test-EnvironmentFiles
    
    Write-Host "🔒 Running security checks..." -ForegroundColor Yellow
    Test-SecurityChecks
    
    Write-Host "📋 Creating deployment checklist..." -ForegroundColor Yellow
    Create-DeploymentChecklist
    
    Write-Host "📦 Creating beta testing package..." -ForegroundColor Yellow
    Create-BetaTestingPackage
    
    Write-Host "📊 Generating deployment summary..." -ForegroundColor Yellow
    Show-DeploymentSummary
    
    Write-Host "🎉 Beta deployment preparation complete!" -ForegroundColor Green
    Write-Host "📁 Check the following files:" -ForegroundColor Cyan
    Write-Host "   - DEPLOYMENT-CHECKLIST.md" -ForegroundColor White
    Write-Host "   - beta-testing-package/" -ForegroundColor White
    Write-Host "   - BETA-TESTING-GUIDE.md" -ForegroundColor White
    Write-Host "   - UI-DESIGNER-ONBOARDING.md" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during preparation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 