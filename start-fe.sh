#!/bin/bash

# Start Pure Linen Frontend
# Uses SITE_BRAND=purelinen (default) via NEXT_PUBLIC_SITE_BRAND env var
echo "🌐 Starting Pure Linen Frontend..."
echo "📁 Working directory: $(pwd)"
echo "🛍️  Frontend will run on: http://localhost:8001"
echo "🏷️  Site Brand: purelinen (via NEXT_PUBLIC_SITE_BRAND)"
echo ""

cd medusa-storefront/purelinen

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  yarn install
  echo ""
fi

# Set environment variable and start dev server (purelinen is default, but explicit for clarity)
NEXT_PUBLIC_SITE_BRAND=purelinen yarn dev --port 8001
