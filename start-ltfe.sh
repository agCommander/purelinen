#!/bin/bash

# Start Linen Things Frontend
echo "🌐 Starting Linen Things Frontend..."
echo "📁 Working directory: $(pwd)"
echo "🛍️  Frontend will run on: http://localhost:8000"
echo "🇦🇺 Australian store: http://localhost:8000/au"
echo ""

cd medusa-storefront/linenthings

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  yarn install
  echo ""
fi

yarn dev
