# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy the entire project
COPY . .

# Install all dependencies
RUN npm install

# Build workspace packages first
RUN cd packages/astro-core && npm install && npm run build
RUN cd packages/audio-mappings && npm install && npm run build

# Build the API
RUN cd apps/api && npm install && npm run build

# Debug: Check if directories exist
RUN ls -la apps/api/dist/
RUN ls -la apps/api/dist/database/ || echo "database directory doesn't exist"
RUN ls -la apps/api/src/database/

# Copy schema.sql to dist folder
RUN mkdir -p apps/api/dist/database && cp apps/api/src/database/schema.sql apps/api/dist/database/schema.sql

# Change to the API directory
WORKDIR /usr/src/app/apps/api

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"] 