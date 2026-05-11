#!/bin/bash
# LeanForge Deployment Script
# Run this after: railway login

echo "🚀 Deploying LeanForge Keyword Trend Index..."

# 1. Backend API
echo "📦 Deploying backend API..."
cd keyword-trend-api
railway link --name leanforge-api
railway up --detach

# 2. Get backend URL
BACKEND_URL=$(railway domain)
echo "✅ Backend deployed at: $BACKEND_URL"

# 3. Frontend
echo "🎨 Deploying frontend..."
cd ../leanforge-frontend
# Update API URL
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL/api/v1|" .env.production
railway link --name leanforge-frontend
railway up --detach

# 4. Get frontend URL
FRONTEND_URL=$(railway domain)
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo ""
echo "🎉 Deployment complete!"
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Add custom domain: lean-forge.net"
echo "2. Configure DNS records"
echo "3. Set up SSL certificates"
