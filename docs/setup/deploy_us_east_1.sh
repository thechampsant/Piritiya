#!/bin/bash
# Deploy Piritiya to us-east-1 region
# This is needed because Bedrock Agent works better in us-east-1

set -e

export AWS_REGION=us-east-1

echo "🚀 Deploying Piritiya to us-east-1"
echo "=================================="
echo ""

# Step 1: Create DynamoDB tables
echo "📊 Step 1: Creating DynamoDB tables..."
python3 scripts/create_dynamodb_tables.py
echo "✓ DynamoDB tables created"
echo ""

# Step 2: Load mock data
echo "📦 Step 2: Loading mock data..."
python3 scripts/load_mock_data.py
echo "✓ Mock data loaded"
echo ""

# Step 3: Deploy Lambda functions
echo "⚡ Step 3: Deploying Lambda functions..."
./lambda_functions/deploy.sh
echo "✓ Lambda functions deployed"
echo ""

# Step 4: Test deployment
echo "🧪 Step 4: Testing deployment..."
python3 scripts/test_phase1.py
echo ""

echo "=================================="
echo "✓ Deployment to us-east-1 complete!"
echo ""
echo "Next steps:"
echo "1. Update your Bedrock Agent to use us-east-1 region"
echo "2. Update agent Lambda action groups with new ARNs"
echo "3. Test agent: python3 scripts/test_bedrock_agent.py"
echo ""
