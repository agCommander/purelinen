#!/bin/bash

# Start Pure Linen Frontend
echo "🌐 Starting Pure Linen Frontend..."
echo "📁 Working directory: $(pwd)"
echo "🛍️  Frontend will run on: http://localhost:8001"
echo "🇦🇺 Australian store: http://localhost:8001/au"
echo ""

cd medusa-storefront/purelinen
yarn dev --port 8001
