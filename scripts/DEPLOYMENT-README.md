# Astradio CLI-Only Deployment System

This deployment system provides **complete automation** for deploying the Astradio monorepo to Render (API) and Vercel (Web) **without ever touching the dashboards**.

## 🎯 **Zero-Dashboard Deployment**

Everything is handled via CLI:
- ✅ **Token Management**: Secure storage in Windows Credential Manager
- ✅ **Auto-Discovery**: Automatically finds Render Owner ID and Vercel Org/Project IDs
- ✅ **One-Command Deploy**: Single script handles everything
- ✅ **Health Monitoring**: Automatic smoke tests and status checks

## 🚀 **Quick Start**

### 1. **One-Time Setup**

```powershell
# Install required tools
npm i -g vercel pnpm

# Get your Render API key (only manual step)
# Visit: https://render.com/docs/api#authentication
```

### 2. **First Deployment**

```powershell
# Load environment and auto-discover IDs
. scripts/load-deploy-env.ps1

# Deploy everything (API → Render, Web → Vercel)
powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1
```

### 3. **Verify Deployment**

```powershell
# Check status
powershell -ExecutionPolicy Bypass -File scripts/deployment-status.ps1

# Run smoke tests
powershell -ExecutionPolicy Bypass -File scripts/smoke.ps1
```

## 📋 **Scripts Overview**

| Script | Purpose | Auto-Discovery |
|--------|---------|----------------|
| `load-deploy-env.ps1` | Load tokens & auto-discover IDs | ✅ Render Owner ID, Vercel Org/Project IDs |
| `test-deploy-setup.ps1` | Preflight checks | ✅ Tools, monorepo, git, build |
| `deploy.ps1` | Main deployment | ✅ API creation, env vars, smoke tests |
| `smoke.ps1` | Health verification | ✅ API + Web + CORS |
| `rollback.ps1` | Rollback deployments | ✅ Vercel rollback, Render guidance |
| `deployment-status.ps1` | Status dashboard | ✅ URLs, health, readiness |

## 🔐 **Security Features**

### **Token Storage**
- **Windows Credential Manager**: Secure at-rest storage
- **Fallback**: `.env` files for development
- **Rotation**: Re-run `load-deploy-env.ps1` to update

### **Auto-Discovery Logic**

#### **Render Auto-Discovery**
```powershell
# Uses RENDER_API_KEY to fetch owner info
GET https://api.render.com/v1/owners
# Prefers team over user account
```

#### **Vercel Auto-Discovery**
```powershell
# Uses VERCEL_TOKEN to fetch org/project info
GET https://api.vercel.com/v2/teams
GET https://api.vercel.com/v9/projects?teamId={org_id}
# Finds astradio* projects automatically
```

## 🛠 **Deployment Flow**

### **Phase 1: Environment Setup**
1. Load tokens from Credential Manager
2. Auto-discover missing IDs via APIs
3. Prompt for any remaining required values

### **Phase 2: Render API Deployment**
1. Find existing service or create new one
2. Set CORS origins for web app
3. Trigger deployment and wait for health

### **Phase 3: Vercel Web Deployment**
1. Link to correct project
2. Set `NEXT_PUBLIC_API_URL` for all environments
3. Deploy with prebuilt output

### **Phase 4: Verification**
1. Health checks on both services
2. API functionality tests
3. CORS verification

## 🔄 **Rollback Process**

```powershell
# Rollback web app to previous deployment
powershell -ExecutionPolicy Bypass -File scripts/rollback.ps1 -target web

# Rollback both (web + API guidance)
powershell -ExecutionPolicy Bypass -File scripts/rollback.ps1 -target both
```

## 📊 **Monitoring & Status**

### **Current Status**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/deployment-status.ps1
```

**Output includes:**
- Environment configuration status
- Current deployment health
- API and Web app URLs
- Vercel project status
- Environment variables status

### **Health Checks**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke.ps1
```

**Tests:**
- API health endpoint (`/health`)
- Ephemeris API functionality
- Audio generation API
- Web app accessibility
- CORS configuration

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Render API Key Issues**
```powershell
# Clear stored key and re-enter
cmdkey /delete:Astradio:RENDER_API_KEY
. scripts/load-deploy-env.ps1
```

#### **Vercel Authentication Issues**
```powershell
# Re-authenticate with Vercel
vercel logout
vercel login
```

#### **Build Failures**
```powershell
# Check local build first
pnpm verify
pnpm -w build
```

### **Environment Variables**

#### **Required**
- `RENDER_API_KEY`: Render API key (auto-stored in Credential Manager)
- `RENDER_OWNER_ID`: Auto-discovered from API
- `VERCEL_ORG_ID`: Auto-discovered from API (or prompt)
- `VERCEL_PROJECT_ID`: Auto-discovered from API

#### **Optional**
- `VERCEL_TOKEN`: For non-interactive deployment
- `RENDER_SERVICE_NAME`: Defaults to "Astradio-1"
- `RENDER_REGION`: Defaults to "oregon"

## 🎯 **Production URLs**

After successful deployment:

- **API**: `https://astradio-1.onrender.com`
- **Web**: `https://astradio-web.vercel.app`

## 📝 **Example Workflow**

```powershell
# 1. Check current status
powershell -ExecutionPolicy Bypass -File scripts/deployment-status.ps1

# 2. Load environment (auto-discovers IDs)
. scripts/load-deploy-env.ps1

# 3. Deploy everything
powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1

# 4. Verify deployment
powershell -ExecutionPolicy Bypass -File scripts/smoke.ps1

# 5. Check final status
powershell -ExecutionPolicy Bypass -File scripts/deployment-status.ps1
```

## 🚨 **Emergency Procedures**

### **Complete Reset**
```powershell
# Clear all stored credentials
cmdkey /delete:Astradio:RENDER_API_KEY
cmdkey /delete:Astradio:VERCEL_TOKEN

# Re-run setup
. scripts/load-deploy-env.ps1
```

### **Manual Override**
```powershell
# Set environment variables manually
$env:RENDER_API_KEY = "your_key_here"
$env:RENDER_OWNER_ID = "your_owner_id"
$env:VERCEL_ORG_ID = "your_org_id"

# Deploy
powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1
```

---

## ✅ **Success Criteria**

Your deployment is successful when:
- ✅ API responds at `/health` with 200
- ✅ Web app loads without errors
- ✅ `NEXT_PUBLIC_API_URL` is set correctly
- ✅ CORS allows web → API communication
- ✅ All smoke tests pass

**No dashboard interaction required!** 🎉
