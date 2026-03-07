#!/bin/bash
# Update PiritiyaBedrockAgentRole with model invocation permissions

set -e

ROLE_NAME="PiritiyaBedrockAgentRole"
AWS_REGION="${AWS_REGION:-ap-south-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🔧 Updating PiritiyaBedrockAgentRole permissions"
echo "Role: $ROLE_NAME"
echo ""

# Create complete policy with Lambda AND Bedrock permissions
cat > /tmp/piritiya-complete-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": [
        "arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:get-soil-moisture",
        "arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:get-crop-advice",
        "arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:get-market-prices"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:GetInferenceProfile",
        "bedrock:ListInferenceProfiles"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/*",
        "arn:aws:bedrock:${AWS_REGION}:${ACCOUNT_ID}:inference-profile/*",
        "arn:aws:bedrock:${AWS_REGION}::inference-profile/*"
      ]
    }
  ]
}
EOF

echo "Updating role policy..."
aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "BedrockLambdaInvokePolicy" \
    --policy-document file:///tmp/piritiya-complete-policy.json

echo "✓ Policy updated successfully"
echo ""
echo "=================================================="
echo "✓ PiritiyaBedrockAgentRole now has:"
echo "  - Lambda invocation permissions ✓"
echo "  - Bedrock model invocation permissions ✓"
echo "  - Inference profile access ✓"
echo ""
echo "Now you can:"
echo "1. Go to Bedrock → Agents → PiritiyaAgent → Edit"
echo "2. Select role: PiritiyaBedrockAgentRole"
echo "3. Select model: Claude 3 Haiku"
echo "4. Save and Prepare"
echo ""
