# 🚀 Complete Deployment Setup Guide

## 📋 **Step-by-Step Setup**

### **Step 1: GitHub API Repository**
✅ Create repository: `astradio-api`
✅ Push API code (see terminal commands below)

### **Step 2: Railway Setup (Backend)**

1. **Go to Railway**: [railway.app](https://railway.app)
2. **Sign in** with GitHub
3. **Create New Project**
4. **Connect Repository**: Select your `astradio-api` repository
5. **Configure Settings**:
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
6. **Environment Variables** (add these):
   ```
   PORT=3001
   NODE_ENV=production
   ```
7. **Deploy**: Click "Deploy"

### **Step 3: Vercel Setup (Frontend)**

1. **Go to Vercel**: [vercel.com](https://vercel.com)
2. **Sign in** with GitHub
3. **Import Project**: Select your main `Astradio` repository
4. **Configure Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. **Environment Variables** (add these):
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-api.railway.app
   ```
6. **Deploy**: Click "Deploy"

### **Step 4: Test Everything**

1. **Test API**: Visit your Railway URL
2. **Test Web**: Visit your Vercel URL
3. **Test Connection**: Web should connect to API

## 🎯 **Expected Results**

After setup, you should have:
- ✅ API running on Railway (e.g., `https://astradio-api.railway.app`)
- ✅ Web running on Vercel (e.g., `https://astradio.vercel.app`)
- ✅ Web connecting to API successfully
- ✅ No more workspace dependency errors

## 🔧 **Troubleshooting**

### **If API fails to deploy:**
- Check Railway logs
- Verify environment variables
- Ensure all dependencies are in package.json

### **If Web fails to deploy:**
- Check Vercel logs
- Verify API URL environment variable
- Ensure Next.js configuration is correct

### **If Web can't connect to API:**
- Check CORS settings in API
- Verify API URL in environment variables
- Test API endpoint directly

---

**This setup will give you a production-ready, scalable deployment!** 🚀 