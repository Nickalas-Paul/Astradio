# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy the entire monorepo for workspace dependencies
COPY . .

# Install dependencies (this will handle workspace packages)
RUN npm install

# Change to the API directory
WORKDIR /usr/src/app/apps/api

# Build the TypeScript app
RUN npm run build

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"] 