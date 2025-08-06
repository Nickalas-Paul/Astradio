#!/bin/bash

# 🛠️ Render CLI Setup Script for Astradio
# This script installs and configures the Render CLI for backend deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛠️  Render CLI Setup for Astradio${NC}"
echo "====================================="

# Detect OS
OS=$(uname -s)
case "$OS" in
    Linux*)     PLATFORM="linux" ;;
    Darwin*)    PLATFORM="macos" ;;
    CYGWIN*|MINGW*|MSYS*) PLATFORM="windows" ;;
    *)          PLATFORM="unknown" ;;
esac

echo -e "${YELLOW}📋 Detected platform: $PLATFORM${NC}"

# Check if Render CLI is already installed
if command -v render &> /dev/null; then
    echo -e "${GREEN}✅ Render CLI is already installed${NC}"
    render --version
else
    echo -e "${YELLOW}📦 Installing Render CLI...${NC}"
    
    case "$PLATFORM" in
        "linux"|"macos")
            # Install via curl
            echo "Installing via curl..."
            curl -sL https://render.com/download-cli/install.sh | bash
            
            # Add to PATH if not already there
            if [[ ":$PATH:" != *":$HOME/.render/bin:"* ]]; then
                echo 'export PATH="$HOME/.render/bin:$PATH"' >> ~/.bashrc
                echo 'export PATH="$HOME/.render/bin:$PATH"' >> ~/.zshrc
                export PATH="$HOME/.render/bin:$PATH"
            fi
            ;;
        "windows")
            echo -e "${YELLOW}For Windows, please install Render CLI manually:${NC}"
            echo "1. Download from: https://render.com/docs/cli"
            echo "2. Or install via npm: npm install -g @render/cli"
            echo "3. Or install via chocolatey: choco install render-cli"
            exit 1
            ;;
        *)
            echo -e "${RED}❌ Unsupported platform: $PLATFORM${NC}"
            echo "Please install Render CLI manually from: https://render.com/docs/cli"
            exit 1
            ;;
    esac
fi

# Verify installation
if command -v render &> /dev/null; then
    echo -e "${GREEN}✅ Render CLI installed successfully${NC}"
    render --version
else
    echo -e "${RED}❌ Render CLI installation failed${NC}"
    exit 1
fi

# Check if jq is installed (needed for JSON parsing in deployment script)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}📦 Installing jq for JSON parsing...${NC}"
    case "$PLATFORM" in
        "linux")
            if command -v apt-get &> /dev/null; then
                sudo apt-get update && sudo apt-get install -y jq
            elif command -v yum &> /dev/null; then
                sudo yum install -y jq
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y jq
            else
                echo -e "${YELLOW}⚠️  Please install jq manually for your distribution${NC}"
            fi
            ;;
        "macos")
            if command -v brew &> /dev/null; then
                brew install jq
            else
                echo -e "${YELLOW}⚠️  Please install Homebrew and then run: brew install jq${NC}"
            fi
            ;;
        "windows")
            echo -e "${YELLOW}⚠️  Please install jq manually for Windows${NC}"
            echo "Download from: https://stedolan.github.io/jq/download/"
            ;;
    esac
fi

# Make deployment scripts executable
echo -e "${YELLOW}🔧 Making deployment scripts executable...${NC}"
chmod +x deploy-render-backend.sh 2>/dev/null || echo "deploy-render-backend.sh not found"

# Create .env template if it doesn't exist
if [ ! -f "apps/api/.env" ]; then
    echo -e "${YELLOW}📝 Creating .env template...${NC}"
    cp apps/api/env.example apps/api/.env
    echo -e "${GREEN}✅ Created apps/api/.env from template${NC}"
    echo -e "${YELLOW}⚠️  Please update apps/api/.env with your actual values${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Display next steps
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Get your Render API token from: https://render.com/docs/api#authentication"
echo "2. Run: ./deploy-render-backend.sh"
echo "3. Or for Windows: .\deploy-render-backend.ps1"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "  Check CLI version: render --version"
echo "  Login to Render: render login"
echo "  Check authentication: render whoami"
echo "  List services: render services list"

echo ""
echo -e "${GREEN}🎉 Render CLI setup completed!${NC}" 