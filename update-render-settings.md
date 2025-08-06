# Update Render Service Settings

## Current Issue
The Docker build is failing because the build context is set to `apps/api`, but the Dockerfile needs access to the entire monorepo structure.

## Solution: Update Build Context

1. Go to your Render service dashboard
2. Click on your `astradio-api` service
3. Go to **Settings** tab
4. Scroll down to **Build & Deploy** section
5. Update these settings:

### Docker Settings
- **Root Directory**: `apps/api` (keep this)
- **Dockerfile Path**: `apps/api/Dockerfile` (keep this)
- **Docker Build Context Directory**: `./` (change this to root)
- **Docker Command**: (leave empty or remove if set)

### Alternative: Move Dockerfile to Root
If the above doesn't work, you can also:

1. Move the Dockerfile to the project root
2. Update the Dockerfile path in Render to: `./Dockerfile`
3. Set build context to: `./`

## Updated Dockerfile (if moved to root)
```dockerfile
# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Copy workspace package files
COPY packages/*/package*.json ./packages/*/
COPY apps/*/package*.json ./apps/*/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build all packages in dependency order
RUN npm run build

# Change to the API directory
WORKDIR /usr/src/app/apps/api

# Build the API (packages are already built)
RUN npm run build

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"]
```

## After Updating Settings
1. Save the changes
2. Go to **Manual Deploy** section
3. Click **"Clear build cache & deploy"**

This should resolve the build context issue and allow the Docker build to access the entire monorepo structure. 