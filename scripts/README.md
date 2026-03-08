# Deployment Scripts

This directory contains scripts for deploying Piritiya to production.

## Available Scripts

### 1. `deploy-production.sh` - Full Production Deployment ⭐

Automated deployment script that handles both backend (Lambda + API Gateway) and frontend (S3 + CloudFront).

**Usage:**

```bash
# Full deployment (backend + frontend)
./scripts/deploy-production.sh

# Deploy backend only
./scripts/deploy-production.sh backend

# Deploy frontend only
./scripts/deploy-production.sh frontend

# Verify existing deployment
./scripts/deploy-production.sh verify
```

**What it does:**

Phase 1 - Backend:
1. Builds and pushes Lambda container to ECR
2. Checks/creates IAM role for Lambda
3. Creates/updates Lambda function with environment variables
4. Sets up API Gateway HTTP API with routes
5. Verifies backend health endpoint

Phase 2 - Frontend:
6. Creates S3 bucket for frontend
7. Builds and uploads frontend to S3
8. Guides CloudFront distribution setup
9. Updates S3 bucket policy for CloudFront
10. Updates Lambda CORS to CloudFront domain

**Prerequisites:**
- AWS CLI configured with credentials
- Docker installed and running
- Node.js and npm installed
- IAM permissions for Lambda, API Gateway, S3, CloudFront, ECR

### 2. `deploy-backend-lambda.sh` - Backend Lambda Only

Builds backend Docker image and pushes to ECR.

**Usage:**

```bash
# Set environment variables
export ECR_URI=288761728613.dkr.ecr.us-east-1.amazonaws.com/piritiya-api
export CREATE_ECR=1  # Optional: creates ECR repo if it doesn't exist

# Run script
./scripts/deploy-backend-lambda.sh
```

**What it does:**
- Creates ECR repository (if CREATE_ECR=1)
- Builds Docker image from `backend/Dockerfile.lambda`
- Authenticates with ECR
- Pushes image with `:latest` tag

### 3. `deploy-frontend-s3.sh` - Frontend S3 Only

Builds frontend and uploads to S3.

**Usage:**

```bash
# Set environment variables
export VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
export S3_BUCKET=piritiya-app-288761728613
export CLOUDFRONT_DIST_ID=E123ABC456DEF  # Optional: invalidates cache

# Run script
./scripts/deploy-frontend-s3.sh
```

**What it does:**
- Builds frontend with production API URL
- Syncs `frontend/dist/` to S3 bucket
- Invalidates CloudFront cache (if CLOUDFRONT_DIST_ID is set)

### 4. `test-before-deploy.sh` - Pre-Deployment Tests

Runs comprehensive tests before deployment to catch issues early.

**Usage:**

```bash
# Full test suite (includes builds and tests)
./scripts/test-before-deploy.sh

# Quick test (infrastructure and code checks only)
./scripts/test-before-deploy.sh quick
```

**What it tests:**
1. AWS infrastructure (DynamoDB, Lambda, S3)
2. Backend code files and configuration
3. Frontend code files and dependencies
4. Backend Docker build
5. Frontend production build
6. Backend test suite
7. Frontend test suite

**Recommended:** Run this before every production deployment.

## Quick Start

For first-time deployment:

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Run pre-deployment tests (recommended)
./scripts/test-before-deploy.sh

# 3. Run full deployment
./scripts/deploy-production.sh
```

The deployment script will guide you through the process and prompt for manual steps when needed.

## Environment Variables

### Backend Lambda
- `ECR_URI` - ECR repository URI (required)
- `CREATE_ECR` - Set to 1 to auto-create ECR repo (optional)

### Frontend S3
- `VITE_API_BASE_URL` - Backend API endpoint (required)
- `S3_BUCKET` - S3 bucket name (required)
- `CLOUDFRONT_DIST_ID` - CloudFront distribution ID for cache invalidation (optional)

## Troubleshooting

### ECR authentication fails
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 288761728613.dkr.ecr.us-east-1.amazonaws.com
```

### Lambda function not responding
```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/piritiya-api --follow --region us-east-1
```

### Frontend not loading
```bash
# Check S3 bucket contents
aws s3 ls s3://piritiya-app-288761728613/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### CORS errors
Update Lambda environment variable:
```bash
aws lambda update-function-configuration \
  --function-name piritiya-api \
  --environment Variables="{...,CORS_ORIGINS=https://your-cloudfront-domain.cloudfront.net}" \
  --region us-east-1
```

## Manual Steps Required

Some steps require manual intervention in AWS Console:

1. **IAM Role Creation** - Create `PiritiyaApiLambdaRole` with required policies (script will prompt)
2. **CloudFront Distribution** - Create distribution with OAC (script will guide you)
3. **S3 Bucket Policy** - Copy policy from CloudFront and add to S3 bucket (script will prompt)

See [DEPLOY.md](../DEPLOY.md) for detailed manual instructions.

## AWS Resources

All resources are deployed in **us-east-1** region:
- Account ID: 288761728613
- IAM User: piritiya-developer
- See [AWS_INFRASTRUCTURE_COMPLETE.md](../AWS_INFRASTRUCTURE_COMPLETE.md) for complete resource list

## Cost Estimate

Estimated monthly cost for 1,000 farmers:
- Lambda: ~$5
- API Gateway: ~$3
- S3: ~$1
- CloudFront: ~$1
- Total: ~$10/month (excluding Bedrock, Polly, DynamoDB which are already running)

See [AWS_INFRASTRUCTURE_COMPLETE.md](../AWS_INFRASTRUCTURE_COMPLETE.md) for complete cost breakdown.
