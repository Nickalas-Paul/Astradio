# 🚀 Astradio Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying Astradio to production using Vercel (frontend) and Railway/Render (backend).

## Prerequisites

### ✅ Before Deployment Checklist
- [ ] GitHub repository is clean and committed
- [ ] API builds successfully (`cd apps/api && npm run build`)
- [ ] Frontend builds successfully (`cd apps/web && npm run build`)
- [ ] Environment variables are prepared
- [ ] Prokerala API keys are obtained

## 1️⃣ Backend Deployment (API Server)

### Option A: Railway Deployment

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy API**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your Astradio repository
   - Set the root directory to `apps/api`
   - Railway will automatically detect it's a Node.js project

3. **Configure Environment Variables**
   ```env
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   DATABASE_URL=./data/astradio.db
   ASTRO_CLIENT_ID=your-prokerala-client-id
   ASTRO_CLIENT_SECRET=your-prokerala-client-secret
   ASTRO_TOKEN_URL=https://api.prokerala.com/v2/astrology/
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ENABLE_HTTPS=true
   TRUST_PROXY=true
   LOG_LEVEL=info
   ENABLE_REQUEST_LOGGING=true
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=audio/wav,audio/mp3,audio/ogg
   SESSION_SECRET=your-session-secret-key
   SESSION_MAX_AGE=86400000
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-api.railway.app`)

### Option B: Render Deployment

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set root directory to `apps/api`

3. **Configure Build Settings**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Add Environment Variables**
   - Same as Railway above

5. **Deploy**
   - Render will build and deploy automatically
   - Note the generated URL

## 2️⃣ Frontend Deployment (Next.js)

### Vercel Deployment

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your Astradio GitHub repository
   - Set the root directory to `apps/web`

3. **Configure Build Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
   ```

5. **Deploy**
   - Vercel will automatically build and deploy
   - Note the generated URL (e.g., `https://astradio.vercel.app`)

## 3️⃣ Post-Deployment Configuration

### Update API Base URL
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Update `NEXT_PUBLIC_API_URL` to your actual API URL
4. Redeploy the frontend

### Update CORS Settings
1. Go to your Railway/Render dashboard
2. Update `FRONTEND_URL` in environment variables
3. Redeploy the backend

## 4️⃣ Domain Configuration (Optional)

### Custom Domain Setup
1. **Frontend (Vercel)**
   - Go to project settings → Domains
   - Add your custom domain
   - Configure DNS as instructed

2. **Backend (Railway/Render)**
   - Add custom domain in platform settings
   - Update DNS records

## 5️⃣ Environment Files

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://astradio.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=./data/astradio.db
ASTRO_CLIENT_ID=your-prokerala-client-id
ASTRO_CLIENT_SECRET=your-prokerala-client-secret
ASTRO_TOKEN_URL=https://api.prokerala.com/v2/astrology/
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_HTTPS=true
TRUST_PROXY=true
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=audio/wav,audio/mp3,audio/ogg
SESSION_SECRET=your-session-secret-key
SESSION_MAX_AGE=86400000
```

## 6️⃣ Testing Deployment

### Health Check
```bash
# Test API health
curl https://your-api-url.railway.app/health

# Test frontend
curl https://astradio.vercel.app
```

### Feature Testing
1. **Landing Page**: Visit your frontend URL
2. **Chart Generation**: Test birth data form
3. **Audio Playback**: Test audio generation
4. **Export/Share**: Test session export
5. **Overlay Mode**: Test dual chart comparison
6. **Sandbox Mode**: Test interactive features

## 7️⃣ Monitoring & Maintenance

### Health Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)
- Set up logging (LogSnag)

### Performance Optimization
- Enable Vercel Analytics
- Configure CDN caching
- Monitor API response times

## 8️⃣ Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

**CORS Errors**
- Verify `FRONTEND_URL` in backend environment
- Check API URL in frontend environment

**Audio Issues**
- Verify Tone.js compatibility
- Check browser audio permissions
- Test in different browsers

**Database Issues**
- Verify SQLite file permissions
- Check database path configuration

## 9️⃣ Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] API keys are properly secured
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Environment variables are not exposed

## 🔗 Production URLs

- **Frontend**: `https://astradio.vercel.app`
- **Backend**: `https://your-api-url.railway.app`
- **API Health**: `https://your-api-url.railway.app/health`

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs for errors
3. Test locally before deploying
4. Verify environment variables

---

**🎉 Congratulations! Astradio is now live in production!** 