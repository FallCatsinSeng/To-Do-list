#!/bin/bash

# ============================================
# Production Deployment Script
# ============================================
# Script ini untuk deploy ke VPS production

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."

# 1. Pull latest code
echo "📥 Pulling latest code from repository..."
git pull origin main

# 2. Copy environment file
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env from .env.example and configure production values"
    exit 1
fi

# 3. Build and start containers
echo "🐳 Building Docker containers..."
docker-compose down
docker-compose build --no-cache backend frontend
docker-compose up -d

# 4. Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# 5. Check container status
echo "✅ Checking container status..."
docker-compose ps

# 6. Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=50

echo ""
echo "✅ Deployment completed!"
echo "🌐 Application should be available at: https://bulan2.yusufsoftware.my.id"
echo ""
echo "Commands for monitoring:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart backend frontend"
echo "  - Stop: docker-compose down"
