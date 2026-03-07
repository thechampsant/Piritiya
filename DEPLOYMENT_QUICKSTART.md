# Piritiya - Deployment Quick Start

**Status:** Ready to deploy ✅  
**AWS Account:** 288761728613  
**Region:** us-east-1

---

## Prerequisites ✅

All infrastructure is already set up:
- ✅ DynamoDB tables (4) with sample data
- ✅ Lambda functions (3) deployed
- ✅ S3 buckets (3) created
- ✅ Bedrock Agent configured
- ✅ IAM user with permissions
- ✅ Polly and Transcribe enabled

See [AWS_INFRASTRUCTURE_COMPLETE.md](AWS_INFRASTRUCTURE_COMPLETE.md) for details.

---

## Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Pre-Deployment Tests (Optional but Recommended)            │
│  ./scripts/test-before-deploy.sh                            │
│  ✓ AWS infrastructure  ✓ Code checks  ✓ Builds  ✓ Tests   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Backend Deployment                                 │
│  ✓ Build Lambda container → Push to ECR                     │
│  ✓ Create/update Lambda function                            │
│  ✓ Set up API Gateway HTTP API                              │
│  ✓ Verify health endpoint                                   │
│  → API Endpoint: https://xxx.execute-api.us-east-1.amazonaws.com │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Frontend Deployment                                │
│  ✓ Create S3 bucket                                         │
│  ✓ Build frontend with API URL                              │
│  ✓ Upload to S3                                             │
│  ✓ Create CloudFront distribution (manual)                  │
│  ✓ Update CORS to CloudFront domain                         │
│  → Frontend URL: https://xxx.cloudfront.net                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Verification & Testing                                      │
│  ✓ Backend health check  ✓ Frontend loads                  │
│  ✓ Voice I/O  ✓ Chat  ✓ Offline mode                       │
└─────────────────────────────────────────────────────────────┘
```

---

## One-Command Deployment

### Step 1: Pre-Deployment Tests (Recommended)

```bash
# Run quick test (infrastructure and code checks only)
./scripts/test-before-deploy.sh quick

# Or full test suite (includes builds and tests)
./scripts/test-before-deploy.sh
```

This verifies:
- ✅ AWS infrastructure is ready (DynamoDB, Lambda, S3)
- ✅ Code files are present and configured
- ✅ Frontend dependencies installed
- ✅ Backend Docker build works (requires Docker running)
- ✅ Frontend build works
- ✅ Tests pass

**Note:** If Docker is not running, the script will warn but you can still deploy (Docker will be needed for actual deployment).

### Step 2: Deploy to Production

```bash
./scripts/deploy-production.sh
```

This automated script will:
1. Build and push backend Lambda container to ECR
2. Create/update Lambda function with all environment variables
3. Set up API Gateway HTTP API with routes
4. Build frontend with production API URL
5. Upload frontend to S3
6. Guide CloudFront distribution setup
7. Update CORS configuration
8. Verify deployment

**Time:** ~10-15 minutes (mostly CloudFront creation)

---

## Manual Steps Required

The script will prompt you for these manual steps:

### 1. IAM Role (if not exists)
Create `PiritiyaApiLambdaRole` in AWS Console with:
- Trust policy: `lambda.amazonaws.com`
- Managed policies: `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`, `AmazonS3FullAccess`, `AmazonBedrockFullAccess`, `AWSLambda_FullAccess`
- Inline policy for Polly and Transcribe (see DEPLOY.md)

### 2. CloudFront Distribution
Create in AWS Console → CloudFront:
- Origin: S3 bucket `piritiya-app-288761728613`
- Origin access: OAC (Origin Access Control)
- Default root: `index.html`
- Error responses: 403/404 → 200 with `/index.html`
- Comment: "Piritiya PWA Distribution"

### 3. S3 Bucket Policy
Copy the bucket policy from CloudFront console and add to S3 bucket permissions.

---

## Individual Component Deployment

### Backend Only
```bash
./scripts/deploy-production.sh backend
```

### Frontend Only
```bash
# Set API endpoint first
export VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
./scripts/deploy-production.sh frontend
```

### Using Individual Scripts
```bash
# Backend Lambda
export ECR_URI=288761728613.dkr.ecr.us-east-1.amazonaws.com/piritiya-api
export CREATE_ECR=1
./scripts/deploy-backend-lambda.sh

# Frontend S3
export VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
export S3_BUCKET=piritiya-app-288761728613
export CLOUDFRONT_DIST_ID=E123ABC456DEF  # Optional
./scripts/deploy-frontend-s3.sh
```

---

## After Deployment

### 1. Get Your URLs

Backend API:
```
https://<api-id>.execute-api.us-east-1.amazonaws.com
```

Frontend App:
```
https://<cloudfront-id>.cloudfront.net
```

### 2. Test the Application

Open the CloudFront URL and test:
- ✅ Onboarding with Farmer ID (F001, F002, or F003)
- ✅ Language switching (Hindi ↔ English)
- ✅ Voice input (microphone button)
- ✅ Voice output (AWS Polly)
- ✅ Quick actions (Weather, Soil, Crops, Market)
- ✅ Chat with Bedrock Agent
- ✅ Offline mode (disconnect → send message → reconnect)

### 3. Verify Backend

```bash
# Health check
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/health

# Test farmers endpoint
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/farmers

# Test Polly
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/speech/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"नमस्ते किसान भाई","language":"hi"}' \
  --output test.mp3
```

---

## Troubleshooting

### Script fails at ECR push
```bash
# Login manually
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  288761728613.dkr.ecr.us-east-1.amazonaws.com
```

### Lambda function not responding
```bash
# Check logs
aws logs tail /aws/lambda/piritiya-api --follow --region us-east-1
```

### Frontend shows CORS error
```bash
# Update Lambda CORS
aws lambda update-function-configuration \
  --function-name piritiya-api \
  --environment Variables="{...,CORS_ORIGINS=https://your-cloudfront-domain.cloudfront.net}" \
  --region us-east-1
```

### CloudFront shows 403 error
- Verify S3 bucket policy allows CloudFront OAC access
- Check custom error responses are configured (403/404 → 200 with /index.html)

---

## Cost Estimate

Monthly cost for 1,000 farmers:
- Lambda + API Gateway: ~$8
- S3 + CloudFront: ~$2
- **Total new costs: ~$10/month**

Existing infrastructure (DynamoDB, Bedrock, Polly): ~$26.50/month

**Grand total: ~$36.50/month**

---

## Next Steps After Deployment

1. **Custom Domain** (optional)
   - Request SSL certificate in ACM
   - Add CNAME to CloudFront distribution
   - Update DNS records

2. **Monitoring**
   - Set up CloudWatch alarms for Lambda errors
   - Create CloudWatch dashboard
   - Enable AWS X-Ray tracing

3. **Backups**
   - Enable DynamoDB point-in-time recovery
   - Enable S3 versioning
   - Set up automated snapshots

4. **Security Hardening**
   - Review IAM policies for least privilege
   - Enable WAF rules for API protection
   - Move secrets to AWS Secrets Manager

---

## Quick Reference

**Deployment Script:** `./scripts/deploy-production.sh`  
**Full Guide:** [DEPLOY.md](DEPLOY.md)  
**AWS Status:** [AWS_INFRASTRUCTURE_COMPLETE.md](AWS_INFRASTRUCTURE_COMPLETE.md)  
**Scripts Documentation:** [scripts/README.md](scripts/README.md)

**Test Farmer IDs:**
- F001 - राम कुमार (Ram Kumar) - Lucknow
- F002 - सीता देवी (Sita Devi) - Kanpur
- F003 - मोहन सिंह (Mohan Singh) - Varanasi

---

**Ready to deploy?** Run `./scripts/deploy-production.sh` and follow the prompts!
