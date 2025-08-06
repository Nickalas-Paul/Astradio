#!/bin/bash

# 🚀 Astradio Backend Deployment Script for Render CLI
# This script deploys the backend API to Render using CLI only

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="astradio-api"
PROJECT_NAME="astradio"
ROOT_DIR="apps/api"

echo -e "${BLUE}🚀 Astradio Backend Deployment to Render${NC}"
echo "=========================================="

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo -e "${RED}❌ Render CLI is not installed.${NC}"
    echo "Please install it first:"
    echo "  npm install -g @render/cli"
    echo "  or"
    echo "  curl -sL https://render.com/download-cli/install.sh | bash"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if API directory exists
if [ ! -d "$ROOT_DIR" ]; then
    echo -e "${RED}❌ API directory not found: $ROOT_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Authenticate with Render (if not already authenticated)
echo -e "${YELLOW}🔐 Checking Render authentication...${NC}"
if ! render whoami &> /dev/null; then
    echo -e "${YELLOW}Please authenticate with Render...${NC}"
    echo "You'll need your Render API token."
    echo "Get it from: https://render.com/docs/api#authentication"
    render login
else
    echo -e "${GREEN}✅ Already authenticated with Render${NC}"
fi

# Check if service exists
echo -e "${YELLOW}🔍 Checking if service exists...${NC}"
if render services list --name "$SERVICE_NAME" &> /dev/null; then
    echo -e "${GREEN}✅ Service '$SERVICE_NAME' found${NC}"
    SERVICE_EXISTS=true
else
    echo -e "${YELLOW}⚠️  Service '$SERVICE_NAME' not found, will create new service${NC}"
    SERVICE_EXISTS=false
fi

# Create or update service
if [ "$SERVICE_EXISTS" = false ]; then
    echo -e "${YELLOW}📦 Creating new service...${NC}"
    
    # Create service using render.yaml
    render services create --file render.yaml
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Service created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create service${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}🔄 Updating existing service...${NC}"
    
    # Update service using render.yaml
    render services update "$SERVICE_NAME" --file render.yaml
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Service updated successfully${NC}"
    else
        echo -e "${RED}❌ Failed to update service${NC}"
        exit 1
    fi
fi

# Deploy the service
echo -e "${YELLOW}🚀 Deploying service...${NC}"
render services deploy "$SERVICE_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment initiated successfully${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Wait for deployment to complete
echo -e "${YELLOW}⏳ Waiting for deployment to complete...${NC}"
echo "This may take a few minutes..."

# Poll deployment status
DEPLOYMENT_COMPLETE=false
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ "$DEPLOYMENT_COMPLETE" = false ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    sleep 10
    ATTEMPTS=$((ATTEMPTS + 1))
    
    STATUS=$(render services logs "$SERVICE_NAME" --tail 1 2>/dev/null | grep -E "(Build completed|Deploy completed|Failed)" || echo "")
    
    if echo "$STATUS" | grep -q "Build completed\|Deploy completed"; then
        DEPLOYMENT_COMPLETE=true
        echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    elif echo "$STATUS" | grep -q "Failed"; then
        echo -e "${RED}❌ Deployment failed${NC}"
        echo "Check logs with: render services logs $SERVICE_NAME"
        exit 1
    else
        echo -e "${YELLOW}⏳ Still deploying... (attempt $ATTEMPTS/$MAX_ATTEMPTS)${NC}"
    fi
done

if [ "$DEPLOYMENT_COMPLETE" = false ]; then
    echo -e "${YELLOW}⚠️  Deployment timeout. Check status manually:${NC}"
    echo "  render services logs $SERVICE_NAME"
fi

# Get service URL
echo -e "${YELLOW}🔗 Getting service URL...${NC}"
SERVICE_URL=$(render services list --name "$SERVICE_NAME" --format json | jq -r '.[0].service.url' 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ] && [ "$SERVICE_URL" != "null" ]; then
    echo -e "${GREEN}✅ Service deployed successfully!${NC}"
    echo -e "${BLUE}🌐 Service URL: $SERVICE_URL${NC}"
    echo -e "${BLUE}📊 Health Check: $SERVICE_URL/health${NC}"
else
    echo -e "${YELLOW}⚠️  Could not retrieve service URL. Check Render dashboard.${NC}"
fi

# Show useful commands
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "  View logs:     render services logs $SERVICE_NAME"
echo "  View status:   render services list --name $SERVICE_NAME"
echo "  Open service:  render services open $SERVICE_NAME"
echo "  Delete service: render services delete $SERVICE_NAME"

echo ""
echo -e "${GREEN}🎉 Deployment script completed!${NC}" 