#!/bin/bash
# Fix Bedrock permissions for your IAM user
# This adds the necessary permissions to invoke Bedrock agents

set -e

AWS_REGION="${AWS_REGION:-ap-south-1}"
USER_NAME=$(aws iam get-user --query 'User.UserName' --output text 2>/dev/null || echo "")
POLICY_NAME="PiritiyaBedrockUserPolicy"

if [ -z "$USER_NAME" ]; then
    echo "❌ Could not determine IAM user. Are you using a role?"
    echo "If using a role, you need to add Bedrock permissions to that role instead."
    exit 1
fi

echo "🔐 Adding Bedrock permissions for user: $USER_NAME"
echo ""

# Create policy document
cat > /tmp/bedrock-user-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:GetAgent",
        "bedrock:ListAgents",
        "bedrock:GetAgentAlias",
        "bedrock:ListAgentAliases"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Check if policy already exists
if aws iam get-user-policy --user-name "$USER_NAME" --policy-name "$POLICY_NAME" 2>/dev/null; then
    echo "✓ Policy already exists, updating..."
    aws iam put-user-policy \
        --user-name "$USER_NAME" \
        --policy-name "$POLICY_NAME" \
        --policy-document file:///tmp/bedrock-user-policy.json
    echo "✓ Updated policy: $POLICY_NAME"
else
    echo "Creating new policy..."
    aws iam put-user-policy \
        --user-name "$USER_NAME" \
        --policy-name "$POLICY_NAME" \
        --policy-document file:///tmp/bedrock-user-policy.json
    echo "✓ Created policy: $POLICY_NAME"
fi

echo ""
echo "=================================================="
echo "✓ Bedrock permissions added successfully!"
echo ""
echo "User: $USER_NAME"
echo "Policy: $POLICY_NAME"
echo ""
echo "You can now invoke Bedrock agents."
echo "Test with: python3 scripts/test_bedrock_agent.py"
echo ""
