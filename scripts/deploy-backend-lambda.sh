#!/usr/bin/env bash
# Build and push Piritiya API Lambda container image to ECR.
# Usage:
#   ECR_URI=123456789012.dkr.ecr.us-east-1.amazonaws.com/piritiya-api ./scripts/deploy-backend-lambda.sh
# Optional: CREATE_ECR=1 to create the repository if it does not exist.
# Requires: Docker, AWS CLI, credentials with ECR push permission.

set -e
cd "$(dirname "$0")/.."

AWS_REGION="${AWS_REGION:-us-east-1}"

if [ -z "${ECR_URI}" ]; then
  echo "Error: ECR_URI must be set (e.g. 123456789012.dkr.ecr.us-east-1.amazonaws.com/piritiya-api)."
  exit 1
fi

REPO_NAME="${ECR_URI#*/}"
REGISTRY="${ECR_URI%%/*}"

if [ "${CREATE_ECR}" = "1" ]; then
  if ! aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" 2>/dev/null; then
    echo "Creating ECR repository: ${REPO_NAME}"
    aws ecr create-repository --repository-name "${REPO_NAME}" --region "${AWS_REGION}" --output text > /dev/null
    echo "Created."
  fi
fi

echo "Building Lambda image from backend/Dockerfile.lambda..."
echo "Building for linux/amd64 platform (required by Lambda)..."
# --provenance=false avoids manifest/layer types Lambda does not support (InvalidParameterValueException)
docker build --platform linux/amd64 --provenance=false -f backend/Dockerfile.lambda -t piritiya-api-lambda backend
docker tag piritiya-api-lambda:latest "${ECR_URI}:latest"

echo "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY}"

echo "Pushing ${ECR_URI}:latest..."
docker push "${ECR_URI}:latest"

echo "Done. Use this image URI when creating or updating the Lambda function: ${ECR_URI}:latest"
