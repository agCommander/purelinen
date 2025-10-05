#!/bin/bash

# MeiliSearch Setup Script
echo "🔍 Setting up MeiliSearch for Pure Linen..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo ""
    echo "📋 Alternative setup options:"
    echo "1. Start Docker Desktop and run: docker-compose -f docker-compose.meilisearch.yml up -d"
    echo "2. Install MeiliSearch locally:"
    echo "   curl -L https://install.meilisearch.com | sh"
    echo "   ./meilisearch --master-key ms"
    echo ""
    echo "3. Use MeiliSearch Cloud (recommended for production):"
    echo "   - Sign up at https://www.meilisearch.com/cloud"
    echo "   - Get your API key and host URL"
    echo "   - Update .env with your cloud credentials"
    exit 1
fi

echo "🐳 Starting MeiliSearch with Docker..."
docker-compose -f docker-compose.meilisearch.yml up -d

echo "⏳ Waiting for MeiliSearch to be ready..."
sleep 5

echo "🔑 Updating API key automatically..."
./update-meilisearch-key.sh

echo "✅ MeiliSearch is running!"
echo "🌐 Dashboard: http://localhost:7700"
echo "🔑 Master Key: ms"
echo "🔑 Admin API Key: Updated automatically in .env"
echo ""
echo "🚀 Now restart your Medusa backend to enable search functionality!"
