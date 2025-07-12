#!/bin/bash

# Deployment script for Devon Garbalosa's blog (dgarbs51.com)
# This script builds the blog and deploys it to Cloudflare Pages

set -e

echo "🚀 Starting deployment process for Devon Garbalosa's blog..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the correct directory?"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building the project..."
npm run build

# Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."
if command -v wrangler &> /dev/null; then
    wrangler pages deploy dist --project-name dgarbs51-blog
else
    echo "❌ Error: Wrangler CLI not found. Please install it:"
    echo "npm install -g wrangler"
    exit 1
fi

echo "✅ Deployment complete!"
echo "🌐 Your blog should be available at: https://dgarbs51.com"
