#!/bin/bash
# Setup Amazon Bedrock for Piritiya
# This script automates IAM role creation and Lambda permissions

set -e

AWS_REGION="${AWS_REGION:-ap-south-1}"
ROLE_NAME="PiritiyaBedrockAgentRole"

echo "🤖 Setting up Amazon Bedrock for Piritiya"
echo "Region: $AWS_REGION"
echo ""

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $AWS_ACCOUNT_ID"
echo ""

# Step 1: Create Bedrock Agent IAM Role
echo "📋 Step 1: Creating Bedrock Agent IAM Role..."

if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "✓ IAM role $ROLE_NAME already exists"
else
    # Create trust policy
    cat > /tmp/bedrock-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    
    # Create role
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file:///tmp/bedrock-trust-policy.json \
        --region $AWS_REGION > /dev/null
    
    echo "✓ Created IAM role: $ROLE_NAME"
fi

# Step 2: Attach Lambda invocation policy
echo ""
echo "📋 Step 2: Attaching Lambda invocation policy..."

cat > /tmp/bedrock-lambda-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": [
        "arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:get-soil-moisture",
        "arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:get-crop-advice",
        "arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT_ID}:function:get-market-prices"
      ]
    }
  ]
}
EOF

aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name BedrockLambdaInvokePolicy \
    --policy-document file:///tmp/bedrock-lambda-policy.json \
    --region $AWS_REGION

echo "✓ Attached Lambda invocation policy"

# Step 3: Check model access
echo ""
echo "📋 Step 3: Checking Bedrock model access..."
echo ""
echo "Available Claude models in $AWS_REGION:"
aws bedrock list-foundation-models \
    --region $AWS_REGION \
    --query 'modelSummaries[?contains(modelId, `claude`)].{ModelId:modelId, Name:modelName}' \
    --output table 2>/dev/null || echo "⚠️  Unable to list models. You may need to enable model access in the console."

echo ""
echo "=================================================="
echo "✓ Bedrock IAM setup complete!"
echo ""
echo "Next steps:"
echo "1. Enable model access in AWS Console:"
echo "   → Go to Amazon Bedrock → Model access"
echo "   → Click 'Manage model access'"
echo "   → Enable Claude 3 Sonnet or Claude 3.5 Sonnet"
echo ""
echo "2. Create Bedrock Agent in AWS Console:"
echo "   → Go to Amazon Bedrock → Agents → Create Agent"
echo "   → Use role: $ROLE_NAME"
echo "   → Follow instructions in BEDROCK_SETUP.md"
echo ""
echo "3. After creating agent, run this to grant Lambda permissions:"
echo "   → ./scripts/grant_lambda_permissions.sh <AGENT_ID>"
echo ""
echo "📖 See BEDROCK_SETUP.md for detailed instructions"
echo ""
