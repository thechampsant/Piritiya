#!/bin/bash

# Piritiya Production Deployment Script
# This script automates the deployment of backend (Lambda + API Gateway) and frontend (S3 + CloudFront)
# Prerequisites: AWS CLI configured, Docker installed, Node.js installed

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_ACCOUNT_ID="288761728613"
AWS_REGION="us-east-1"
ECR_REPO_NAME="piritiya-api"
LAMBDA_FUNCTION_NAME="piritiya-api"
API_GATEWAY_NAME="piritiya-api"
S3_BUCKET_NAME="piritiya-app-${AWS_ACCOUNT_ID}"
CLOUDFRONT_COMMENT="Piritiya PWA Distribution"

# Bedrock and AWS resource names
BEDROCK_AGENT_ID="FNU9NS7PKO"
BEDROCK_AGENT_ALIAS_ID="59ZL9U0XOY"
AWS_TRANSCRIBE_BUCKET="piritiya-transcribe"

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install it first."
        exit 1
    fi
    print_success "AWS CLI installed"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install it first."
        exit 1
    fi
    print_success "Docker installed"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install it first."
        exit 1
    fi
    print_success "Node.js installed"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi
    print_success "AWS credentials configured"
    
    # Verify account ID
    CURRENT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    if [ "$CURRENT_ACCOUNT" != "$AWS_ACCOUNT_ID" ]; then
        print_warning "AWS Account mismatch. Expected: $AWS_ACCOUNT_ID, Got: $CURRENT_ACCOUNT"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "AWS Account verified: $AWS_ACCOUNT_ID"
    fi
}

# Phase 1: Deploy Backend
deploy_backend() {
    print_header "Phase 1: Deploying Backend (Lambda + API Gateway)"
    
    # Step 1: Build and push Lambda container
    print_info "Step 1: Building and pushing Lambda container to ECR..."
    
    export ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
    export CREATE_ECR=1
    
    if ! ./scripts/deploy-backend-lambda.sh; then
        print_error "Failed to build and push Lambda container"
        
        # Check if it's an ECR permission issue
        if aws ecr describe-repositories --region "$AWS_REGION" 2>&1 | grep -q "AccessDeniedException"; then
            print_warning "ECR permissions missing for IAM user"
            echo ""
            print_info "Fix this by running:"
            echo "  ./scripts/add-ecr-permissions.sh"
            echo ""
            print_info "Or see: ECR_PERMISSIONS_NEEDED.md for manual instructions"
        fi
        
        exit 1
    fi
    print_success "Lambda container pushed to ECR: $ECR_URI"
    
    # Step 2: Check if IAM role exists
    print_info "Step 2: Checking IAM role for Lambda..."
    
    if aws iam get-role --role-name PiritiyaApiLambdaRole &> /dev/null; then
        print_success "IAM role PiritiyaApiLambdaRole already exists"
    else
        print_warning "IAM role PiritiyaApiLambdaRole not found"
        print_info "Please create the role manually with the following policies:"
        echo "  - AWSLambdaBasicExecutionRole"
        echo "  - AmazonDynamoDBFullAccess"
        echo "  - AmazonS3FullAccess"
        echo "  - AmazonBedrockFullAccess"
        echo "  - AWSLambda_FullAccess"
        echo "  - Inline policy for Polly and Transcribe (see DEPLOY.md)"
        read -p "Press Enter when role is created..."
    fi
    
    # Step 3: Create or update Lambda function
    print_info "Step 3: Creating/updating Lambda function..."
    
    if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null; then
        print_info "Lambda function exists, updating code..."
        aws lambda update-function-code \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --image-uri "${ECR_URI}:latest" \
            --region "$AWS_REGION" > /dev/null
        
        # Wait for update to complete
        aws lambda wait function-updated --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION"
        
        print_info "Updating environment variables..."
        aws lambda update-function-configuration \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --environment "Variables={
                BEDROCK_AGENT_ID=${BEDROCK_AGENT_ID},
                BEDROCK_AGENT_ALIAS_ID=${BEDROCK_AGENT_ALIAS_ID},
                AWS_TRANSCRIBE_BUCKET=${AWS_TRANSCRIBE_BUCKET},
                S3_BUCKET_DATA=piritiya-data,
                S3_BUCKET_KNOWLEDGE_BASE=piritiya-knowledge-base,
                DYNAMODB_TABLE_FARMERS=Farmers,
                DYNAMODB_TABLE_NISAR=NISARData,
                DYNAMODB_TABLE_CROP_RECOMMENDATIONS=CropRecommendations,
                DYNAMODB_TABLE_CONSULTATIONS=Consultations,
                LAMBDA_SOIL_MOISTURE=get-soil-moisture,
                LAMBDA_CROP_ADVICE=get-crop-advice,
                LAMBDA_MARKET_PRICES=get-market-prices,
                CORS_ORIGINS=*
            }" \
            --region "$AWS_REGION" > /dev/null
        
        print_success "Lambda function updated"
    else
        print_info "Creating new Lambda function..."
        aws lambda create-function \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --package-type Image \
            --code ImageUri="${ECR_URI}:latest" \
            --role "arn:aws:iam::${AWS_ACCOUNT_ID}:role/PiritiyaApiLambdaRole" \
            --timeout 30 \
            --memory-size 512 \
            --environment "Variables={
                BEDROCK_AGENT_ID=${BEDROCK_AGENT_ID},
                BEDROCK_AGENT_ALIAS_ID=${BEDROCK_AGENT_ALIAS_ID},
                AWS_TRANSCRIBE_BUCKET=${AWS_TRANSCRIBE_BUCKET},
                S3_BUCKET_DATA=piritiya-data,
                S3_BUCKET_KNOWLEDGE_BASE=piritiya-knowledge-base,
                DYNAMODB_TABLE_FARMERS=Farmers,
                DYNAMODB_TABLE_NISAR=NISARData,
                DYNAMODB_TABLE_CROP_RECOMMENDATIONS=CropRecommendations,
                DYNAMODB_TABLE_CONSULTATIONS=Consultations,
                LAMBDA_SOIL_MOISTURE=get-soil-moisture,
                LAMBDA_CROP_ADVICE=get-crop-advice,
                LAMBDA_MARKET_PRICES=get-market-prices,
                CORS_ORIGINS=*
            }" \
            --region "$AWS_REGION" > /dev/null
        
        print_success "Lambda function created"
    fi
    
    # Get Lambda ARN
    LAMBDA_ARN=$(aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --region "$AWS_REGION" --query 'Configuration.FunctionArn' --output text)
    print_info "Lambda ARN: $LAMBDA_ARN"
    
    # Step 4: Create or get API Gateway
    print_info "Step 4: Setting up API Gateway..."
    
    # Check if API exists
    API_ID=$(aws apigatewayv2 get-apis --region "$AWS_REGION" --query "Items[?Name=='${API_GATEWAY_NAME}'].ApiId" --output text)
    
    if [ -z "$API_ID" ]; then
        print_info "Creating new API Gateway..."
        API_ID=$(aws apigatewayv2 create-api \
            --name "$API_GATEWAY_NAME" \
            --protocol-type HTTP \
            --region "$AWS_REGION" \
            --query 'ApiId' \
            --output text)
        print_success "API Gateway created: $API_ID"
    else
        print_success "API Gateway already exists: $API_ID"
    fi
    
    # Create integration
    print_info "Creating Lambda integration..."
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id "$API_ID" \
        --integration-type AWS_PROXY \
        --integration-uri "$LAMBDA_ARN" \
        --payload-format-version 2.0 \
        --region "$AWS_REGION" \
        --query 'IntegrationId' \
        --output text 2>/dev/null || \
        aws apigatewayv2 get-integrations --api-id "$API_ID" --region "$AWS_REGION" --query 'Items[0].IntegrationId' --output text)
    
    # Create routes
    print_info "Creating routes..."
    aws apigatewayv2 create-route \
        --api-id "$API_ID" \
        --route-key 'ANY /' \
        --target "integrations/$INTEGRATION_ID" \
        --region "$AWS_REGION" &> /dev/null || print_info "Route ANY / already exists"
    
    aws apigatewayv2 create-route \
        --api-id "$API_ID" \
        --route-key 'ANY /{proxy+}' \
        --target "integrations/$INTEGRATION_ID" \
        --region "$AWS_REGION" &> /dev/null || print_info "Route ANY /{proxy+} already exists"
    
    # Get or create stage
    STAGE_NAME='$default'
    aws apigatewayv2 create-stage \
        --api-id "$API_ID" \
        --stage-name '$default' \
        --auto-deploy \
        --region "$AWS_REGION" &> /dev/null || print_info "Stage already exists"
    
    # Add Lambda permission for API Gateway
    print_info "Adding Lambda invoke permission for API Gateway..."
    aws lambda add-permission \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --statement-id apigateway-invoke \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:${AWS_REGION}:${AWS_ACCOUNT_ID}:${API_ID}/*/*" \
        --region "$AWS_REGION" &> /dev/null || print_info "Permission already exists"
    
    # Get API endpoint
    API_ENDPOINT="https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com"
    print_success "API Gateway endpoint: $API_ENDPOINT"
    
    # Step 5: Verify backend
    print_info "Step 5: Verifying backend..."
    sleep 3  # Wait for API Gateway to be ready
    
    HEALTH_RESPONSE=$(curl -s "${API_ENDPOINT}/health" || echo "failed")
    if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
        print_success "Backend health check passed"
        echo "$HEALTH_RESPONSE"
    else
        print_error "Backend health check failed"
        echo "$HEALTH_RESPONSE"
        exit 1
    fi
    
    # Export for Phase 2
    export VITE_API_BASE_URL="$API_ENDPOINT"
    echo "$API_ENDPOINT" > /tmp/piritiya-api-endpoint.txt
}

# Phase 2: Deploy Frontend
deploy_frontend() {
    print_header "Phase 2: Deploying Frontend (S3 + CloudFront)"
    
    # Get API endpoint from Phase 1
    if [ -f /tmp/piritiya-api-endpoint.txt ]; then
        VITE_API_BASE_URL=$(cat /tmp/piritiya-api-endpoint.txt)
    fi
    
    if [ -z "$VITE_API_BASE_URL" ]; then
        print_error "API endpoint not found. Run Phase 1 first or set VITE_API_BASE_URL manually."
        exit 1
    fi
    
    print_info "Using API endpoint: $VITE_API_BASE_URL"
    
    # Step 6: Create S3 bucket
    print_info "Step 6: Creating S3 bucket for frontend..."
    
    if aws s3 ls "s3://${S3_BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
        aws s3 mb "s3://${S3_BUCKET_NAME}" --region "$AWS_REGION"
        print_success "S3 bucket created: $S3_BUCKET_NAME"
    else
        print_success "S3 bucket already exists: $S3_BUCKET_NAME"
    fi
    
    # Step 7: Build and upload frontend
    print_info "Step 7: Building and uploading frontend..."
    
    export VITE_API_BASE_URL
    export S3_BUCKET="$S3_BUCKET_NAME"
    
    if ! ./scripts/deploy-frontend-s3.sh; then
        print_error "Failed to build and upload frontend"
        exit 1
    fi
    print_success "Frontend uploaded to S3"
    
    # Step 8: Create CloudFront distribution
    print_info "Step 8: Setting up CloudFront distribution..."
    
    # Check if distribution exists (don't exit on permission errors)
    DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='${CLOUDFRONT_COMMENT}'].Id" --output text 2>/dev/null) || true
    DIST_ID=$(echo "$DIST_ID" | tr -d '\r' | xargs)
    if [ "$DIST_ID" = "None" ]; then DIST_ID=""; fi
    
    if [ -z "$DIST_ID" ]; then
        print_info "Creating CloudFront distribution via CLI (may take a few minutes to deploy)..."
        # Create Origin Access Control (OAC) for S3
        OAC_NAME="piritiya-s3-oac-${AWS_ACCOUNT_ID}"
        OAC_ID=$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='${OAC_NAME}'].Id" --output text 2>/dev/null) || true
        OAC_ID=$(echo "$OAC_ID" | tr -d '\r' | xargs)
        if [ -z "$OAC_ID" ] || [ "$OAC_ID" = "None" ]; then
            OAC_RESPONSE=$(aws cloudfront create-origin-access-control --origin-access-control-config "{
                \"Name\": \"${OAC_NAME}\",
                \"Description\": \"OAC for Piritiya S3 frontend\",
                \"SigningProtocol\": \"sigv4\",
                \"SigningBehavior\": \"always\",
                \"OriginAccessControlOriginType\": \"s3\"
            }" 2>/dev/null) || true
            if [ -n "$OAC_RESPONSE" ]; then
                OAC_ID=$(echo "$OAC_RESPONSE" | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)
            fi
        fi
        if [ -z "$OAC_ID" ]; then
            print_warning "Could not create or find OAC. Trying simple create-distribution (no OAC)..."
            CREATE_OUT=$(aws cloudfront create-distribution \
                --origin-domain-name "${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com" \
                --default-root-object index.html \
                --query 'Distribution.{Id:Id,DomainName:DomainName,ARN:ARN}' \
                --output json 2>&1) || true
        else
            ORIGIN_DOMAIN="${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com"
            CALLER_REF="piritiya-$(date +%s)"
            TMP_CF_CONFIG=$(mktemp)
            cat <<CFJSON > "$TMP_CF_CONFIG"
{
    "CallerReference": "${CALLER_REF}",
    "Comment": "${CLOUDFRONT_COMMENT}",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [{
            "Id": "S3-${S3_BUCKET_NAME}",
            "DomainName": "${ORIGIN_DOMAIN}",
            "OriginAccessControlId": "${OAC_ID}",
            "CustomHeaders": {"Quantity": 0},
            "ConnectionAttempts": 3,
            "ConnectionTimeout": 10
        }]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-${S3_BUCKET_NAME}",
        "ViewerProtocolPolicy": "redirect-http-to-https",
        "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"], "CachedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]}},
        "Compress": true,
        "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"
    },
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {"ErrorCode": 403, "ResponseCode": "200", "ResponsePagePath": "/index.html", "ErrorCachingMinTTL": 300},
            {"ErrorCode": 404, "ResponseCode": "200", "ResponsePagePath": "/index.html", "ErrorCachingMinTTL": 300}
        ]
    },
    "Enabled": true,
    "ViewerCertificate": {"CloudFrontDefaultCertificate": true, "MinimumProtocolVersion": "TLSv1.2_2021"}
}
CFJSON
            CREATE_OUT=$(aws cloudfront create-distribution --distribution-config "file://${TMP_CF_CONFIG}" --query 'Distribution.{Id:Id,DomainName:DomainName,ARN:ARN}' --output json 2>&1) || true
            rm -f "$TMP_CF_CONFIG"
        fi
        if [ -n "$CREATE_OUT" ] && echo "$CREATE_OUT" | grep -q '"Id"'; then
            DIST_ID=$(echo "$CREATE_OUT" | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)
            CLOUDFRONT_DOMAIN=$(echo "$CREATE_OUT" | grep -o '"DomainName": "[^"]*"' | head -1 | cut -d'"' -f4)
            DIST_ARN=$(echo "$CREATE_OUT" | grep -o '"ARN": "[^"]*"' | head -1 | cut -d'"' -f4)
            print_success "CloudFront distribution created: $DIST_ID (https://${CLOUDFRONT_DOMAIN})"
            if [ -n "$DIST_ARN" ] && [ -n "$OAC_ID" ]; then
                print_info "Updating S3 bucket policy for CloudFront OAC..."
                BUCKET_POLICY=$(cat <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "AllowCloudFrontServicePrincipal",
        "Effect": "Allow",
        "Principal": {"Service": "cloudfront.amazonaws.com"},
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*",
        "Condition": {"StringEquals": {"AWS:SourceArn": "${DIST_ARN}"}}
    }]
}
POLICY
)
                echo "$BUCKET_POLICY" > /tmp/piritiya-bucket-policy.json
                aws s3api put-bucket-policy --bucket "$S3_BUCKET_NAME" --policy file:///tmp/piritiya-bucket-policy.json 2>/dev/null && print_success "S3 bucket policy updated" || print_warning "Could not set S3 bucket policy (add OAC policy in S3 console if 403 on load)"
                rm -f /tmp/piritiya-bucket-policy.json
            fi
        else
            print_warning "CloudFront creation failed or no permission. Create manually in AWS Console:"
            if [ -n "$CREATE_OUT" ]; then
                echo "  AWS output:"
                echo "$CREATE_OUT" | head -5
            fi
            echo "  1. CloudFront → Create distribution"
            echo "  2. Origin: ${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com"
            echo "  3. Default root: index.html; SPA errors: 403/404 → 200 /index.html"
            echo "  4. Comment: ${CLOUDFRONT_COMMENT} (so this script finds it next time)"
            read -p "Press Enter when CloudFront distribution is created (or leave empty to skip)..."
            DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='${CLOUDFRONT_COMMENT}'].Id" --output text 2>/dev/null) || true
            DIST_ID=$(echo "$DIST_ID" | tr -d '\r' | xargs)
            if [ "$DIST_ID" = "None" ]; then DIST_ID=""; fi
            if [ -z "$DIST_ID" ]; then
                echo ""
                print_info "Could not find distribution (no permission or wrong Comment). You can paste your CloudFront domain to continue."
                read -p "CloudFront domain (e.g. d1234abcd.cloudfront.net) or Enter to skip: " MANUAL_DOMAIN
                MANUAL_DOMAIN=$(echo "$MANUAL_DOMAIN" | tr -d '\r' | xargs)
                if [ -n "$MANUAL_DOMAIN" ]; then
                    CLOUDFRONT_DOMAIN="${MANUAL_DOMAIN}"
                    DIST_ID="manual"
                    print_success "Using domain: https://${CLOUDFRONT_DOMAIN}"
                else
                    print_info "Skipping CloudFront. Frontend is on S3 only; you can add CloudFront later and re-run to paste the domain."
                fi
            fi
        fi
    else
        print_success "CloudFront distribution already exists: $DIST_ID"
    fi
    
    if [ -z "$CLOUDFRONT_DOMAIN" ] && [ -n "$DIST_ID" ] && [ "$DIST_ID" != "manual" ]; then
        CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text 2>/dev/null) || true
    fi
    
    if [ -n "$CLOUDFRONT_DOMAIN" ]; then
        print_success "CloudFront domain: https://${CLOUDFRONT_DOMAIN}"
    fi
    
    # Step 9: S3 bucket policy (already done above if OAC was used; skip manual prompt)
    print_info "Step 9: S3 bucket policy (if 403 on app load, add CloudFront OAC policy in S3 bucket permissions)"
    
    # Step 10: Update Lambda CORS (only when we have a CloudFront domain)
    if [ -n "$CLOUDFRONT_DOMAIN" ]; then
        print_info "Step 10: Updating Lambda CORS_ORIGINS..."
        aws lambda update-function-configuration \
            --function-name "$LAMBDA_FUNCTION_NAME" \
            --environment "Variables={
                BEDROCK_AGENT_ID=${BEDROCK_AGENT_ID},
                BEDROCK_AGENT_ALIAS_ID=${BEDROCK_AGENT_ALIAS_ID},
                AWS_TRANSCRIBE_BUCKET=${AWS_TRANSCRIBE_BUCKET},
                S3_BUCKET_DATA=piritiya-data,
                S3_BUCKET_KNOWLEDGE_BASE=piritiya-knowledge-base,
                DYNAMODB_TABLE_FARMERS=Farmers,
                DYNAMODB_TABLE_NISAR=NISARData,
                DYNAMODB_TABLE_CROP_RECOMMENDATIONS=CropRecommendations,
                DYNAMODB_TABLE_CONSULTATIONS=Consultations,
                LAMBDA_SOIL_MOISTURE=get-soil-moisture,
                LAMBDA_CROP_ADVICE=get-crop-advice,
                LAMBDA_MARKET_PRICES=get-market-prices,
                CORS_ORIGINS=https://${CLOUDFRONT_DOMAIN}
            }" \
            --region "$AWS_REGION" > /dev/null
        print_success "CORS updated to: https://${CLOUDFRONT_DOMAIN}"
        echo "$DIST_ID" > /tmp/piritiya-cloudfront-id.txt
        echo "$CLOUDFRONT_DOMAIN" > /tmp/piritiya-cloudfront-domain.txt
    else
        print_info "Step 10: Skipped (no CloudFront domain). Lambda CORS remains as-is (e.g. *)."
        echo "" > /tmp/piritiya-cloudfront-domain.txt
        echo ""
        print_success "Frontend deploy complete. Files are on S3 (bucket: $S3_BUCKET_NAME)."
        print_info "To serve the app: create a CloudFront distribution in the console (origin: $S3_BUCKET_NAME.s3.$AWS_REGION.amazonaws.com), then run this script again and paste the distribution domain when prompted."
    fi
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    # Get endpoints from saved files or AWS (don't let AWS failures exit the script)
    API_ENDPOINT=$(cat /tmp/piritiya-api-endpoint.txt 2>/dev/null || echo "")
    CLOUDFRONT_DOMAIN=$(cat /tmp/piritiya-cloudfront-domain.txt 2>/dev/null || echo "")
    
    if [ -z "$API_ENDPOINT" ]; then
        API_ID=$(aws apigatewayv2 get-apis --region "$AWS_REGION" --query "Items[?Name=='${API_GATEWAY_NAME}'].ApiId" --output text 2>/dev/null) || true
        if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
            API_ENDPOINT="https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com"
        fi
    fi
    
    if [ -z "$CLOUDFRONT_DOMAIN" ]; then
        DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='${CLOUDFRONT_COMMENT}'].Id" --output text 2>/dev/null) || true
        if [ -n "$DIST_ID" ] && [ "$DIST_ID" != "None" ]; then
            CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text 2>/dev/null) || true
        fi
    fi
    
    # Always show where to access the app first
    echo ""
    print_info "Where to access the app:"
    if [ -n "$API_ENDPOINT" ]; then
        echo "  Backend API: $API_ENDPOINT"
    else
        echo "  Backend API: (not found — run ./scripts/deploy-production.sh to deploy backend)"
    fi
    if [ -n "$CLOUDFRONT_DOMAIN" ]; then
        echo "  Frontend (app): https://${CLOUDFRONT_DOMAIN}"
        echo ""
    else
        echo "  Frontend: Not deployed yet. Run: ./scripts/deploy-production.sh frontend"
        echo ""
    fi
    
    # Test backend only if we have an endpoint
    if [ -z "$API_ENDPOINT" ]; then
        print_info "Skipping backend tests (no API endpoint). Run full deploy or set /tmp/piritiya-api-endpoint.txt"
        return 1
    fi
    
    print_info "Testing backend endpoints..."
    echo -n "  Health check: "
    if curl -s --max-time 10 "${API_ENDPOINT}/health" | grep -q "healthy"; then
        print_success "OK"
    else
        print_error "FAILED"
    fi
    
    echo -n "  Farmers endpoint: "
    if curl -s --max-time 10 "${API_ENDPOINT}/farmers" | grep -q "farmer_id"; then
        print_success "OK"
    else
        print_error "FAILED"
    fi
    
    if [ -n "$CLOUDFRONT_DOMAIN" ]; then
        echo ""
        print_info "Open in browser: https://${CLOUDFRONT_DOMAIN}"
    fi
}

# Print deployment summary
print_summary() {
    print_header "Deployment Summary"
    
    API_ENDPOINT=$(cat /tmp/piritiya-api-endpoint.txt 2>/dev/null || echo "Not deployed")
    CLOUDFRONT_DOMAIN=$(cat /tmp/piritiya-cloudfront-domain.txt 2>/dev/null || echo "Not deployed")
    DIST_ID=$(cat /tmp/piritiya-cloudfront-id.txt 2>/dev/null || echo "")
    
    echo "Backend API:"
    echo "  Endpoint: $API_ENDPOINT"
    echo "  Lambda: $LAMBDA_FUNCTION_NAME"
    echo "  Region: $AWS_REGION"
    echo ""
    echo "Frontend:"
    echo "  URL: https://${CLOUDFRONT_DOMAIN}"
    echo "  S3 Bucket: $S3_BUCKET_NAME"
    echo "  CloudFront ID: $DIST_ID"
    echo ""
    echo "Next steps:"
    echo "  1. Test the application at: https://${CLOUDFRONT_DOMAIN}"
    echo "  2. Update DNS if using custom domain"
    echo "  3. Enable CloudWatch alarms for monitoring"
    echo "  4. Enable DynamoDB backups"
    echo ""
    echo "For future deployments:"
    echo "  Backend: ./scripts/deploy-backend-lambda.sh"
    echo "  Frontend: CLOUDFRONT_DIST_ID=$DIST_ID ./scripts/deploy-frontend-s3.sh"
}

# Main execution
main() {
    print_header "Piritiya Production Deployment"
    print_info "Account: $AWS_ACCOUNT_ID"
    print_info "Region: $AWS_REGION"
    echo ""
    
    # Check what to deploy
    if [ "$1" == "backend" ]; then
        check_prerequisites
        deploy_backend
        verify_deployment
    elif [ "$1" == "frontend" ]; then
        check_prerequisites
        deploy_frontend
        verify_deployment
    elif [ "$1" == "verify" ]; then
        verify_deployment
    else
        # Full deployment
        check_prerequisites
        deploy_backend
        deploy_frontend
        verify_deployment
        print_summary
    fi
    
    print_success "Deployment complete!"
}

# Run main
main "$@"
