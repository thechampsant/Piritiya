#!/bin/bash
# Add specific Bedrock Agent Runtime permissions

set -e

USER_NAME="piritiya-developer"

echo "Adding Bedrock Agent Runtime permissions..."

cat > /tmp/bedrock-agent-runtime-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-user-policy \
    --user-name "$USER_NAME" \
    --policy-name "BedrockAgentRuntimePolicy" \
    --policy-document file:///tmp/bedrock-agent-runtime-policy.json

echo "✓ Added Bedrock Agent Runtime permissions"
echo "Waiting 5 seconds for propagation..."
sleep 5
echo "✓ Ready to test"
