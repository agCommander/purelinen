#!/bin/bash

# Start Linen Things Frontend
# Uses the same codebase as purelinen with SITE_BRAND=linenthings env var
echo "🌐 Starting Linen Things Frontend..."
echo "📁 Working directory: $(pwd)"
echo "🛍️  Frontend will run on: http://localhost:8000"
echo "🏷️  Site Brand: linenthings (via NEXT_PUBLIC_SITE_BRAND)"
echo ""

cd medusa-storefront/purelinen

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  yarn install
  echo ""
fi

# Set environment variable and start dev server
NEXT_PUBLIC_SITE_BRAND=linenthings yarn dev --port 8000
