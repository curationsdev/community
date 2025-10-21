#!/bin/bash
# Setup script for Cloudflare deployment
# This script helps create KV namespaces and configure the Worker

set -e

echo "🚀 CURATIONS Community - Cloudflare Setup"
echo "==========================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

echo "📦 Creating KV Namespaces..."
echo ""

# Production namespaces
echo "Creating production CURATIONS_VOTES namespace..."
VOTES_PROD=$(npx wrangler kv:namespace create CURATIONS_VOTES --json | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ Created: $VOTES_PROD"

echo "Creating production CURATIONS_IDEAS namespace..."
IDEAS_PROD=$(npx wrangler kv:namespace create CURATIONS_IDEAS --json | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ Created: $IDEAS_PROD"

# Development namespaces
echo "Creating development CURATIONS_VOTES namespace..."
VOTES_DEV=$(npx wrangler kv:namespace create CURATIONS_VOTES --env dev --json | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ Created: $VOTES_DEV"

echo "Creating development CURATIONS_IDEAS namespace..."
IDEAS_DEV=$(npx wrangler kv:namespace create CURATIONS_IDEAS --env dev --json | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ Created: $IDEAS_DEV"

echo ""
echo "📝 Update your wrangler.toml with these IDs:"
echo ""
echo "Production:"
echo "  CURATIONS_VOTES id = \"$VOTES_PROD\""
echo "  CURATIONS_IDEAS id = \"$IDEAS_PROD\""
echo ""
echo "Development:"
echo "  CURATIONS_VOTES id = \"$VOTES_DEV\""
echo "  CURATIONS_IDEAS id = \"$IDEAS_DEV\""
echo ""
echo "✨ Setup complete! Next steps:"
echo "  1. Update wrangler.toml with the namespace IDs above"
echo "  2. Run 'npx wrangler deploy' to deploy the Worker"
echo "  3. Configure Cloudflare Pages via the dashboard"
