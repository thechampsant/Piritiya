#!/bin/bash
# Create Bedrock Agent in us-east-1 with all action groups

set -e

AWS_REGION="us-east-1"
AGENT_NAME="PiritiyaAgent"
AGENT_DESCRIPTION="AI agricultural advisor for Uttar Pradesh farmers"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🤖 Creating Bedrock Agent in us-east-1"
echo "======================================="
echo ""

# Step 1: Create or get IAM role for agent
echo "📋 Step 1: Setting up IAM role..."

ROLE_NAME="PiritiyaBedrockAgentRole"

if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "✓ Role $ROLE_NAME already exists"
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
else
    # Create trust policy
    cat > /tmp/agent-trust-policy.json <<EOF
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
    ROLE_ARN=$(aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file:///tmp/agent-trust-policy.json \
        --query 'Role.Arn' \
        --output text)
    
    echo "✓ Created role: $ROLE_ARN"
fi

# Add permissions to role
cat > /tmp/agent-permissions.json <<EOF
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
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:${AWS_REGION}::foundation-model/*"
    }
  ]
}
EOF

aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name BedrockAgentPermissions \
    --policy-document file:///tmp/agent-permissions.json

echo "✓ Role permissions updated"
echo ""

# Step 2: Create agent
echo "📋 Step 2: Creating Bedrock Agent..."

AGENT_INSTRUCTION="You are an agricultural advisor for farmers in Uttar Pradesh, India. Your role is to:

1. Provide crop recommendations based on soil moisture data from NASA-ISRO NISAR satellite
2. Help farmers make informed decisions about irrigation and crop selection
3. Provide market price information for crops
4. Communicate in Hindi when appropriate, especially for crop advice reasoning
5. Focus on water conservation and preventing groundwater depletion

Always be helpful, practical, and consider the local context of Uttar Pradesh agriculture.
Use the available tools to fetch real-time soil moisture data, crop recommendations, and market prices."

# Wait for role to propagate
echo "⏳ Waiting 10 seconds for IAM role to propagate..."
sleep 10

# Create agent
AGENT_RESPONSE=$(aws bedrock-agent create-agent \
    --agent-name "$AGENT_NAME" \
    --agent-resource-role-arn "$ROLE_ARN" \
    --description "$AGENT_DESCRIPTION" \
    --instruction "$AGENT_INSTRUCTION" \
    --foundation-model "amazon.nova-pro-v1:0" \
    --region $AWS_REGION \
    --output json)

AGENT_ID=$(echo $AGENT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['agent']['agentId'])")

echo "✓ Agent created with ID: $AGENT_ID"
echo ""

# Step 3: Create action groups
echo "📋 Step 3: Creating action groups..."

# Action Group 1: Soil Moisture
cat > /tmp/soil-moisture-schema.json <<'EOF'
{
  "openapi": "3.0.0",
  "info": {
    "title": "Soil Moisture API",
    "version": "1.0.0",
    "description": "API for fetching NISAR soil moisture data"
  },
  "paths": {
    "/soil-moisture": {
      "get": {
        "summary": "Get soil moisture data",
        "description": "Retrieves soil moisture data from NISAR satellite for a specific farmer",
        "operationId": "getSoilMoisture",
        "parameters": [
          {
            "name": "farmer_id",
            "in": "query",
            "description": "Unique identifier for the farmer",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF

aws bedrock-agent create-agent-action-group \
    --agent-id $AGENT_ID \
    --agent-version DRAFT \
    --action-group-name "SoilMoistureActions" \
    --description "Fetch soil moisture data from NISAR satellite" \
    --action-group-executor lambda="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:get-soil-moisture" \
    --api-schema s3="{\"s3BucketName\":\"none\",\"s3ObjectKey\":\"none\"}" \
    --function-schema file:///tmp/soil-moisture-schema.json \
    --region $AWS_REGION > /dev/null

echo "✓ Created SoilMoistureActions"

# Action Group 2: Crop Advice
cat > /tmp/crop-advice-schema.json <<'EOF'
{
  "openapi": "3.0.0",
  "info": {
    "title": "Crop Advice API",
    "version": "1.0.0",
    "description": "API for crop recommendations"
  },
  "paths": {
    "/crop-advice": {
      "get": {
        "summary": "Get crop recommendations",
        "description": "Provides crop recommendations based on soil moisture",
        "operationId": "getCropAdvice",
        "parameters": [
          {
            "name": "farmer_id",
            "in": "query",
            "description": "Unique identifier for the farmer",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF

aws bedrock-agent create-agent-action-group \
    --agent-id $AGENT_ID \
    --agent-version DRAFT \
    --action-group-name "CropAdviceActions" \
    --description "Get crop recommendations based on soil conditions" \
    --action-group-executor lambda="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:get-crop-advice" \
    --api-schema s3="{\"s3BucketName\":\"none\",\"s3ObjectKey\":\"none\"}" \
    --function-schema file:///tmp/crop-advice-schema.json \
    --region $AWS_REGION > /dev/null

echo "✓ Created CropAdviceActions"

# Action Group 3: Market Prices
cat > /tmp/market-prices-schema.json <<'EOF'
{
  "openapi": "3.0.0",
  "info": {
    "title": "Market Prices API",
    "version": "1.0.0",
    "description": "API for crop market prices"
  },
  "paths": {
    "/market-prices": {
      "get": {
        "summary": "Get market prices",
        "description": "Retrieves current market prices for crops",
        "operationId": "getMarketPrices",
        "parameters": [
          {
            "name": "crop",
            "in": "query",
            "description": "Name of the crop (optional)",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF

aws bedrock-agent create-agent-action-group \
    --agent-id $AGENT_ID \
    --agent-version DRAFT \
    --action-group-name "MarketPriceActions" \
    --description "Get current market prices for crops" \
    --action-group-executor lambda="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:get-market-prices" \
    --api-schema s3="{\"s3BucketName\":\"none\",\"s3ObjectKey\":\"none\"}" \
    --function-schema file:///tmp/market-prices-schema.json \
    --region $AWS_REGION > /dev/null

echo "✓ Created MarketPriceActions"
echo ""

# Step 4: Prepare agent
echo "📋 Step 4: Preparing agent..."
aws bedrock-agent prepare-agent \
    --agent-id $AGENT_ID \
    --region $AWS_REGION > /dev/null

echo "✓ Agent prepared"
echo ""

# Step 5: Create alias
echo "📋 Step 5: Creating agent alias..."
ALIAS_RESPONSE=$(aws bedrock-agent create-agent-alias \
    --agent-id $AGENT_ID \
    --agent-alias-name "production" \
    --description "Production alias for Piritiya agent" \
    --region $AWS_REGION \
    --output json)

ALIAS_ID=$(echo $ALIAS_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['agentAlias']['agentAliasId'])")

echo "✓ Alias created with ID: $ALIAS_ID"
echo ""

# Step 6: Grant Lambda permissions
echo "📋 Step 6: Granting Lambda permissions..."

for FUNCTION in get-soil-moisture get-crop-advice get-market-prices; do
    aws lambda add-permission \
        --function-name $FUNCTION \
        --statement-id bedrock-agent-invoke-$AGENT_ID \
        --action lambda:InvokeFunction \
        --principal bedrock.amazonaws.com \
        --source-arn "arn:aws:bedrock:${AWS_REGION}:${ACCOUNT_ID}:agent/${AGENT_ID}" \
        --region $AWS_REGION 2>/dev/null || echo "  Permission already exists for $FUNCTION"
done

echo "✓ Lambda permissions granted"
echo ""

# Step 7: Update .env file
echo "📋 Step 7: Updating .env file..."

if grep -q "BEDROCK_AGENT_ID=" .env 2>/dev/null; then
    sed -i.bak "s/BEDROCK_AGENT_ID=.*/BEDROCK_AGENT_ID=$AGENT_ID/" .env
    sed -i.bak "s/BEDROCK_AGENT_ALIAS_ID=.*/BEDROCK_AGENT_ALIAS_ID=$ALIAS_ID/" .env
    sed -i.bak "s/AWS_REGION=.*/AWS_REGION=us-east-1/" .env
else
    echo "BEDROCK_AGENT_ID=$AGENT_ID" >> .env
    echo "BEDROCK_AGENT_ALIAS_ID=$ALIAS_ID" >> .env
fi

echo "✓ .env file updated"
echo ""

echo "======================================="
echo "✓ Bedrock Agent created successfully!"
echo "======================================="
echo ""
echo "Agent ID: $AGENT_ID"
echo "Alias ID: $ALIAS_ID"
echo "Region: $AWS_REGION"
echo "Model: amazon.nova-pro-v1:0"
echo ""
echo "Next steps:"
echo "1. Test agent: python3 scripts/test_bedrock_agent.py"
echo "2. Start backend: cd backend && python3 main.py"
echo "3. Test chatbot: python3 backend/test_chatbot.py"
echo ""
