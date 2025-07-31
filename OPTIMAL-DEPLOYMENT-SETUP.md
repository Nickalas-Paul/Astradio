# 🚀 Optimal Deployment Strategy for Astradio

## 🎯 **Overview**
This setup provides the most efficient, reliable deployment strategy for your monorepo:
- **Frontend (Next.js)**: Deployed to Vercel
- **Backend (Node.js API)**: Deployed to Railway
- **Automated**: GitHub Actions handles everything

## 📋 **One-Time Setup Steps**

### **Step 1: Prepare API Deployment**
```powershell
# Run the preparation script
.\scripts\prepare-api-deployment.ps1
```

### **Step 2: Create API Repository**
1. Create new GitHub repository: `astradio-api`
2. Push the `api-deployment` folder to the new repo
3. This will be your standalone API deployment

### **Step 3: Set Up Vercel (Frontend)**
1. Go to [vercel.com](https://vercel.com)
2. Import your main repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### **Step 4: Set Up Railway (Backend)**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect to your `astradio-api` repository
4. Configure:
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

### **Step 5: Configure GitHub Secrets**
Add these secrets to your main repository:

**For Railway:**
- `RAILWAY_TOKEN`: Get from Railway dashboard

**For Vercel:**
- `VERCEL_TOKEN`: Get from Vercel dashboard
- `VERCEL_ORG_ID`: Get from Vercel dashboard  
- `VERCEL_PROJECT_ID`: Get from Vercel dashboard

## 🔄 **How It Works**

### **Automated Pipeline:**
1. **Push to main branch** → Triggers GitHub Actions
2. **Build monorepo** → Compiles all packages
3. **Prepare API** → Creates standalone API with built packages
4. **Deploy API** → Pushes to Railway
5. **Deploy Web** → Pushes to Vercel

### **Manual Deployment:**
```powershell
# Build and prepare API
npm run build
.\scripts\prepare-api-deployment.ps1

# Deploy API to Railway
cd api-deployment
# Follow Railway deployment steps

# Deploy Web to Vercel
# Follow Vercel deployment steps
```

## 🎯 **Benefits of This Strategy**

### **Separation of Concerns:**
- ✅ API and Web are independent
- ✅ Each service scales independently
- ✅ No monorepo deployment issues

### **Best Platform for Each:**
- ✅ **Vercel**: Optimized for Next.js, automatic deployments
- ✅ **Railway**: Great for Node.js APIs, simple configuration

### **Reliability:**
- ✅ Automated builds and deployments
- ✅ No more workspace dependency issues
- ✅ Easy rollbacks and monitoring

### **Cost Efficiency:**
- ✅ Free tiers available for both platforms
- ✅ Scales automatically with usage
- ✅ No server management needed

## 🔧 **Environment Variables**

### **API (Railway):**
```env
PORT=3001
NODE_ENV=production
# Add your API environment variables
```

### **Web (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://your-railway-api.railway.app
# Add your frontend environment variables
```

## 🚀 **Deployment Commands**

### **Initial Setup:**
```bash
# 1. Prepare API deployment
.\scripts\prepare-api-deployment.ps1

# 2. Create API repo and push
git init api-deployment
cd api-deployment
git add .
git commit -m "Initial API deployment"
git remote add origin https://github.com/your-username/astradio-api.git
git push -u origin main

# 3. Set up Railway and Vercel
# Follow the platform-specific setup steps above
```

### **Ongoing Deployments:**
```bash
# Just push to main branch - GitHub Actions handles everything!
git push origin main
```

## 📊 **Monitoring & Maintenance**

### **Railway Dashboard:**
- Monitor API performance
- View logs and errors
- Scale resources as needed

### **Vercel Dashboard:**
- Monitor web performance
- View analytics and errors
- Manage domains and SSL

### **GitHub Actions:**
- Monitor build status
- View deployment logs
- Debug any issues

## 🎯 **Success Metrics**

After setup, you should have:
- ✅ API running on Railway (port 3001)
- ✅ Web running on Vercel (custom domain)
- ✅ Automated deployments on push
- ✅ No more workspace dependency errors
- ✅ Independent scaling for each service

---

**This setup is designed to be a one-time configuration that works reliably forever!** 🚀 