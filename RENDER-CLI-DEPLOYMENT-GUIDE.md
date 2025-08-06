# 🚀 Render CLI Deployment Guide for Astradio Backend

## Overview

This guide provides a complete setup for deploying the Astradio backend API to Render using CLI only, eliminating the need for web UI configuration.

## 🏗️ Architecture

- **Backend**: Node.js/Express API (`apps/api`)
- **Frontend**: Next.js app (`apps/web`) 
- **Deployment**: Render CLI with monorepo support
- **Database**: SQLite (local) / PostgreSQL (production)

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **API Token**: Get from [Render API Settings](https://render.com/docs/api#authentication)
3. **Node.js**: Version 18+ installed
4. **Git**: Repository access

## 🛠️ Quick Setup

### 1. Install Render CLI

```bash
# Run the setup script
./setup-render-cli.sh

# Or install manually
curl -sL https://render.com/download-cli/install.sh | bash
```

### 2. Authenticate with Render

```bash
# Login with your API token
render login
```

### 3. Deploy Backend

```bash
# Deploy using the automated script
./deploy-render-backend.sh

# Or for Windows PowerShell
.\deploy-render-backend.ps1
```

## 📁 File Structure

```
Astradio/
├── render.yaml                    # Render service configuration
├── deploy-render-backend.sh      # Bash deployment script
├── deploy-render-backend.ps1     # PowerShell deployment script
├── setup-render-cli.sh          # CLI setup script
├── apps/
│   ├── api/                     # Backend API
│   │   ├── src/
│   │   ├── package.json
│   │   └── env.example
│   └── web/                     # Frontend (deployed to Vercel)
```

## ⚙️ Configuration

### render.yaml

The `render.yaml` file defines the backend service:

```yaml
services:
  - type: web
    name: astradio-api
    env: node
    plan: free
    buildCommand: |
      cd apps/api
      npm install
      npm run build
    startCommand: |
      cd apps/api
      npm start
    healthCheckPath: /health
    rootDir: apps/api
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      # ... other environment variables
```

### Environment Variables

Key environment variables for the backend:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | production |
| `JWT_SECRET` | JWT signing secret | Required |
| `DATABASE_URL` | Database connection | ./data/astradio.db |
| `FRONTEND_URL` | Frontend URL for CORS | Required |

## 🚀 Deployment Process

### Automated Deployment

The deployment scripts handle:

1. **Prerequisites Check**: CLI installation, authentication
2. **Service Management**: Create/update service via CLI
3. **Environment Setup**: Configure environment variables
4. **Build & Deploy**: Execute build and start commands
5. **Health Monitoring**: Wait for deployment completion
6. **URL Retrieval**: Get service URL for frontend integration

### Manual Deployment

```bash
# 1. Create service
render services create --file render.yaml

# 2. Deploy service
render services deploy astradio-api

# 3. Check status
render services list --name astradio-api

# 4. View logs
render services logs astradio-api
```

## 🔧 CLI Commands Reference

### Service Management

```bash
# List all services
render services list

# Get service details
render services show astradio-api

# Update service
render services update astradio-api --file render.yaml

# Delete service
render services delete astradio-api
```

### Deployment

```bash
# Deploy service
render services deploy astradio-api

# View deployment logs
render services logs astradio-api

# Open service in browser
render services open astradio-api
```

### Environment Variables

```bash
# List environment variables
render services env-vars list astradio-api

# Set environment variable
render services env-vars set astradio-api KEY=value

# Delete environment variable
render services env-vars delete astradio-api KEY
```

## 🔍 Troubleshooting

### Common Issues

1. **CLI Not Found**
   ```bash
   # Reinstall Render CLI
   curl -sL https://render.com/download-cli/install.sh | bash
   ```

2. **Authentication Failed**
   ```bash
   # Re-authenticate
   render logout
   render login
   ```

3. **Build Failed**
   ```bash
   # Check logs
   render services logs astradio-api
   
   # Verify local build
   cd apps/api && npm install && npm run build
   ```

4. **Service Not Starting**
   ```bash
   # Check health endpoint
   curl https://your-service.onrender.com/health
   
   # View startup logs
   render services logs astradio-api --tail 50
   ```

### Debug Commands

```bash
# Check CLI version
render --version

# Verify authentication
render whoami

# Test local build
cd apps/api
npm install
npm run build
npm start
```

## 🔗 Integration with Frontend

### Update Frontend Configuration

After successful backend deployment, update your frontend environment:

```typescript
// apps/web/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://astradio-api.onrender.com';
```

### CORS Configuration

The backend is configured to accept requests from:
- Local development: `http://localhost:3000`
- Production frontend: Your Vercel domain

## 📊 Monitoring

### Health Checks

- **Endpoint**: `/health`
- **Expected Response**: `{ "status": "ok", "timestamp": "..." }`

### Logs

```bash
# View real-time logs
render services logs astradio-api --follow

# View recent logs
render services logs astradio-api --tail 100
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Render
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -sL https://render.com/download-cli/install.sh | bash
          echo $RENDER_TOKEN | render login
          render services deploy astradio-api
        env:
          RENDER_TOKEN: ${{ secrets.RENDER_TOKEN }}
```

## 🎯 Next Steps

1. **Deploy Backend**: Run `./deploy-render-backend.sh`
2. **Update Frontend**: Configure API URL in frontend
3. **Test Integration**: Verify API connectivity
4. **Monitor Performance**: Set up logging and monitoring
5. **Scale Up**: Upgrade to paid plan for production

## 📞 Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **CLI Reference**: [render.com/docs/cli](https://render.com/docs/cli)
- **API Reference**: [render.com/docs/api](https://render.com/docs/api)

---

**Ready to deploy?** Run `./setup-render-cli.sh` to get started! 