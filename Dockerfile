FROM node:18

WORKDIR /usr/src/app
COPY . .

# Install all dependencies including devDependencies
RUN npm install

# Build everything including typescript
RUN npm run build

# Start API server
CMD ["npm", "run", "start"] 