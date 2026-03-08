# Piritiya – Deploy Backend & Frontend

Use this guide to deploy the FastAPI backend and React frontend to a hosted environment. Your AWS resources (DynamoDB, Lambda, S3, Bedrock, Polly, Transcribe) are already set up; this is about running the **app** in production.

**🚀 Quick Start:** See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for one-command deployment.

**📋 Deployment Checklist:** See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) to track your progress.

---

## Quick Start (Automated)

For automated deployment, use the production deployment script:

```bash
# Make script executable
chmod +x scripts/deploy-production.sh

# Run full deployment (backend + frontend)
./scripts/deploy-production.sh

# Or deploy individually
./scripts/deploy-production.sh backend   # Backend only
./scripts/deploy-production.sh frontend  # Frontend only
./scripts/deploy-production.sh verify    # Verify existing deployment
```

The script will:
- ✅ Build and push Lambda container to ECR
- ✅ Create/update Lambda function with environment variables
- ✅ Set up API Gateway with routes
- ✅ Build and upload frontend to S3
- ✅ Guide CloudFront distribution setup
- ✅ Update CORS configuration
- ✅ Verify deployment

See [scripts/README.md](scripts/README.md) for detailed script documentation.

---

## Manual Deployment (Step-by-Step)

If you prefer manual control or need to troubleshoot, follow the detailed steps below.

---

## AWS cost-effective (Lambda + S3 + CloudFront)

Best for **AWS-only** and **minimal cost**: backend as Lambda + API Gateway (pay per request), frontend as S3 + CloudFront. Do steps in order.

### Phase 1: Backend – Lambda + API Gateway

1. **Package and push Lambda image**
   - Create ECR repository (once): `aws ecr create-repository --repository-name piritiya-api --region us-east-1`
   - Build and push: `ECR_URI=288761728613.dkr.ecr.us-east-1.amazonaws.com/piritiya-api CREATE_ECR=1 ./scripts/deploy-backend-lambda.sh`
   - Or set `ECR_URI` and run the script (see [scripts/deploy-backend-lambda.sh](scripts/deploy-backend-lambda.sh)).

2. **IAM role for the API Lambda**
   - Create role `PiritiyaApiLambdaRole` with trust policy for `lambda.amazonaws.com`.
   - Attach managed policies: `AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`, `AmazonS3FullAccess`, `AmazonBedrockFullAccess`, `AWSLambda_FullAccess`
   - Add inline policy for Polly and Transcribe (see detailed policy in Option A below)
   - See [AWS_INFRASTRUCTURE_COMPLETE.md](AWS_INFRASTRUCTURE_COMPLETE.md) for complete resource names and ARNs.

3. **Create Lambda function**
   - Name: `piritiya-api`. Runtime: Container image → select the ECR image from step 1. Handler: leave default (image CMD is `lambda_handler.handler`). Timeout: 30 s. Memory: 512 MB.
   - Execution role: `PiritiyaApiLambdaRole` (from step 2)
   - Environment variables (no AWS keys; use the IAM role):
     ```
     AWS_REGION=us-east-1
     BEDROCK_AGENT_ID=FNU9NS7PKO
     BEDROCK_AGENT_ALIAS_ID=59ZL9U0XOY
     AWS_TRANSCRIBE_BUCKET=piritiya-transcribe
     DYNAMODB_TABLE_FARMERS=Farmers
     DYNAMODB_TABLE_NISAR=NISARData
     DYNAMODB_TABLE_CROP_RECOMMENDATIONS=CropRecommendations
     DYNAMODB_TABLE_CONSULTATIONS=Consultations
     LAMBDA_SOIL_MOISTURE=get-soil-moisture
     LAMBDA_CROP_ADVICE=get-crop-advice
     LAMBDA_MARKET_PRICES=get-market-prices
     CORS_ORIGINS=*
     ```
   - Update `CORS_ORIGINS` to your CloudFront URL after Phase 2.

4. **API Gateway HTTP API**
   - In AWS Console → API Gateway → Create API → HTTP API
   - Name: `piritiya-api`
   - Add integration: Lambda → `piritiya-api` (payload format 2.0)
   - Configure routes: `ANY /` and `ANY /{proxy+}` both to that Lambda
   - Deploy to stage: `$default` (or `prod`)
   - Note the invoke URL: `https://<api-id>.execute-api.us-east-1.amazonaws.com`

5. **Verify backend**
   ```bash
   # Test health endpoint
   curl https://<api-id>.execute-api.us-east-1.amazonaws.com/health
   # Should return: {"status":"healthy","service":"piritiya-api","version":"1.0.0"}
   
   # Test Polly synthesis
   curl -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/speech/synthesize \
     -H "Content-Type: application/json" \
     -d '{"text":"hello","language":"en"}' \
     --output test.mp3
   ```

### Phase 2: Frontend – S3 + CloudFront

6. **Create S3 bucket for frontend**
   ```bash
   # Use your account ID to ensure unique name
   export S3_BUCKET=piritiya-app-288761728613
   aws s3 mb s3://${S3_BUCKET} --region us-east-1
   ```
   
   Keep "Block all public access" enabled. CloudFront will access via OAC (Origin Access Control).

7. **Build and upload frontend**
   
   Use the deployment script:
   ```bash
   # Set your API Gateway URL from Phase 1, step 4
   export VITE_API_BASE_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com
   export S3_BUCKET=piritiya-app-288761728613
   
   # Build and sync
   ./scripts/deploy-frontend-s3.sh
   ```
   
   Or manually:
   ```bash
   cd frontend
   VITE_API_BASE_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com npm run build
   aws s3 sync dist/ s3://${S3_BUCKET}/ --delete --region us-east-1
   ```

8. **Create CloudFront distribution**
   
   In AWS Console → CloudFront → Create distribution:
   
   **Origin settings:**
   - Origin domain: Select your S3 bucket (piritiya-app-288761728613)
   - Origin access: Origin access control (OAC) - Create new OAC
   - Name: piritiya-app-oac
   
   **Default cache behavior:**
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: CachingOptimized
   
   **Settings:**
   - Default root object: `index.html`
   - Custom error responses (for SPA routing):
     - HTTP 403 → Return 200, Response page path: `/index.html`
     - HTTP 404 → Return 200, Response page path: `/index.html`
   
   Click "Create distribution" and note the CloudFront domain (e.g., `d123abc.cloudfront.net`)
   
   **Important:** After creating the distribution, copy the S3 bucket policy that CloudFront provides and add it to your S3 bucket permissions.

9. **Update CORS and test**
   
   Update Lambda environment variable:
   ```bash
   CORS_ORIGINS=https://d123abc.cloudfront.net
   ```
   
   Open `https://d123abc.cloudfront.net` in browser and test:
   - Onboarding flow
   - Voice input/output
   - Quick actions
   - Chat with Bedrock Agent

10. **Optional: Invalidate CloudFront cache on updates**
    
    For future deployments, add CloudFront distribution ID:
    ```bash
    export CLOUDFRONT_DIST_ID=E123ABC456DEF
    export VITE_API_BASE_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com
    export S3_BUCKET=piritiya-app-288761728613
    
    ./scripts/deploy-frontend-s3.sh
    ```
    
    This will automatically invalidate the cache after uploading.

### Scripts

- **Backend Lambda image:** `scripts/deploy-backend-lambda.sh` – Builds from `backend/Dockerfile.lambda` and pushes to ECR. Requires `ECR_URI` environment variable. Optional: `CREATE_ECR=1` to auto-create repository.
- **Frontend S3:** `scripts/deploy-frontend-s3.sh` – Builds frontend and syncs to S3. Requires `VITE_API_BASE_URL` and `S3_BUCKET`. Optional: `CLOUDFRONT_DIST_ID` for cache invalidation.

**Note:** Backend has no regular Dockerfile. Only `Dockerfile.lambda` exists for Lambda container deployment.

---

## 1. Backend deployment

### Option A: AWS Lambda + API Gateway (Recommended - Serverless)

**Note:** Backend has no regular Dockerfile. Use `Dockerfile.lambda` for Lambda deployment.

1. **Build and push Lambda container image** (from project root):
   ```bash
   # Set your AWS account ID
   export AWS_ACCOUNT_ID=288761728613
   export ECR_URI=${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/piritiya-api
   
   # Create ECR repository (first time only)
   export CREATE_ECR=1
   
   # Build and push using the deployment script
   ./scripts/deploy-backend-lambda.sh
   ```

   This script:
   - Creates ECR repository if needed
   - Builds image from `backend/Dockerfile.lambda`
   - Pushes to ECR with tag `:latest`

2. **Create IAM role for Lambda**
   
   Create role `PiritiyaApiLambdaRole` with trust policy for `lambda.amazonaws.com`:
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": {"Service": "lambda.amazonaws.com"},
       "Action": "sts:AssumeRole"
     }]
   }
   ```
   
   Attach these managed policies:
   - `AWSLambdaBasicExecutionRole` (CloudWatch logs)
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonBedrockFullAccess`
   - `AWSLambda_FullAccess` (to invoke other Lambdas)
   
   Add inline policy for Polly and Transcribe:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["polly:SynthesizeSpeech"],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "transcribe:StartTranscriptionJob",
           "transcribe:GetTranscriptionJob"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Create Lambda function**
   
   In AWS Console → Lambda → Create function:
   - Name: `piritiya-api`
   - Container image: Select the ECR image URI from step 1
   - Architecture: x86_64
   - Execution role: `PiritiyaApiLambdaRole`
   - Memory: 512 MB
   - Timeout: 30 seconds
   
   Environment variables (same as Phase 1, step 3):
   ```bash
   AWS_REGION=us-east-1
   BEDROCK_AGENT_ID=FNU9NS7PKO
   BEDROCK_AGENT_ALIAS_ID=59ZL9U0XOY
   AWS_TRANSCRIBE_BUCKET=piritiya-transcribe
   S3_BUCKET_DATA=piritiya-data
   S3_BUCKET_KNOWLEDGE_BASE=piritiya-knowledge-base
   DYNAMODB_TABLE_FARMERS=Farmers
   DYNAMODB_TABLE_NISAR=NISARData
   DYNAMODB_TABLE_CROP_RECOMMENDATIONS=CropRecommendations
   DYNAMODB_TABLE_CONSULTATIONS=Consultations
   LAMBDA_SOIL_MOISTURE=get-soil-moisture
   LAMBDA_CROP_ADVICE=get-crop-advice
   LAMBDA_MARKET_PRICES=get-market-prices
   CORS_ORIGINS=*
   ```
   
   **Note:** Update `CORS_ORIGINS` to your CloudFront URL after deployment.

4. **Create API Gateway HTTP API**
   
   In AWS Console → API Gateway → Create API → HTTP API:
   - Name: `piritiya-api`
   - Add integration: Lambda → `piritiya-api`
   - Configure routes:
     - `ANY /` → piritiya-api Lambda
     - `ANY /{proxy+}` → piritiya-api Lambda
   - Deploy to stage: `$default` or `prod`
   - Note the Invoke URL: `https://<api-id>.execute-api.us-east-1.amazonaws.com`

5. **Verify backend**
   ```bash
   # Test health endpoint
   curl https://<api-id>.execute-api.us-east-1.amazonaws.com/health
   # Should return: {"status":"healthy","service":"piritiya-api","version":"1.0.0"}
   
   # Test farmers endpoint
   curl https://<api-id>.execute-api.us-east-1.amazonaws.com/farmers
   # Should return: Array of 3 farmer profiles
   ```

### Option B: Traditional Server (EC2, ECS, or any VM)

**Note:** No regular Dockerfile exists. You'll need to create one or run directly with uvicorn.

1. **Run with uvicorn** (on EC2 or any server):
   ```bash
   # Install dependencies
   cd backend
   pip install -r requirements.txt
   
   # Set environment variables (use .env or export)
   export AWS_REGION=us-east-1
   export BEDROCK_AGENT_ID=FNU9NS7PKO
   export BEDROCK_AGENT_ALIAS_ID=59ZL9U0XOY
   # ... (all other vars from .env)
   
   # Run server
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Set up reverse proxy** (nginx or similar) for HTTPS

3. **Configure CORS** in .env:
   ```bash
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

---

## 2. Frontend deployment

### Build for production

Set your **production API URL** and build:

```bash
cd frontend
VITE_API_BASE_URL=https://your-backend-url.com npm run build
```

This writes the built app to `frontend/dist/`.

### Option 1: Netlify

```bash
cd frontend
npm install -g netlify-cli   # once
VITE_API_BASE_URL=https://your-backend-url.com npm run build
netlify deploy --prod --dir=dist
```

- In Netlify: set **Environment variable** `VITE_API_BASE_URL` for production builds, or keep using the inline env above.
- Add `public/_redirects` with `/* /index.html 200` for SPA routing if not already present.

### Option 2: Vercel

```bash
cd frontend
npm i -g vercel   # once
VITE_API_BASE_URL=https://your-backend-url.com npm run build
vercel --prod
```

- In Vercel project settings, add `VITE_API_BASE_URL` for production.

### Option 3: AWS S3 + CloudFront

1. Create an S3 bucket (e.g. `piritiya-app`) and enable static website hosting, or use CloudFront origin.

2. Build and upload:
   ```bash
   cd frontend
   VITE_API_BASE_URL=https://your-backend-url.com npm run build
   aws s3 sync dist/ s3://piritiya-app --delete
   ```

3. If using CloudFront, create a distribution with origin = S3 (or the S3 website endpoint), default root `index.html`, and optionally add a custom domain. Invalidate cache after updates:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

---

## 3. After deployment

1. **CORS**  
   Backend must allow your frontend origin. Set in backend env:
   ```bash
   CORS_ORIGINS=https://your-app.netlify.app,https://your-domain.com
   ```
   No trailing slash. Use comma for multiple origins.

2. **Verify backend**
   - `GET https://your-backend-url.com/health` → `{"status":"healthy",...}`
   - `POST https://your-backend-url.com/speech/synthesize` with body `{"text":"hello","language":"en"}` → returns audio (or 401/403 if auth is added).

3. **Verify frontend**
   - Open the deployed app URL, complete onboarding, open Home, and check:
     - Language selector and voice (if backend is up, AWS voice is used when “Use AWS voice” is on).
     - Quick actions and chat (backend must be reachable).

---

## 4. Deployment Checklist

| Step | Action | Status |
|------|--------|--------|
| 1 | AWS infrastructure verified (DynamoDB, Lambda, S3, Bedrock, Polly) | ✅ Complete |
| 2 | Backend Lambda container built and pushed to ECR | ⬜ To do |
| 3 | Lambda function created with correct IAM role and env vars | ⬜ To do |
| 4 | API Gateway HTTP API created and routes configured | ⬜ To do |
| 5 | Backend health check returns 200 (`GET /health`) | ⬜ To do |
| 6 | Frontend built with `VITE_API_BASE_URL` set to API Gateway URL | ⬜ To do |
| 7 | Frontend deployed to S3 bucket | ⬜ To do |
| 8 | CloudFront distribution created with OAC | ⬜ To do |
| 9 | S3 bucket policy updated for CloudFront access | ⬜ To do |
| 10 | Lambda `CORS_ORIGINS` updated to CloudFront domain | ⬜ To do |
| 11 | Test in browser: onboarding, voice, quick actions, chat | ⬜ To do |
| 12 | Test offline mode (PWA caching) | ⬜ To do |

**Current Infrastructure Status:** ✅ All AWS resources operational (see [AWS_INFRASTRUCTURE_COMPLETE.md](AWS_INFRASTRUCTURE_COMPLETE.md))

---

## 5. Quick Reference

### Files and Documentation
- **Backend Lambda Dockerfile**: `backend/Dockerfile.lambda` (for AWS Lambda container deployment)
- **Backend Lambda entry**: `backend/lambda_handler.py` (handler: `lambda_handler.handler`)
- **Backend Lambda dependencies**: `backend/requirements-lambda.txt` (includes mangum for ASGI)
- **Frontend build**: `VITE_API_BASE_URL=<url> npm run build` in `frontend/`
- **Frontend deploy details**: `frontend/DEPLOYMENT.md`
- **AWS infrastructure status**: `AWS_INFRASTRUCTURE_COMPLETE.md` ✅
- **AWS setup guide**: `docs/setup/AWS_VOICE_SETUP.md`

### Deployment Scripts
- **Backend Lambda**: `./scripts/deploy-backend-lambda.sh` (requires `ECR_URI` env var)
- **Frontend S3**: `./scripts/deploy-frontend-s3.sh` (requires `VITE_API_BASE_URL` and `S3_BUCKET`)

### AWS Resources (Account: 288761728613, Region: us-east-1)
- **DynamoDB Tables**: Farmers, NISARData, CropRecommendations, Consultations (all ACTIVE with data)
- **Lambda Functions**: get-soil-moisture, get-crop-advice, get-market-prices (all deployed)
- **S3 Buckets**: piritiya-data, piritiya-knowledge-base, piritiya-transcribe (all created)
- **Bedrock Agent**: FNU9NS7PKO (Alias: 59ZL9U0XOY) - Claude model
- **IAM User**: piritiya-developer (needs ECR, API Gateway, CloudFront, and Transcribe for full deploy/voice; see [ECR_PERMISSIONS_NEEDED.md](ECR_PERMISSIONS_NEEDED.md), [docs/setup/API_GATEWAY_PERMISSIONS_NEEDED.md](docs/setup/API_GATEWAY_PERMISSIONS_NEEDED.md), [docs/setup/CLOUDFRONT_PERMISSIONS_NEEDED.md](docs/setup/CLOUDFRONT_PERMISSIONS_NEEDED.md), [docs/setup/TRANSCRIBE_PERMISSIONS_NEEDED.md](docs/setup/TRANSCRIBE_PERMISSIONS_NEEDED.md))

### Test Farmer IDs
- **F001** - राम कुमार (Ram Kumar) - Lucknow district
- **F002** - सीता देवी (Sita Devi) - Kanpur district  
- **F003** - मोहन सिंह (Mohan Singh) - Varanasi district

**Note:** No regular Dockerfile exists for backend. Use uvicorn directly for local development, or `Dockerfile.lambda` for Lambda deployment.
