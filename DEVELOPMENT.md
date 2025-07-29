# Astradio Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v20.12.2 (via nvm/nvm-windows)
- PowerShell 5.1+
- Git

### Development Workflow

#### 1. Start Development Environment
```powershell
# Start both API and Web servers
.\start-dev.ps1

# Start only API server
.\start-dev.ps1 -ApiOnly

# Start only Web server  
.\start-dev.ps1 -WebOnly

# Clean start (kills all existing processes)
.\start-dev.ps1 -Clean
```

#### 2. Check Status
```powershell
# Check server status and health
.\status-dev.ps1
```

#### 3. Stop Development Environment
```powershell
# Stop all servers and clean up
.\stop-dev.ps1
```

## 📊 Server Endpoints

### API Server (Port 3001)
- **Health Check**: http://localhost:3001/health
- **Chart Generation**: POST http://localhost:3001/api/charts/generate
- **Daily Charts**: GET http://localhost:3001/api/daily/:date
- **Audio Generation**: POST http://localhost:3001/api/audio/sequential
- **User System**: POST http://localhost:3001/api/auth/login

### Web Server (Port 3000)
- **Homepage**: http://localhost:3000
- **Moments**: http://localhost:3000/moments
- **Overlay**: http://localhost:3000/overlay
- **Sandbox**: http://localhost:3000/sandbox
- **Jam**: http://localhost:3000/jam
- **Tarot**: http://localhost:3000/tarot

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Conflicts
**Symptoms**: `EADDRINUSE` errors or servers starting on wrong ports
**Solution**: 
```powershell
# Clean restart
.\stop-dev.ps1
.\start-dev.ps1 -Clean
```

#### 2. Workspace Errors
**Symptoms**: `npm error code ENOWORKSPACES` warnings
**Solution**: These are warnings only - servers still work. For clean install:
```powershell
# Clear npm cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

#### 3. Environment Variables
**Symptoms**: API authentication failures
**Solution**: Ensure `.env` files are properly configured:
- `apps/api/.env` - API configuration
- `apps/web/.env.local` - Web configuration

#### 4. Database Issues
**Symptoms**: Database connection errors
**Solution**: 
```powershell
# Reinitialize database
cd apps/api
npm run dev
```

### Manual Server Management

#### Start API Server Only
```powershell
cd apps/api
npm run dev
```

#### Start Web Server Only
```powershell
cd apps/web
npm run dev
```

#### Check Port Usage
```powershell
netstat -ano | findstr ":3000\|:3001"
```

#### Kill Specific Port
```powershell
# Find process using port
netstat -ano | findstr ":3001"

# Kill process (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

## 🛡️ Prevention Measures

### 1. Process Management
- **Automatic cleanup**: Scripts automatically kill conflicting processes
- **Port checking**: Verifies ports are free before starting
- **Health monitoring**: Continuous status checking

### 2. Error Recovery
- **Graceful shutdown**: Proper cleanup on exit
- **Automatic restart**: Failed servers can be restarted
- **Status monitoring**: Real-time health checks

### 3. Development Workflow
- **Sequential startup**: API starts before Web server
- **Dependency verification**: Checks all required services
- **Environment validation**: Ensures proper configuration

## 📁 Project Structure

```
Astradio/
├── apps/
│   ├── api/          # Express.js API server
│   └── web/          # Next.js web application
├── packages/
│   ├── astro-core/   # Astrology calculation engine
│   ├── audio-mappings/ # Audio generation system
│   └── types/        # Shared TypeScript types
├── scripts/
│   ├── start-dev.ps1 # Development startup script
│   ├── stop-dev.ps1  # Development stop script
│   └── status-dev.ps1 # Status monitoring script
└── README.md
```

## 🔒 Security Features

### API Security
- Rate limiting (chart: 20/15min, audio: 10/15min, auth: 5/15min)
- Input validation with Zod schemas
- Enhanced security headers
- Request size limiting (10MB max)
- Comprehensive error handling

### User System
- Authentication (signup/login/password reset)
- Session management (save/retrieve/share)
- Friends system (free to add, Pro for overlay)
- Subscription system (Free/Pro/Flex plans)

## 🎵 Audio Features

### Available Modes
- **Moments**: Sequential house-by-house audio
- **Layered**: Multi-layered composition
- **Melodic**: Advanced melodic generation
- **Sandbox**: Custom configuration testing
- **Overlay**: Dual chart comparison

### Audio Controls
- **Effects**: Reverb, delay, filter controls
- **Tempo**: 60-200 BPM adjustment
- **Key**: Musical key transposition
- **Loop**: Custom loop points
- **Segments**: Audio section marking

## 🚨 Emergency Procedures

### Complete Reset
```powershell
# 1. Stop everything
.\stop-dev.ps1

# 2. Kill all Node processes
Get-Process -Name "node" | Stop-Process -Force

# 3. Clear ports
netstat -ano | findstr ":3000\|:3001" | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    Stop-Process -Id $pid -Force
}

# 4. Clean restart
.\start-dev.ps1 -Clean
```

### Database Reset
```powershell
cd apps/api
Remove-Item -Force data/astradio.db
npm run dev
```

## 📞 Support

### Logs Location
- **API Logs**: Console output from `apps/api`
- **Web Logs**: Console output from `apps/web`
- **npm Logs**: `%APPDATA%\npm-cache\_logs\`

### Health Checks
- **API Health**: http://localhost:3001/health
- **Web Status**: http://localhost:3000
- **Process Status**: `.\status-dev.ps1`

### Common Commands
```powershell
# Check everything
.\status-dev.ps1

# Restart everything
.\stop-dev.ps1; .\start-dev.ps1

# Clean restart
.\stop-dev.ps1; .\start-dev.ps1 -Clean

# Check specific service
curl http://localhost:3001/health
curl http://localhost:3000
``` 