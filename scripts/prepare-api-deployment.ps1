# Prepare API for standalone deployment
# This script creates a clean API deployment structure

Write-Host "🚀 Preparing API for standalone deployment..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Create API deployment directory
$apiDeployDir = "api-deployment"
if (Test-Path $apiDeployDir) {
    Remove-Item $apiDeployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $apiDeployDir

Write-Host "📁 Creating API deployment structure..." -ForegroundColor Cyan

# Copy API source
Copy-Item "apps/api/src" "$apiDeployDir/src" -Recurse
Copy-Item "apps/api/package.json" "$apiDeployDir/package.json"
Copy-Item "apps/api/tsconfig.json" "$apiDeployDir/tsconfig.json"
Copy-Item "apps/api/env.example" "$apiDeployDir/env.example"

# Create packages directory and copy built packages
New-Item -ItemType Directory -Path "$apiDeployDir/packages" -Force

# Copy built packages
Copy-Item "packages/astro-core/dist" "$apiDeployDir/packages/astro-core/dist" -Recurse
Copy-Item "packages/astro-core/package.json" "$apiDeployDir/packages/astro-core/package.json"
Copy-Item "packages/audio-mappings/dist" "$apiDeployDir/packages/audio-mappings/dist" -Recurse
Copy-Item "packages/audio-mappings/package.json" "$apiDeployDir/packages/audio-mappings/package.json"
Copy-Item "packages/types/dist" "$apiDeployDir/packages/types/dist" -Recurse
Copy-Item "packages/types/package.json" "$apiDeployDir/packages/types/package.json"

# Create standalone package.json for API
$apiPackageJson = @{
    name = "astradio-api"
    version = "1.0.0"
    main = "dist/app.js"
    scripts = @{
        build = "tsc"
        start = "node dist/app.js"
        dev = "nodemon src/app.ts"
    }
    dependencies = @{
        express = "^4.18.2"
        cors = "^2.8.5"
        helmet = "^7.1.0"
        morgan = "^1.10.0"
        compression = "^1.7.4"
        dotenv = "^16.3.1"
        sqlite3 = "^5.1.6"
        sqlite = "^5.0.1"
        bcryptjs = "^2.4.3"
        jsonwebtoken = "^9.0.2"
        uuid = "^9.0.1"
        express-rate-limit = "^7.1.5"
        express-validator = "^7.0.1"
        zod = "^3.22.4"
        express-slow-down = "^2.0.1"
        hpp = "^0.2.3"
        express-mongo-sanitize = "^2.2.0"
        xss-clean = "^0.1.4"
        axios = "^1.6.0"
    }
    devDependencies = @{
        "@types/express" = "^4.17.21"
        "@types/cors" = "^2.8.17"
        "@types/morgan" = "^1.9.9"
        "@types/compression" = "^1.7.5"
        "@types/bcryptjs" = "^2.4.6"
        "@types/jsonwebtoken" = "^9.0.5"
        "@types/uuid" = "^9.0.7"
        "@types/node" = "^20.0.0"
        "typescript" = "^5.0.0"
        "nodemon" = "^3.0.2"
        "ts-node" = "^10.9.1"
    }
}

# Convert to JSON and save
$apiPackageJson | ConvertTo-Json -Depth 10 | Out-File "$apiDeployDir\package.json" -Encoding UTF8

# Create Railway-specific Dockerfile
$dockerfile = @'
# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript app
RUN npm run build

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"]
'@

$dockerfile | Out-File "$apiDeployDir\Dockerfile" -Encoding UTF8

# Create .dockerignore
$dockerignore = @'
node_modules
npm-debug.log*
.env
.env.local
.git
.gitignore
README.md
'@

$dockerignore | Out-File "$apiDeployDir\.dockerignore" -Encoding UTF8

Write-Host "✅ API deployment structure created!" -ForegroundColor Green
Write-Host "📁 Location: $apiDeployDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create new GitHub repo for API" -ForegroundColor White
Write-Host "2. Push this to the new repo" -ForegroundColor White
Write-Host "3. Deploy to Railway" -ForegroundColor White
Write-Host ""
Write-Host "🎯 This will be a clean, standalone API deployment!" -ForegroundColor Green 