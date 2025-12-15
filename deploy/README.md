# Frontend Deployment Guide

This guide covers deploying the Fixads Dashboard (Next.js) to Google Cloud Run.

## Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │     dev.appfixads.xyz                   │
                    │     (Google Cloud Load Balancer)        │
                    └────────────────┬────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
    ┌───────────┐            ┌───────────────┐          ┌───────────────┐
    │ Frontend  │            │ /auth/*       │          │ /google-ads/* │
    │ (Next.js) │            │ Auth Service  │          │ Google Ads    │
    │    /      │            │               │          │ Service       │
    └───────────┘            └───────────────┘          └───────────────┘
```

The load balancer routes:
- `/` (root) and all other paths → Frontend (Next.js)
- `/auth/*` → Auth Service
- `/google-ads/*` → Google Ads Service
- `/campaign/*` → Campaign Service
- `/asset/*` → Asset Service
- `/analytics/*` → Analytics Service
- `/optimization/*` → Optimization Service
- `/dashboard/*` → Dashboard API

## Prerequisites

1. **Google Cloud CLI** installed and authenticated
2. **Docker** installed and running
3. **Terraform** (for infrastructure changes)
4. Access to the GCP project `optical-net-479021-u8`

## Quick Start

### Deploy

```bash
# From the fixads-dashboard directory
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

> **Note:** No Google Client ID needed in the frontend! OAuth is handled server-side by the auth-service.

## Deployment Options

### Manual Deployment

```bash
# Deploy with default settings
./deploy/deploy.sh

# Deploy with specific tag
./deploy/deploy.sh --tag v1.0.0

# Skip build and deploy existing image
./deploy/deploy.sh --skip-build
```

### CI/CD Deployment (GitHub Actions)

Deployments are automatic on:
- Push to `main` branch
- Version tags (`v*.*.*`)

No GitHub secrets required! Authentication is handled by Workload Identity Federation.

## Infrastructure Setup (First Time Only)

If the frontend infrastructure doesn't exist yet:

```bash
cd /path/to/fixads-infrastructure/terraform

# Apply Terraform changes (enable_frontend=true by default)
terraform plan -out=tfplan
terraform apply tfplan
```

## Environment Variables

### Build-time Variables (baked into the bundle)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://dev.appfixads.xyz` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `https://dev.appfixads.xyz` |
| `NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER` | Enable Smart Optimizer | `true` |

> **Note:** Google OAuth credentials are NOT needed in the frontend. Authentication is handled server-side by the auth-service (`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured there).

### Runtime Variables (set in Cloud Run)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `8080` |
| `HOSTNAME` | Server hostname | `0.0.0.0` |

## Troubleshooting

### Check Deployment Status

```bash
# View Cloud Run service
gcloud run services describe fixads-frontend --region europe-west3

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=fixads-frontend" --limit=50

# View load balancer health
gcloud compute backend-services get-health fixads-frontend-backend --global
```

### Common Issues

#### 1. "Permission denied" when deploying

Ensure you have the required IAM roles:
- `roles/run.admin`
- `roles/artifactregistry.writer`

```bash
gcloud auth application-default login
```

#### 2. "Image not found" error

The image might not be pushed yet. Run with build:
```bash
./deploy/deploy.sh
```

#### 3. "503 Service Unavailable" after deployment

Check if the service is healthy:
```bash
gcloud run services describe fixads-frontend --region europe-west3 --format="value(status.conditions)"
```

#### 4. Frontend loads but API calls fail

Check the browser console for CORS errors. The API should be on the same domain.

## Rolling Back

```bash
# List revisions
gcloud run revisions list --service fixads-frontend --region europe-west3

# Roll back to a specific revision
gcloud run services update-traffic fixads-frontend \
  --region europe-west3 \
  --to-revisions=REVISION_NAME=100
```

## Monitoring

- **Cloud Run Console**: https://console.cloud.google.com/run/detail/europe-west3/fixads-frontend
- **Cloud Logging**: https://console.cloud.google.com/logs/query?project=optical-net-479021-u8
- **Load Balancer**: https://console.cloud.google.com/net-services/loadbalancing
