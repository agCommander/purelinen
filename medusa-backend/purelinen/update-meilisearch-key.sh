#!/bin/bash

# Get MeiliSearch Admin API Key automatically
echo "🔍 Getting MeiliSearch Admin API Key..."

# Wait for MeiliSearch to be ready
sleep 3

# Get the Admin API Key
ADMIN_KEY=$(curl -s -H "Authorization: Bearer ms" http://localhost:7700/keys | jq -r '.results[] | select(.name=="Default Admin API Key") | .key')

if [ "$ADMIN_KEY" != "null" ] && [ ! -z "$ADMIN_KEY" ]; then
    echo "✅ Found Admin API Key: ${ADMIN_KEY:0:20}..."
    
    # Update .env file
    sed -i '' "s/MEILISEARCH_API_KEY=.*/MEILISEARCH_API_KEY=$ADMIN_KEY/" .env
    
    echo "✅ Updated .env file with new API key"
    echo "🚀 You can now restart your Medusa backend"
else
    echo "❌ Could not get Admin API Key. Make sure MeiliSearch is running."
    exit 1
fi
