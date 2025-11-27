#!/bin/bash

# Deployment script for Game Shop application
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: ./deploy.sh [staging|production]"
    exit 1
fi

# Configuration
IMAGE_NAME="ghcr.io/your-username/cse590-04-final-project:latest"

if [ "$ENVIRONMENT" == "staging" ]; then
    SERVER=${STAGING_SERVER:-"staging.example.com"}
    USER=${STAGING_USER:-"deploy"}
    CONTAINER_NAME="game-shop-staging"
    PORT="3001"
    ENV_FILE="/opt/app/.env.staging"
elif [ "$ENVIRONMENT" == "production" ]; then
    SERVER=${PRODUCTION_SERVER:-"production.example.com"}
    USER=${PRODUCTION_USER:-"deploy"}
    CONTAINER_NAME="game-shop-prod"
    PORT="3000"
    ENV_FILE="/opt/app/.env.production"
else
    echo "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

echo "🚀 Deploying to $ENVIRONMENT..."
echo "Server: $SERVER"
echo "Container: $CONTAINER_NAME"

# Pull latest image
echo "📦 Pulling latest Docker image..."
ssh $USER@$SERVER "docker pull $IMAGE_NAME"

# Stop and remove old container
echo "🛑 Stopping old container..."
ssh $USER@$SERVER "docker stop $CONTAINER_NAME || true"
ssh $USER@$SERVER "docker rm $CONTAINER_NAME || true"

# Start new container
echo "▶️  Starting new container..."
ssh $USER@$SERVER "docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3000 \
    --env-file $ENV_FILE \
    --restart unless-stopped \
    $IMAGE_NAME"

# Check if container is running
echo "✅ Checking container status..."
ssh $USER@$SERVER "docker ps | grep $CONTAINER_NAME"

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
