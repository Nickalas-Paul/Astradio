# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/*/package*.json ./packages/*/

# Install root dependencies
RUN npm install

# Install API dependencies specifically
RUN cd apps/api && npm install

# Copy source code
COPY . .

# Build the API
RUN cd apps/api && npm run build

# Expose port
EXPOSE 3001

# Start the API
CMD ["cd", "apps/api", "&&", "npm", "start"] 