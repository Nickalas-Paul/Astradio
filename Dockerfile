# Use Node LTS
FROM node:18

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Copy package.json files first for better caching
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/audio-mappings/package.json ./packages/audio-mappings/
COPY packages/astro-core/package.json ./packages/astro-core/
COPY packages/types/package.json ./packages/types/

# Install dependencies using pnpm (handles workspaces properly)
# Use --no-frozen-lockfile since we don't have pnpm-lock.yaml
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the entire project using the root build script
RUN pnpm run build

# Change to the API directory
WORKDIR /usr/src/app/apps/api

# Expose port
EXPOSE 3001

# Start the API
CMD ["pnpm", "run", "start"] 