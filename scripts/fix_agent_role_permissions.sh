#!/bin/bash
# Fix Bedrock Agent execution role permissions
# This adds permissions to use inference profiles and models

set -e

ROLE_NAME="AmazonBedrockExecutionRoleForAgents_KDMBM9YKV1"
AWS_REGION="${AWS_REGION:-ap-south-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🔧 Fixing Bedrock Agent role permissions"
echo "Role: $ROLE_NAME"
echo "Account: $ACCOUNT_ID"
echo ""

# Create policy for inference profiles and models
cat > /tmp/bedrock-agent-model-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
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
    },
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
    }
  ]
}
EOF

echo "Adding inline policy to role..."
aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "BedrockAgentModelAccess" \
    --policy-document file:///tmp/bedrock-agent-model-policy.json

echo "✓ Policy added successfully"
echo ""
echo "=================================================="
echo "✓ Agent role permissions fixed!"
echo ""
echo "Now you can:"
echo "1. Go back to AWS Console → Bedrock → Agents → PiritiyaAgent"
echo "2. Click Edit"
echo "3. Select Claude 3 Haiku model"
echo "4. Click Save (should work now)"
echo "5. Click Prepare"
echo ""
