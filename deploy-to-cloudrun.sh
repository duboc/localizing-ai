#!/bin/bash

# Cloud Run Deployment Script for Localizing AI
# Usage: ./deploy-to-cloudrun.sh
# Make sure you're authenticated with gcloud and have set your project

set -e  # Exit on any error

# Configuration
PROJECT_ID="conventodapenha"
REGION="us-central1"

# Service names
SCRAPER_SERVICE="scraper-service"
API_SERVICE="api-service"
FRONTEND_SERVICE="frontend-service"

echo "🚀 Starting deployment to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Set the project
echo "📝 Setting GCP project..."
gcloud config set project $PROJECT_ID

# Step 1: Deploy Scraper Service
echo "🔧 Step 1/3: Deploying Scraper Service..."
cd src/scraper

gcloud run deploy $SCRAPER_SERVICE \
  --source=. \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --port=8001 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=300 \
  --verbosity=info

# Get the scraper service URL
SCRAPER_URL=$(gcloud run services describe $SCRAPER_SERVICE --region=$REGION --format="value(status.url)")
echo "✅ Scraper Service deployed at: $SCRAPER_URL"

cd ../..

# Step 2: Deploy API Service
echo "🔧 Step 2/3: Deploying API Service..."
cd src/api

gcloud run deploy $API_SERVICE \
  --source=. \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --port=8000 \
  --memory=2Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=300 \
  --set-env-vars="GCP_PROJECT=$PROJECT_ID" \
  --verbosity=info

# Get the API service URL
API_URL=$(gcloud run services describe $API_SERVICE --region=$REGION --format="value(status.url)")
echo "✅ API Service deployed at: $API_URL"

cd ../..

# Step 3: Deploy Frontend Service
echo "🔧 Step 3/3: Deploying Frontend Service..."
cd src/frontend

# Build and deploy with production environment variables
gcloud run deploy $FRONTEND_SERVICE \
  --source=. \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated \
  --port=3000 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=300 \
  --set-env-vars="NEXT_PUBLIC_VERTEX_API_URL=$API_URL,NEXT_PUBLIC_SCRAPER_API_URL=$SCRAPER_URL,NEXT_PUBLIC_APP_NAME=App Localization Audit Tool" \
  --verbosity=info

# Get the frontend service URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format="value(status.url)")
echo "✅ Frontend Service deployed at: $FRONTEND_URL"

cd ../..

echo ""
echo "🎉 All services deployed successfully!"
echo ""
echo "📋 Service URLs:"
echo "  Scraper Service:  $SCRAPER_URL"
echo "  API Service:      $API_URL"  
echo "  Frontend Service: $FRONTEND_URL"
echo ""
echo "🌐 You can now access your app at: $FRONTEND_URL"
echo ""
echo "📚 Next steps:"
echo "  1. Test the frontend at $FRONTEND_URL"
echo "  2. Check logs with: gcloud run logs tail $FRONTEND_SERVICE --region=$REGION"
echo "  3. Monitor with: gcloud run services list --region=$REGION"
echo ""
