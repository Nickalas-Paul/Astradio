# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy the entire project
COPY . .

# Install all dependencies
RUN npm install

# Build workspace packages first
RUN npm run build:packages

# Build the API
RUN cd apps/api && npm run build

# Change to the API directory
WORKDIR /usr/src/app/apps/api

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"] 