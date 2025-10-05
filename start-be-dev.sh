#!/bin/bash

# Start Medusa Backend (Development Mode - No Docker Required)
echo "🚀 Starting Medusa Backend (Development Mode)..."
echo "📁 Working directory: $(pwd)"
echo "🔧 Backend will run on: http://localhost:9000"
echo "⚙️  Admin panel: http://localhost:9000/app"
echo "🔍 Search is DISABLED for development"
echo ""

cd medusa-backend/purelinen
npm run dev
