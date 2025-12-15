#!/bin/bash
# =============================================================================
# Frontend Deployment Script
# =============================================================================
# Builds and deploys the Next.js frontend to Google Cloud Run
#
# Usage:
#   ./deploy/deploy.sh                    # Deploy with default settings
#   ./deploy/deploy.sh --tag v1.0.0       # Deploy with specific tag
#   ./deploy/deploy.sh --skip-build       # Skip build and deploy existing image
#
# Prerequisites:
#   - gcloud CLI authenticated with appropriate permissions
#   - Docker installed and running
#   - Environment variables set (or use defaults)
# =============================================================================

set -euo pipefail

# Configuration
PROJECT_ID="${PROJECT_ID:-optical-net-479021-u8}"
REGION="${REGION:-europe-west3}"
SERVICE_NAME="${SERVICE_NAME:-fixads-frontend}"
ARTIFACT_REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/fixads-images"

# Build-time environment variables
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://dev.appfixads.xyz}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://dev.appfixads.xyz}"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID:-}"
NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER="${NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
TAG=""
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --tag)
            TAG="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Generate version tag if not provided
if [ -z "$TAG" ]; then
    TAG=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Fixads Frontend Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Configuration:"
echo "  Project ID:     $PROJECT_ID"
echo "  Region:         $REGION"
echo "  Service:        $SERVICE_NAME"
echo "  Version:        $TAG"
echo "  API URL:        $NEXT_PUBLIC_API_URL"
echo "  App URL:        $NEXT_PUBLIC_APP_URL"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if GOOGLE_CLIENT_ID is set
if [ -z "$NEXT_PUBLIC_GOOGLE_CLIENT_ID" ]; then
    echo -e "${YELLOW}Warning: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set${NC}"
    echo "OAuth login will not work without this."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Configure Docker for Artifact Registry
echo -e "${YELLOW}Configuring Docker for Artifact Registry...${NC}"
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Build Docker image
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker build \
        --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
        --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
        --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID="$NEXT_PUBLIC_GOOGLE_CLIENT_ID" \
        --build-arg NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER="$NEXT_PUBLIC_ENABLE_SMART_OPTIMIZER" \
        -t "${ARTIFACT_REGISTRY}/${SERVICE_NAME}:${TAG}" \
        -t "${ARTIFACT_REGISTRY}/${SERVICE_NAME}:latest" \
        .

    # Push Docker image
    echo -e "${YELLOW}Pushing Docker image to Artifact Registry...${NC}"
    docker push "${ARTIFACT_REGISTRY}/${SERVICE_NAME}:${TAG}"
    docker push "${ARTIFACT_REGISTRY}/${SERVICE_NAME}:latest"
else
    echo -e "${YELLOW}Skipping build, using existing image...${NC}"
fi

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy "$SERVICE_NAME" \
    --image "${ARTIFACT_REGISTRY}/${SERVICE_NAME}:${TAG}" \
    --region "$REGION" \
    --platform managed \
    --ingress internal-and-cloud-load-balancing \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --concurrency 80 \
    --timeout 60 \
    --cpu-boost \
    --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,PORT=8080" \
    --quiet

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Service URL: https://dev.appfixads.xyz"
echo "Cloud Run Console: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}"
echo ""
