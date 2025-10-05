#!/bin/bash

# Start Medusa Backend
echo "🚀 Starting Medusa Backend..."
echo "📁 Working directory: $(pwd)"
echo "🔧 Backend will run on: http://localhost:9000"
echo "⚙️  Admin panel: http://localhost:9000/app"
echo ""

# Check if MeiliSearch is running
if ! curl -s http://localhost:7700/health > /dev/null 2>&1; then
    echo "⚠️  MeiliSearch is not running. Starting it automatically..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop first."
        echo "💡 After starting Docker, run: ./start-backend.sh"
        exit 1
    fi
    
    echo "🐳 Starting MeiliSearch..."
    
    cd medusa-backend/purelinen
    docker-compose -f docker-compose.meilisearch.yml up -d
    
    echo "⏳ Waiting for MeiliSearch to be ready..."
    sleep 5
    
    echo "🔑 Updating API key automatically..."
    ./update-meilisearch-key.sh
    
    echo "✅ MeiliSearch is now running!"
    echo ""
else
    echo "✅ MeiliSearch is already running!"
    echo ""
fi

cd medusa-backend/purelinen
npm run dev
