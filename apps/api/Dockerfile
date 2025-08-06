# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy the entire project (build context should be the root)
COPY . .

# Install root dependencies
RUN npm install

# Install workspace package dependencies
RUN cd packages/astro-core && npm install
RUN cd packages/audio-mappings && npm install
RUN cd apps/api && npm install

# Build workspace packages first
RUN cd packages/astro-core && npm run build
RUN cd packages/audio-mappings && npm run build

# Build the API (packages are already built)
RUN cd apps/api && npm run build

# Change to the API directory
WORKDIR /usr/src/app/apps/api

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"] 