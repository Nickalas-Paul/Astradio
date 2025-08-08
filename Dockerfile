FROM node:18

WORKDIR /usr/src/app
COPY . .

# Enable Corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install deps WITH lockfile
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm run build

CMD ["node", "apps/api/dist/app.js"] 