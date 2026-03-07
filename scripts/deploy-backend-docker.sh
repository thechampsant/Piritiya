#!/usr/bin/env bash
# Build backend Docker image for production.
# Usage: ./scripts/deploy-backend-docker.sh
# To push to ECR: set ECR_URI and run with PUSH=1
#   ECR_URI=123456789.dkr.ecr.us-east-1.amazonaws.com/piritiya-api PUSH=1 ./scripts/deploy-backend-docker.sh

set -e
cd "$(dirname "$0")/.."

echo "Building backend Docker image..."
docker build -t piritiya-api ./backend
echo "Image built: piritiya-api:latest"

if [ "${PUSH}" = "1" ] && [ -n "${ECR_URI}" ]; then
  echo "Logging in to ECR and pushing..."
  aws ecr get-login-password --region "${AWS_REGION:-us-east-1}" | docker login --username AWS --password-stdin "${ECR_URI%%/*}"
  docker tag piritiya-api:latest "${ECR_URI}:latest"
  docker push "${ECR_URI}:latest"
  echo "Pushed ${ECR_URI}:latest"
fi
