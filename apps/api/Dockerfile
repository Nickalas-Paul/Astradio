# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy the entire project (build context should be the root)
COPY . .

# Install dependencies
RUN npm install

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