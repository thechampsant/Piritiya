#!/bin/bash
# Deploy Lambda functions to AWS
# Usage: ./lambda_functions/deploy.sh

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
ROLE_NAME="PiritiyaLambdaExecutionRole"

echo "🚀 Deploying Piritiya Lambda Functions"
echo "Region: $AWS_REGION"
echo ""

# Function to create IAM role if it doesn't exist
create_lambda_role() {
    echo "Checking IAM role..."
    
    if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
        echo "✓ IAM role $ROLE_NAME already exists"
        ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
    else
        echo "Creating IAM role $ROLE_NAME..."
        
        # Create trust policy
        cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
        
        # Create role
        ROLE_ARN=$(aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document file:///tmp/trust-policy.json \
            --query 'Role.Arn' \
            --output text)
        
        # Attach policies
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
        
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
        
        echo "✓ Created IAM role: $ROLE_ARN"
        echo "⏳ Waiting 10 seconds for role to propagate..."
        sleep 10
    fi
}

# Function to deploy a Lambda function
deploy_lambda() {
    local FUNCTION_NAME=$1
    local FUNCTION_DIR=$2
    
    echo ""
    echo "📦 Deploying $FUNCTION_NAME..."
    
    # Change to function directory
    cd "$FUNCTION_DIR" || exit 1
    
    # Create deployment package
    if [ -f "requirements.txt" ]; then
        echo "  Installing dependencies..."
        rm -rf package  # Clean up any existing package directory
        pip install -r requirements.txt -t package/ -q
        (cd package && zip -r ../function.zip . -q)
        zip -g function.zip lambda_function.py -q
        rm -rf package
    else
        zip function.zip lambda_function.py -q
    fi
    
    # Check if function exists
    if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
        echo "  Updating existing function..."
        aws lambda update-function-code \
            --function-name $FUNCTION_NAME \
            --zip-file fileb://function.zip \
            --region $AWS_REGION \
            --output text > /dev/null
        
        echo "  ✓ Updated $FUNCTION_NAME"
    else
        echo "  Creating new function..."
        aws lambda create-function \
            --function-name $FUNCTION_NAME \
            --runtime python3.11 \
            --role $ROLE_ARN \
            --handler lambda_function.lambda_handler \
            --zip-file fileb://function.zip \
            --timeout 10 \
            --memory-size 512 \
            --region $AWS_REGION \
            --output text > /dev/null
        
        echo "  ✓ Created $FUNCTION_NAME"
    fi
    
    # Clean up
    rm function.zip
    
    # Return to project root
    cd - > /dev/null || exit 1
}

# Main deployment
create_lambda_role

# Deploy each Lambda function
deploy_lambda "get-soil-moisture" "lambda_functions/get_soil_moisture"
deploy_lambda "get-crop-advice" "lambda_functions/get_crop_advice"
deploy_lambda "get-market-prices" "lambda_functions/get_market_prices"

echo ""
echo "=================================================="
echo "✓ All Lambda functions deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Test functions: aws lambda invoke --function-name get-soil-moisture output.json"
echo "2. Configure Bedrock Agent with these Lambda functions"
echo "3. View logs: aws logs tail /aws/lambda/get-soil-moisture --follow"
echo ""
