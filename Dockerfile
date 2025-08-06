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