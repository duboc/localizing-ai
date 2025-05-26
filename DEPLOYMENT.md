# Cloud Run Deployment Guide

This guide will help you deploy your Localizing AI application to Google Cloud Run using the simplest approach with `gcloud run deploy`.

## Prerequisites

1. **Google Cloud SDK installed**
   ```bash
   # Install gcloud CLI if not already installed
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Authentication**
   ```bash
   # Login to Google Cloud
   gcloud auth login
   
   # Set up application default credentials for local development/testing
   gcloud auth application-default login
   ```

3. **Enable Required APIs**
   ```bash
   # Enable Cloud Run API
   gcloud services enable run.googleapis.com
   
   # Enable Cloud Build API (needed for source deployments)
   gcloud services enable cloudbuild.googleapis.com
   
   # Enable Vertex AI API (for the AI service)
   gcloud services enable aiplatform.googleapis.com
   ```

## Quick Deployment

### Option 1: Automated Script (Recommended)

1. **Run the deployment script**
   ```bash
   ./deploy-to-cloudrun.sh
   ```

   This script will:
   - Deploy the scraper service first
   - Deploy the API service with the correct environment variables
   - Deploy the frontend with the production API URLs
   - Display all service URLs when complete

### Option 2: Manual Deployment

If you prefer to deploy manually or need to troubleshoot:

1. **Deploy Scraper Service**
   ```bash
   cd src/scraper
   gcloud run deploy scraper-service \
     --source=. \
     --platform=managed \
     --region=us-central1 \
     --allow-unauthenticated \
     --port=8001
   ```

2. **Deploy API Service**
   ```bash
   cd ../api
   gcloud run deploy api-service \
     --source=. \
     --platform=managed \
     --region=us-central1 \
     --allow-unauthenticated \
     --port=8000 \
     --set-env-vars="GCP_PROJECT=conventodapenha"
   ```

3. **Deploy Frontend Service**
   ```bash
   cd ../frontend
   
   # Get the URLs from the previous deployments
   SCRAPER_URL=$(gcloud run services describe scraper-service --region=us-central1 --format="value(status.url)")
   API_URL=$(gcloud run services describe api-service --region=us-central1 --format="value(status.url)")
   
   gcloud run deploy frontend-service \
     --source=. \
     --platform=managed \
     --region=us-central1 \
     --allow-unauthenticated \
     --port=3000 \
     --set-env-vars="NEXT_PUBLIC_VERTEX_API_URL=$API_URL,NEXT_PUBLIC_SCRAPER_API_URL=$SCRAPER_URL,NEXT_PUBLIC_APP_NAME=App Localization Audit Tool"
   ```

## Configuration

The deployment uses these settings:

- **Project ID**: `conventodapenha`
- **Region**: `us-central1`
- **Memory**: 1-2GB per service
- **CPU**: 1 vCPU per service
- **Scaling**: 0-10 instances (auto-scaling)
- **Timeout**: 5 minutes
- **Authentication**: Public (allow-unauthenticated)

## Service Architecture

```
Frontend Service (Next.js)
    ↓ (calls)
API Service (FastAPI + Vertex AI)
    ↓ (calls)  
Scraper Service (FastAPI + Playwright)
```

## Monitoring and Logs

### View Logs
```bash
# Frontend logs
gcloud run logs tail frontend-service --region=us-central1

# API logs
gcloud run logs tail api-service --region=us-central1

# Scraper logs
gcloud run logs tail scraper-service --region=us-central1
```

### List Services
```bash
gcloud run services list --region=us-central1
```

### Service Details
```bash
gcloud run services describe frontend-service --region=us-central1
```

## Updating Services

To update a service after making code changes:

```bash
# For any service, just re-run the deploy command
gcloud run deploy <service-name> --source=. --region=us-central1
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all Dockerfiles are properly configured
   - Ensure dependencies are correctly specified in requirements.txt/package.json

2. **Service Won't Start**
   - Check logs with `gcloud run logs tail <service-name>`
   - Verify environment variables are set correctly
   - Ensure ports match the Dockerfile EXPOSE statements

3. **Authentication Errors**
   - Make sure you're logged in: `gcloud auth list`
   - Verify project is set: `gcloud config get-value project`

4. **API Not Found Errors**
   - Verify services are deployed and running
   - Check environment variables in frontend service
   - Test API endpoints directly

### Testing Individual Services

```bash
# Test scraper service
curl https://scraper-service-[hash]-uc.a.run.app/health

# Test API service  
curl https://api-service-[hash]-uc.a.run.app/health

# Frontend should be accessible via browser
```

## Cost Optimization

Cloud Run pricing is based on:
- **CPU and Memory**: Only charged when handling requests
- **Requests**: $0.40 per million requests
- **CPU-seconds**: ~$0.000024 per vCPU-second
- **Memory**: ~$0.0000025 per GB-second

With the current configuration and auto-scaling to 0, you'll only pay for actual usage.

## Security Notes

- All services are currently set to `--allow-unauthenticated` for simplicity
- For production, consider implementing authentication
- Environment variables are securely managed by Cloud Run
- HTTPS is automatically provided

## Next Steps

After successful deployment:

1. Test the application thoroughly
2. Set up monitoring and alerting
3. Configure custom domains if needed
4. Implement CI/CD for automated deployments
5. Consider implementing authentication for production use
