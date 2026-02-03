#!/bin/bash

# Deployment script for Medusa backend
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Error: Node.js 20+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing...${NC}"
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Restart with PM2
echo -e "${YELLOW}🔄 Restarting application with PM2...${NC}"
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs purelinen-backend    - View logs"
echo "  pm2 status                    - View status"
echo "  pm2 restart purelinen-backend - Restart app"
echo "  pm2 monit                     - Monitor resources"
