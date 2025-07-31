# 🚀 Railway Deployment Configuration Guide

## ✅ What We've Already Done
- ✅ Created custom Dockerfile in `apps/api/`
- ✅ Added `.dockerignore` for optimization
- ✅ Committed and pushed changes to GitHub
- ✅ Ready for Railway to pick up the new Dockerfile

## 📋 Step-by-Step Railway Configuration

### Step 1: Access Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Sign in to your account
3. Click on your **Astradio** project

### Step 2: Navigate to Settings
1. In your project dashboard, look for the **Settings** tab
2. Click on **Settings** (usually in the top navigation)

### Step 3: Configure Build & Deploy Settings
1. Scroll down to find the **"Build & Deploy"** section
2. Look for these configuration fields and set them exactly as shown:

#### 🔧 Required Settings:
- **Root Directory**: `apps/api`
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

### Step 4: Save and Deploy
1. Click the **"Save"** button
2. Go back to the **Deployments** tab
3. Click **"Deploy"** to trigger a new deployment

## 🎯 Expected Results

After this configuration:
- ✅ Railway will use your custom Dockerfile instead of Nixpacks
- ✅ All workspace dependencies (`@astradio/*`) will be properly resolved
- ✅ TypeScript compilation should succeed
- ✅ API should start successfully on port 3001

## 🔍 How to Verify Success

1. **Check Build Logs**: Look for successful TypeScript compilation
2. **Check Deployment**: Should show "Deployed successfully"
3. **Test API**: Your API endpoints should be accessible

## 🚨 If You Still See Errors

If you encounter any issues:
1. Check that the **Root Directory** is exactly `apps/api`
2. Verify all commands are exactly as shown above
3. Make sure you clicked **Save** before deploying
4. Check the build logs for specific error messages

## 📞 Need Help?

If you're still having trouble:
1. Share the specific error messages from Railway
2. I can help troubleshoot the configuration
3. We can adjust the Dockerfile if needed

---

**Time to complete**: ~2-3 minutes
**Difficulty**: Easy (just copy-paste the settings) 