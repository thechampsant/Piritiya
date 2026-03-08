#!/bin/bash
# Create IAM user with Bedrock permissions
# Run this with root credentials, then switch to the new user

set -e

USER_NAME="piritiya-developer"
POLICY_NAME="PiritiyaBedrockPolicy"

echo "👤 Creating IAM user for Piritiya development"
echo ""

# Create user
if aws iam get-user --user-name "$USER_NAME" 2>/dev/null; then
    echo "✓ User $USER_NAME already exists"
else
    echo "Creating user: $USER_NAME"
    aws iam create-user --user-name "$USER_NAME"
    echo "✓ Created user: $USER_NAME"
fi

# Attach AWS managed policies
echo ""
echo "Attaching policies..."

aws iam attach-user-policy \
    --user-name "$USER_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonBedrockFullAccess" 2>/dev/null || echo "  - Bedrock policy already attached"

aws iam attach-user-policy \
    --user-name "$USER_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess" 2>/dev/null || echo "  - DynamoDB policy already attached"

aws iam attach-user-policy \
    --user-name "$USER_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AmazonS3FullAccess" 2>/dev/null || echo "  - S3 policy already attached"

aws iam attach-user-policy \
    --user-name "$USER_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AWSLambda_FullAccess" 2>/dev/null || echo "  - Lambda policy already attached"

aws iam attach-user-policy \
    --user-name "$USER_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/IAMReadOnlyAccess" 2>/dev/null || echo "  - IAM read policy already attached"

echo "✓ Policies attached"

# Create access key
echo ""
echo "Creating access key..."
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$USER_NAME" 2>&1)

if echo "$ACCESS_KEY_OUTPUT" | grep -q "LimitExceeded"; then
    echo "⚠️  User already has 2 access keys (AWS limit)"
    echo "   Delete an old key first: aws iam list-access-keys --user-name $USER_NAME"
    echo "   Then: aws iam delete-access-key --user-name $USER_NAME --access-key-id <KEY_ID>"
elif echo "$ACCESS_KEY_OUTPUT" | grep -q "AccessKeyId"; then
    ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | grep -o '"AccessKeyId": "[^"]*"' | cut -d'"' -f4)
    SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | grep -o '"SecretAccessKey": "[^"]*"' | cut -d'"' -f4)
    
    echo ""
    echo "=================================================="
    echo "✓ IAM User Created Successfully!"
    echo "=================================================="
    echo ""
    echo "User: $USER_NAME"
    echo ""
    echo "⚠️  SAVE THESE CREDENTIALS - They won't be shown again!"
    echo ""
    echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
    echo "AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
    echo ""
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo "1. Configure AWS CLI with these credentials:"
    echo "   aws configure"
    echo ""
    echo "2. Or add to .env file:"
    echo "   AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID"
    echo "   AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY"
    echo ""
    echo "3. Test Bedrock agent:"
    echo "   python3 scripts/test_bedrock_agent.py"
    echo ""
else
    echo "✓ Access key already exists or created"
fi
