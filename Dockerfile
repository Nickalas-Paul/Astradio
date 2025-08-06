# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy the entire project
COPY . .

# Install all dependencies (this will install workspace packages too)
RUN npm install

# Build the entire project using the root build script
RUN npm run build

# Change to the API directory
WORKDIR /usr/src/app/apps/api

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"] 