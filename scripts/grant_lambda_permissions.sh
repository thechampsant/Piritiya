#!/bin/bash
# Grant Lambda permissions for Bedrock Agent
# Usage: ./scripts/grant_lambda_permissions.sh <AGENT_ID>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/grant_lambda_permissions.sh <AGENT_ID>"
    echo ""
    echo "Get your AGENT_ID from AWS Console:"
    echo "  → Amazon Bedrock → Agents → Your Agent → Agent ID"
    exit 1
fi

AGENT_ID=$1
AWS_REGION="${AWS_REGION:-ap-south-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🔐 Granting Lambda permissions for Bedrock Agent"
echo "Agent ID: $AGENT_ID"
echo "Region: $AWS_REGION"
echo ""

# Grant permissions for each Lambda function
for FUNCTION in get-soil-moisture get-crop-advice get-market-prices; do
    echo "Granting permission for $FUNCTION..."
    
    # Remove existing permission if it exists
    aws lambda remove-permission \
        --function-name $FUNCTION \
        --statement-id bedrock-agent-invoke \
        --region $AWS_REGION 2>/dev/null || true
    
    # Add new permission
    aws lambda add-permission \
        --function-name $FUNCTION \
        --statement-id bedrock-agent-invoke \
        --action lambda:InvokeFunction \
        --principal bedrock.amazonaws.com \
        --source-arn "arn:aws:bedrock:${AWS_REGION}:${AWS_ACCOUNT_ID}:agent/${AGENT_ID}" \
        --region $AWS_REGION > /dev/null
    
    echo "✓ Granted permission for $FUNCTION"
done

echo ""
echo "=================================================="
echo "✓ All Lambda permissions granted!"
echo ""
echo "Next steps:"
echo "1. Test your agent in AWS Console"
echo "2. Create an agent alias for production"
echo "3. Integrate agent into your application"
echo ""
