#!/usr/bin/env bash
# Build frontend and sync to S3 (for CloudFront). Optionally invalidate CloudFront cache.
# Usage:
#   VITE_API_BASE_URL=https://xxx.execute-api.us-east-1.amazonaws.com S3_BUCKET=piritiya-app-xxx ./scripts/deploy-frontend-s3.sh
# Optional: CLOUDFRONT_DIST_ID=xxx to invalidate cache after upload.
# Requires: AWS CLI, npm.

set -e
cd "$(dirname "$0")/.."

if [ -z "${VITE_API_BASE_URL}" ]; then
  echo "Error: VITE_API_BASE_URL must be set (your API Gateway or backend URL)."
  exit 1
fi

if [ -z "${S3_BUCKET}" ]; then
  echo "Error: S3_BUCKET must be set (e.g. piritiya-app-xxx)."
  exit 1
fi

AWS_REGION="${AWS_REGION:-us-east-1}"

echo "Building frontend with VITE_API_BASE_URL=$VITE_API_BASE_URL"
cd frontend
npm run build
cd ..

echo "Syncing frontend/dist/ to s3://${S3_BUCKET}/ ..."
aws s3 sync frontend/dist/ "s3://${S3_BUCKET}/" --delete --region "${AWS_REGION}"

if [ -n "${CLOUDFRONT_DIST_ID}" ]; then
  echo "Invalidating CloudFront distribution ${CLOUDFRONT_DIST_ID}..."
  aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DIST_ID}" --paths "/*" --output text > /dev/null
  echo "Invalidation created."
fi

echo "Done. Frontend is at s3://${S3_BUCKET}/. Serve via CloudFront or enable static website hosting."
