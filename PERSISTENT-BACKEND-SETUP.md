# Persistent Backend Setup Guide

## 🎯 Problem
You're tired of restarting your backend every time you open your laptop. Here are 4 solutions to keep your Astradio backend running 24/7.

## 🚀 Solution 1: Deploy to Render (Recommended for Beta Testing)

**Best for:** Production deployment and beta testing
**Pros:** Always online, no local resources needed, professional hosting
**Cons:** Requires internet connection, potential cold starts on free tier

### Quick Setup:
```powershell
# Run the deployment script
.\deploy-render-persistent.ps1
```

### Manual Setup:
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Service Name:** `astradio-api`
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

### Benefits:
- ✅ Always online 24/7
- ✅ Professional hosting infrastructure
- ✅ Automatic deployments from GitHub
- ✅ Built-in monitoring and logs
- ✅ SSL certificates included
- ✅ Perfect for beta testing

---

## 🔧 Solution 2: Windows Service (Local Persistent)

**Best for:** Local development with automatic startup
**Pros:** Starts automatically with Windows, runs in background
**Cons:** Requires admin privileges, local resources

### Setup:
```powershell
# Run as Administrator
.\setup-windows-service.ps1
```

### Management:
```powershell
# Start service
Start-Service -Name "AstradioAPI"

# Stop service
Stop-Service -Name "AstradioAPI"

# Check status
Get-Service -Name "AstradioAPI"
```

### Benefits:
- ✅ Starts automatically when you boot your computer
- ✅ Runs in background without visible window
- ✅ Automatic restart on failure
- ✅ No manual intervention needed

---

## ⚡ Solution 3: PM2 Process Manager (Recommended for Development)

**Best for:** Local development with advanced process management
**Pros:** Auto-restart, monitoring, startup persistence, easy management
**Cons:** Requires Node.js, local resources

### Setup:
```powershell
# Install and configure PM2
.\setup-pm2-persistent.ps1
```

### Management:
```powershell
# View processes
pm2 list

# View logs
pm2 logs astradio-api

# Restart
pm2 restart astradio-api

# Monitor
pm2 monit
```

### Benefits:
- ✅ Auto-restart on crashes
- ✅ Built-in monitoring and logs
- ✅ Startup persistence
- ✅ Easy process management
- ✅ Memory and CPU monitoring

---

## 🚀 Solution 4: Quick Development Start

**Best for:** Simple local development
**Pros:** Simple setup, no additional tools needed
**Cons:** Manual restart needed, no auto-recovery

### Setup:
```powershell
# Quick start for development
.\start-backend-dev.ps1
```

### Benefits:
- ✅ Simple and fast
- ✅ No additional dependencies
- ✅ Good for quick testing
- ✅ Easy to understand

---

## 📊 Comparison Table

| Solution | Always Online | Auto-Restart | Startup Persistence | Setup Complexity | Resource Usage |
|----------|---------------|--------------|-------------------|------------------|----------------|
| **Render (Cloud)** | ✅ | ✅ | ✅ | Medium | None (Cloud) |
| **Windows Service** | ✅ | ✅ | ✅ | High | Local |
| **PM2** | ✅ | ✅ | ✅ | Medium | Local |
| **Quick Start** | ❌ | ❌ | ❌ | Low | Local |

---

## 🎯 Recommendations

### For Beta Testing:
**Use Render deployment** - Your backend will be available 24/7 for users to test, regardless of your laptop status.

### For Local Development:
**Use PM2** - Best balance of features and simplicity for development work.

### For Production:
**Use Render with paid plan** - Professional hosting with better performance and reliability.

---

## 🔧 Quick Commands Reference

### Render Deployment:
```powershell
# Deploy to existing service
.\render.exe services deploy astradio-api

# Check logs
.\render.exe services logs astradio-api

# Check status
.\render.exe services show astradio-api
```

### PM2 Management:
```powershell
# Start all saved processes
pm2 resurrect

# Save current processes
pm2 save

# Delete process
pm2 delete astradio-api
```

### Windows Service:
```powershell
# Check service status
Get-Service -Name "AstradioAPI"

# Restart service
Restart-Service -Name "AstradioAPI"
```

---

## 🚨 Troubleshooting

### Backend won't start:
1. Check if port 3001 is already in use
2. Verify Node.js is installed
3. Check dependencies are installed
4. Review error logs

### Service won't start:
1. Run PowerShell as Administrator
2. Check Windows Event Viewer for errors
3. Verify file paths are correct

### PM2 issues:
1. Check PM2 logs: `pm2 logs`
2. Restart PM2 daemon: `pm2 kill && pm2 resurrect`
3. Reinstall PM2: `npm install -g pm2`

---

## 🎉 Next Steps

1. **Choose your preferred solution** based on your needs
2. **Run the corresponding setup script**
3. **Test the backend** by visiting http://localhost:3001/health
4. **Update your frontend** to use the persistent backend URL
5. **Enjoy 24/7 backend availability!** 🚀 