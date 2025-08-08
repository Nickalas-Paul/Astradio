FROM node:18

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app
COPY . .

# Install all dependencies including devDependencies
RUN pnpm install --frozen-lockfile

# Build everything including typescript
RUN pnpm run build

# Start API server
CMD ["pnpm", "--filter", "@astradio/api", "start"] 