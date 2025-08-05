# 🚀 Astradio Production Deployment Guide

## Overview

Your AI music generator is now **production-ready** with complete file storage, user ecosystem, and security features. This guide provides step-by-step instructions for deploying to production platforms.

## ✅ Pre-Deployment Checklist

### Core Features Verified
- ✅ AI Music Generator with Swiss Ephemeris integration
- ✅ File storage system (`/public/audio/` directory)
- ✅ Static file serving via Express (`/audio/*.wav`)
- ✅ Complete user authentication system
- ✅ Subscription management with Stripe
- ✅ Security middleware and rate limiting
- ✅ Comprehensive test suite

### Technical Requirements
- ✅ TypeScript compilation working
- ✅ All dependencies installed
- ✅ Environment variables configured
- ✅ Database schema ready
- ✅ Audio file generation tested

## 🎯 Deployment Strategy

### Backend Deployment (Render/Railway)

#### Option 1: Render (Recommended)
```yaml
# render.yaml (already configured)
services:
  - type: web
    name: astradio-api
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
    rootDir: apps/api
```

**Deployment Steps:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Configure:
   - **Name**: `astradio-api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

#### Option 2: Railway (Fallback)
```json
// railway.json (already configured)
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "cd apps/api && npm install && npm run build && npm start",
    "healthcheckPath": "/health"
  }
}
```

**Deployment Steps:**
1. Go to [Railway Dashboard](https://railway.app)
2. Connect your GitHub repository
3. Railway auto-deploys using `railway.json`

### Frontend Deployment (Vercel)

```json
// vercel.json (create this file)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**Deployment Steps:**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

## 🔧 Environment Configuration

### Backend Environment Variables

Set these in your deployment platform:

```bash
# Core Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret

# Database
DATABASE_URL=./data/astradio.db

# Security
ENABLE_HTTPS=true
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Storage
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=audio/wav,audio/mp3,audio/ogg

# Swiss Ephemeris
SWISS_EPHEMERIS_ENABLED=true
SWISS_EPHEMERIS_PRECISION=high

# Optional: Email & Payments
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

## 🧪 Post-Deployment Verification

### 1. Health Checks
```bash
# Backend health
curl https://your-api-domain.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "port": 3001,
  "database": "./data/astradio.db"
}
```

### 2. Audio File Generation Test
```bash
# Test audio generation
curl -X POST https://your-api-domain.com/api/audio/generate \
  -H "Content-Type: application/json" \
  -d '{
    "chartData": {
      "date": "2024-01-15",
      "time": "12:00",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "genre": "ambient"
  }'

# Expected response:
{
  "success": true,
  "data": {
    "audio_url": "/audio/daily-2024-01-15-ambient-30s.wav",
    "chart_id": "daily-2024-01-15",
    "genre": "ambient"
  }
}
```

### 3. File Access Test
```bash
# Test audio file access
curl -I https://your-api-domain.com/audio/daily-2024-01-15-ambient-30s.wav

# Should return 200 OK with audio/wav content-type
```

### 4. Frontend Integration Test
1. Visit your frontend domain
2. Generate a daily chart
3. Verify audio plays correctly
4. Check that files persist on refresh

## 🔄 Cloud Storage Migration (Optional)

### Phase 1: Supabase Storage
```typescript
// Add to apps/api/src/services/storageService.ts
import { createClient } from '@supabase/supabase-js';

export class StorageService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async uploadAudioFile(filePath: string, fileName: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await this.supabase.storage
      .from('audio-files')
      .upload(fileName, fileBuffer, {
        contentType: 'audio/wav'
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = this.supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    return publicUrl;
  }
}
```

### Phase 2: Cloudflare R2
```typescript
// Alternative: Cloudflare R2
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class R2StorageService {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadAudioFile(filePath: string, fileName: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    
    await this.client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: 'audio/wav',
    }));

    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  }
}
```

## 📊 Monitoring & Analytics

### Health Monitoring
```typescript
// Add to apps/api/src/middleware/monitoring.ts
export const healthCheck = (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };
  
  res.json(health);
};
```

### Performance Metrics
- API response times
- Audio generation success rate
- File storage usage
- User authentication success rate
- Error rates and types

## 🔒 Security Checklist

### Pre-Launch Security Review
- ✅ Rate limiting configured
- ✅ Input validation with Zod schemas
- ✅ CORS properly configured
- ✅ Helmet security headers enabled
- ✅ JWT tokens with proper expiration
- ✅ SQL injection prevention
- ✅ XSS protection enabled
- ✅ File upload restrictions
- ✅ Request size limiting

### Ongoing Security
- Regular dependency updates
- Security audit logs
- Rate limit monitoring
- Error tracking and alerting

## 🚀 Launch Checklist

### Final Pre-Launch Steps
1. **Domain Configuration**
   - Set up custom domains
   - Configure SSL certificates
   - Set up DNS records

2. **Monitoring Setup**
   - Configure health check alerts
   - Set up error tracking (Sentry)
   - Enable performance monitoring

3. **Backup Strategy**
   - Database backup configuration
   - File storage backup
   - Environment variable backup

4. **Documentation**
   - API documentation
   - User guides
   - Troubleshooting guides

### Launch Sequence
1. Deploy backend to Render/Railway
2. Deploy frontend to Vercel
3. Configure custom domains
4. Run comprehensive tests
5. Monitor for 24 hours
6. Announce public beta

## 🎯 Success Metrics

### Technical Metrics
- **Uptime**: >99.9%
- **Response Time**: <200ms average
- **Error Rate**: <1%
- **Audio Generation Success**: >95%

### User Metrics
- **Registration Rate**: Track new users
- **Audio Generation**: Monitor usage
- **File Downloads**: Track sharing
- **User Retention**: 7-day retention

## 📞 Support & Troubleshooting

### Common Issues
1. **Audio files not loading**
   - Check file permissions
   - Verify static file serving
   - Check CORS configuration

2. **API timeouts**
   - Monitor Swiss Ephemeris performance
   - Check rate limiting settings
   - Optimize database queries

3. **Authentication issues**
   - Verify JWT configuration
   - Check Supabase connection
   - Validate environment variables

### Emergency Procedures
1. **Rollback Plan**: Keep previous deployment ready
2. **Database Backup**: Regular automated backups
3. **Monitoring Alerts**: Immediate notification of issues
4. **Support Channels**: Clear communication paths

---

## 🎉 Ready for Launch!

Your AI music generator is now **production-ready** with:

- ✅ **Real-time WAV generation** from astrological charts
- ✅ **Persistent file storage** with public URLs
- ✅ **Complete user ecosystem** with authentication
- ✅ **Enterprise-grade security** and monitoring
- ✅ **Scalable architecture** ready for growth

**Next step**: Deploy and launch your public beta! 🚀 