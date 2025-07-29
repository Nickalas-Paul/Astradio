# Astradio Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Port Conflicts (EADDRINUSE)

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::3001`
- Services fail to start
- "API Server Unreachable" error

**Solutions:**
```powershell
# Kill all Node.js processes
taskkill /F /IM node.exe

# Or kill specific ports
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Use robust startup
.\start-robust.ps1 -Clean -Force
```

### 2. Missing Error Components

**Symptoms:**
- "API Server Unreachable" error
- No loading states
- Poor error handling

**Solutions:**
- ✅ **Fixed**: Created ErrorBoundary, PageLoader, NetworkErrorHandler components
- ✅ **Fixed**: Updated CORS configuration for all localhost ports
- ✅ **Fixed**: Added comprehensive error handling

### 3. Build Issues

**Symptoms:**
- Missing `routes-manifest.json`
- Build failures
- Corrupted `.next` directory

**Solutions:**
```powershell
# Clean build artifacts
Remove-Item -Recurse -Force "apps\web\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "apps\web\node_modules\.cache" -ErrorAction SilentlyContinue

# Rebuild
cd apps\web
npm run build
```

### 4. Lockfile Conflicts

**Symptoms:**
- Multiple `package-lock.json` files
- Dependency installation failures
- Version conflicts

**Solutions:**
```powershell
# Remove conflicting lockfiles
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue

# Reinstall dependencies
cd apps\api; npm install
cd ..\web; npm install
```

### 5. Audio Issues

**Symptoms:**
- Audio not playing
- "Audio requires user interaction" error
- Web Audio API context suspended

**Solutions:**
- ✅ **Fixed**: Added audio context debugging
- ✅ **Fixed**: Enhanced user interaction handling
- ✅ **Fixed**: Added audio context resume functionality

### 6. Visual Issues

**Symptoms:**
- Wrong color scheme
- Navigation spacing issues
- Logo not showing

**Solutions:**
- ✅ **Fixed**: Updated to dark blue + green primary theme
- ✅ **Fixed**: Increased navigation spacing (`space-x-6`)
- ✅ **Fixed**: Created new astrological logo

## 🔧 Preventative Measures

### 1. Use Robust Startup Script

```powershell
# Standard startup
.\start-robust.ps1

# Clean startup (removes build artifacts)
.\start-robust.ps1 -Clean

# Force startup (kills existing processes)
.\start-robust.ps1 -Force

# Debug mode
.\start-robust.ps1 -Debug
```

### 2. Health Monitoring

```powershell
# One-time health check
.\health-monitor.ps1

# Continuous monitoring
.\health-monitor.ps1 -Continuous -Interval 30
```

### 3. Configuration Management

```powershell
# Check configuration
.\config-manager.ps1 -Action check

# Create new environment file
.\config-manager.ps1 -Action create

# Backup configuration
.\config-manager.ps1 -Action backup

# Validate configuration
.\config-manager.ps1 -Action validate
```

## 🚀 Quick Fix Commands

### For Port Conflicts:
```powershell
taskkill /F /IM node.exe
.\start-robust.ps1 -Clean -Force
```

### For Build Issues:
```powershell
Remove-Item -Recurse -Force "apps\web\.next" -ErrorAction SilentlyContinue
cd apps\web; npm run build
```

### For Dependency Issues:
```powershell
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
cd apps\api; npm install
cd ..\web; npm install
```

### For Audio Issues:
```powershell
# Check browser console for audio context errors
# Ensure user interaction before audio playback
# Check CORS configuration
```

## 📊 Service Status Check

### Manual Check:
```powershell
# Check API
Invoke-WebRequest -Uri "http://localhost:3001/health"

# Check Web App
Invoke-WebRequest -Uri "http://localhost:3000"

# Check ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

### Automated Check:
```powershell
.\health-monitor.ps1
```

## 🔍 Debugging Steps

### 1. Check Service Logs
- API server logs in terminal
- Web app logs in terminal
- Browser console for frontend errors

### 2. Check Network
- Verify ports are not in use
- Check CORS configuration
- Test API endpoints directly

### 3. Check Dependencies
- Verify all package.json files exist
- Check node_modules are installed
- Verify TypeScript compilation

### 4. Check Environment
- Verify .env file exists
- Check environment variables
- Validate API keys

## 🛠️ Development Workflow

### 1. Daily Startup:
```powershell
# Quick start
.\start-robust.ps1

# Verify health
.\health-monitor.ps1
```

### 2. After Code Changes:
```powershell
# Restart services
taskkill /F /IM node.exe
.\start-robust.ps1
```

### 3. Before Committing:
```powershell
# Check configuration
.\config-manager.ps1 -Action validate

# Backup configuration
.\config-manager.ps1 -Action backup
```

## 📞 Emergency Procedures

### Complete Reset:
```powershell
# 1. Kill all processes
taskkill /F /IM node.exe

# 2. Clean everything
Remove-Item -Recurse -Force "apps\web\.next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "apps\api\dist" -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue

# 3. Reinstall dependencies
cd apps\api; npm install
cd ..\web; npm install

# 4. Rebuild packages
cd packages\types; npm run build
cd ..\astro-core; npm run build
cd ..\audio-mappings; npm run build

# 5. Start services
.\start-robust.ps1 -Clean -Force
```

### Configuration Reset:
```powershell
# Backup current config
.\config-manager.ps1 -Action backup

# Create new environment
.\config-manager.ps1 -Action create

# Validate
.\config-manager.ps1 -Action validate
```

## 📋 Checklist for New Setup

- [ ] Node.js and npm installed
- [ ] All package.json files present
- [ ] .env file configured
- [ ] Dependencies installed
- [ ] Packages built
- [ ] Services start without errors
- [ ] Health checks pass
- [ ] Web app loads correctly
- [ ] API responds to health check
- [ ] Error components work
- [ ] Audio functionality works
- [ ] Visual design is correct

## 🎯 Success Indicators

- ✅ API server running on port 3001
- ✅ Web app running on port 3000
- ✅ Health endpoint responds with 200
- ✅ No console errors in browser
- ✅ Error components display properly
- ✅ Audio context initializes
- ✅ Visual design matches specifications
- ✅ Navigation spacing is correct
- ✅ Logo displays properly
- ✅ Color scheme is dark blue + green

This troubleshooting guide covers all the issues we've encountered and provides preventative measures to avoid them in the future. 