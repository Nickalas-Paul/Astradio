#!/bin/bash
set -e

echo "🔧 Setting up build environment..."

# Enable corepack for pnpm
corepack enable

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
    echo "📦 Using pnpm for installation..."
    pnpm install --frozen-lockfile
    echo "🔨 Building API with pnpm..."
    pnpm --filter api build
else
    echo "📦 pnpm not available, falling back to npm..."
    npm install
    echo "🔨 Building API with npm..."
    npm run build --workspace=apps/api
fi

echo "✅ Build completed successfully!"
