# 🚀 Render Deployment Guide for Astradio

## ✅ **Why Render is Perfect for Astradio**

| Feature | Render Support | Benefits |
|---------|---------------|----------|
| **Node.js API** | ✅ Excellent | Fast startup, good performance |
| **Audio Generation** | ✅ Works great | CPU bursts handled well |
| **SQLite Database** | ✅ Local disk OK | Persistent storage on paid plans |
| **Real-time Processing** | ✅ Within timeouts | Perfect for chart/audio generation |
| **Auto-scaling** | ✅ Available | Scales with traffic |
| **HTTPS/SSL** | ✅ Automatic | No configuration needed |
| **Custom Domains** | ✅ Supported | Easy to set up |

---

## 📋 **Deployment Options**

### **Option 1: Automated Deployment (Recommended)**
```bash
# Run the deployment script
./deploy-render.ps1
```

### **Option 2: Manual Deployment**
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new **Web Service**
4. Configure the settings below

---

## ⚙️ **Manual Configuration**

### **Service Settings**
- **Name**: `astradio-api`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (or closest to your users)
- **Branch**: `main`
- **Root Directory**: Leave empty (deploy from root)

### **Build & Deploy**
- **Build Command**: `cd apps/api && npm install && npm run build`
- **Start Command**: `cd apps/api && npm start`

### **Environment Variables**
Add these environment variables in the Render dashboard:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=astradio-production-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=./data/astradio.db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_HTTPS=true
TRUST_PROXY=true
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=audio/wav,audio/mp3,audio/ogg
SESSION_SECRET=astradio-production-session-secret-change-in-production
SESSION_MAX_AGE=86400000
ENABLE_DEBUG_MODE=false
SKIP_EMAIL_VERIFICATION=true
ASTRO_CLIENT_ID=your-prokerala-client-id
ASTRO_CLIENT_SECRET=your-prokerala-client-secret
ASTRO_TOKEN_URL=https://api.prokerala.com/v2/astrology/token
```

---

## 🔧 **Required API Keys**

### **ProKerala Astrology API**
1. Go to [api.prokerala.com](https://api.prokerala.com)
2. Create an account and get your credentials
3. Update these environment variables:
   - `ASTRO_CLIENT_ID`: Your ProKerala client ID
   - `ASTRO_CLIENT_SECRET`: Your ProKerala client secret

---

## 📊 **Performance & Scaling**

### **Free Tier Limits**
- **Memory**: 512MB RAM
- **CPU**: Shared (bursts up to 0.5 CPU)
- **Storage**: 1GB (temporary)
- **Bandwidth**: 100GB/month
- **Sleep**: 15 minutes of inactivity

### **Pro Tier Benefits** ($7/month)
- **Memory**: 1GB RAM
- **CPU**: Dedicated 0.5 CPU
- **Storage**: 10GB persistent
- **Bandwidth**: 750GB/month
- **Always On**: No sleep mode

### **Scaling Recommendations**
- **Start with Free**: Perfect for testing and low traffic
- **Upgrade to Pro**: When you hit 100+ daily users
- **Add Workers**: For background audio processing (if needed)

---

## 🧪 **Testing Your Deployment**

### **Health Check**
```bash
curl https://your-app.onrender.com/health
```

### **Chart Generation**
```bash
curl -X POST https://your-app.onrender.com/api/charts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthData": {
      "date": "1990-01-01",
      "time": "12:00",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "timezone": -5
    }
  }'
```

### **Audio Generation**
```bash
curl -X POST https://your-app.onrender.com/api/audio/sandbox \
  -H "Content-Type: application/json" \
  -d '{
    "chart_data": {
      "metadata": {"birth_datetime": "1990-01-01T12:00:00"},
      "planets": {"Sun": {"longitude": 120, "sign": {"name": "Capricorn"}}}
    },
    "configuration": {"genre": "ambient", "duration": 30}
  }'
```

---

## 🔍 **Monitoring & Debugging**

### **View Logs**
1. Go to your Render dashboard
2. Click on your service
3. Go to the "Logs" tab
4. Check for any errors or warnings

### **Common Issues**

| Issue | Solution |
|-------|----------|
| **Build fails** | Check Node.js version compatibility |
| **Startup timeout** | Increase memory or optimize startup |
| **Audio generation slow** | Consider upgrading to Pro plan |
| **Database errors** | Check SQLite file permissions |

---

## 🚀 **Next Steps After Deployment**

1. **Test all endpoints** using the curl commands above
2. **Set up custom domain** (optional)
3. **Configure monitoring** (optional)
4. **Deploy frontend** to Vercel/Netlify
5. **Update frontend API URL** to point to your Render service

---

## 💰 **Cost Estimation**

| Plan | Monthly Cost | Best For |
|------|-------------|----------|
| **Free** | $0 | Testing, development, low traffic |
| **Pro** | $7 | Production, moderate traffic |
| **Pro + Worker** | $14 | High traffic with background processing |

---

## ✅ **Success Checklist**

- [ ] API deploys successfully
- [ ] Health endpoint responds
- [ ] Chart generation works
- [ ] Audio generation works
- [ ] Environment variables set
- [ ] ProKerala API credentials configured
- [ ] Custom domain set up (optional)
- [ ] Frontend connected to API

---

## 🎵 **Ready to Deploy!**

Your Astradio API is perfectly suited for Render. The platform will handle your Node.js application, audio generation, and database needs without the monorepo complications we encountered with Railway.

**Deploy with confidence!** 🚀 