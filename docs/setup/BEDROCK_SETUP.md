# Amazon Bedrock Setup Guide for Piritiya

This guide walks you through setting up Amazon Bedrock Agents for the Piritiya agricultural advisory system.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Phase 1 Lambda functions deployed (get-soil-moisture, get-crop-advice, get-market-prices)
- DynamoDB tables and S3 buckets created

## Step 1: Enable Bedrock Model Access

Amazon Bedrock requires you to request access to foundation models before using them.

### Via AWS Console:

1. Go to AWS Console → Amazon Bedrock
2. Navigate to **Model access** in the left sidebar
3. Click **Manage model access** or **Enable specific models**
4. Select the models you want to use:
   - **Claude 3 Sonnet** (recommended for Piritiya - good balance of performance and cost)
   - **Claude 3.5 Sonnet** (best performance, higher cost)
   - **Claude 3 Haiku** (fastest, lowest cost, good for simple queries)
5. Click **Request model access** or **Save changes**
6. Wait for approval (usually instant for most models)

### Via AWS CLI:

Check available models in ap-south-1:
```bash
aws bedrock list-foundation-models --region ap-south-1 --query 'modelSummaries[?contains(modelId, `claude`)].{ModelId:modelId, Name:modelName}' --output table
```

## Step 2: Create Bedrock Agent IAM Role

Create an IAM role that allows Bedrock to invoke your Lambda functions.

```bash
# Create trust policy for Bedrock
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

# Create the role
aws iam create-role \
  --role-name PiritiyaBedrockAgentRole \
  --assume-role-policy-document file:///tmp/bedrock-trust-policy.json \
  --region ap-south-1

# Create policy for Lambda invocation
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
        "arn:aws:lambda:ap-south-1:*:function:get-soil-moisture",
        "arn:aws:lambda:ap-south-1:*:function:get-crop-advice",
        "arn:aws:lambda:ap-south-1:*:function:get-market-prices"
      ]
    }
  ]
}
EOF

# Attach the policy
aws iam put-role-policy \
  --role-name PiritiyaBedrockAgentRole \
  --policy-name BedrockLambdaInvokePolicy \
  --policy-document file:///tmp/bedrock-lambda-policy.json \
  --region ap-south-1
```

## Step 3: Create Bedrock Agent

### Option A: Via AWS Console (Recommended for First Time)

1. Go to **Amazon Bedrock** → **Agents** → **Create Agent**

2. **Agent details:**
   - Agent name: `PiritiyaAgent`
   - Description: `AI agricultural advisor for Uttar Pradesh farmers`
   - User input: Enable
   - Agent resource role: Select `PiritiyaBedrockAgentRole`

3. **Select model:**
   - Model: `Claude 3 Sonnet` or `Claude 3.5 Sonnet`
   - Instructions for the Agent:
   ```
   You are an agricultural advisor for farmers in Uttar Pradesh, India. Your role is to:
   
   1. Provide crop recommendations based on soil moisture data from NASA-ISRO NISAR satellite
   2. Help farmers make informed decisions about irrigation and crop selection
   3. Provide market price information for crops
   4. Communicate in Hindi when appropriate, especially for crop advice reasoning
   5. Focus on water conservation and preventing groundwater depletion
   
   Always be helpful, practical, and consider the local context of Uttar Pradesh agriculture.
   Use the available tools to fetch real-time soil moisture data, crop recommendations, and market prices.
   ```

4. **Add Action Groups:**

   Click **Add Action Group** for each Lambda function:

   **Action Group 1: Soil Moisture**
   - Name: `SoilMoistureActions`
   - Description: `Fetch soil moisture data from NISAR satellite`
   - Lambda function: `get-soil-moisture`
   - Action group type: Define with API schemas
   - API Schema:
   ```json
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
           "summary": "Get soil moisture data for a farmer",
           "description": "Retrieves soil moisture data from NISAR satellite for a specific farmer's location",
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
               "description": "Successful response with soil moisture data",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "farmer_id": {"type": "string"},
                       "location": {"type": "string"},
                       "soil_moisture": {"type": "number"},
                       "timestamp": {"type": "string"}
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
   ```

   **Action Group 2: Crop Advice**
   - Name: `CropAdviceActions`
   - Description: `Get crop recommendations based on soil conditions`
   - Lambda function: `get-crop-advice`
   - API Schema:
   ```json
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
           "description": "Provides crop recommendations based on soil moisture and farmer profile",
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
             },
             {
               "name": "soil_moisture",
               "in": "query",
               "description": "Current soil moisture percentage",
               "required": false,
               "schema": {
                 "type": "number"
               }
             }
           ],
           "responses": {
             "200": {
               "description": "Successful response with crop recommendations",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "recommendations": {"type": "array"},
                       "reasoning": {"type": "string"}
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
   ```

   **Action Group 3: Market Prices**
   - Name: `MarketPriceActions`
   - Description: `Get current market prices for crops`
   - Lambda function: `get-market-prices`
   - API Schema:
   ```json
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
           "description": "Retrieves current market prices for crops in Uttar Pradesh",
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
             },
             {
               "name": "district",
               "in": "query",
               "description": "District name in Uttar Pradesh (optional)",
               "required": false,
               "schema": {
                 "type": "string"
               }
             }
           ],
           "responses": {
             "200": {
               "description": "Successful response with market prices",
               "content": {
                 "application/json": {
                   "schema": {
                     "type": "object",
                     "properties": {
                       "prices": {"type": "array"}
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
   ```

5. **Review and Create:**
   - Review all settings
   - Click **Create Agent**
   - Wait for agent creation to complete

6. **Prepare Agent:**
   - After creation, click **Prepare** to deploy the agent
   - This compiles the agent with all action groups

### Option B: Via AWS CLI (Advanced)

Coming soon - automated script for agent creation.

## Step 4: Test the Bedrock Agent

### Via AWS Console:

1. Go to your agent → **Test** tab
2. Try these sample queries:
   - "What is the soil moisture for farmer F001?"
   - "Give me crop recommendations for farmer F001"
   - "What are the current market prices for wheat?"
   - "मुझे गेहूं की सलाह दो" (Give me advice for wheat)

### Via AWS CLI:

```bash
# Get your agent ID and alias ID from the console
AGENT_ID="your-agent-id"
AGENT_ALIAS_ID="your-alias-id"

# Test the agent
aws bedrock-agent-runtime invoke-agent \
  --agent-id $AGENT_ID \
  --agent-alias-id $AGENT_ALIAS_ID \
  --session-id "test-session-1" \
  --input-text "What is the soil moisture for farmer F001?" \
  --region ap-south-1 \
  output.txt

cat output.txt
```

## Step 5: Create Agent Alias (for Production)

1. Go to your agent → **Aliases** tab
2. Click **Create alias**
3. Name: `production` or `v1`
4. Description: `Production version of Piritiya agent`
5. Click **Create**

The alias provides a stable endpoint for your application to use.

## Step 6: Grant Lambda Permissions

Allow Bedrock to invoke your Lambda functions:

```bash
# Get your agent ID from the console
AGENT_ID="your-agent-id"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Grant permissions for each Lambda function
for FUNCTION in get-soil-moisture get-crop-advice get-market-prices; do
  aws lambda add-permission \
    --function-name $FUNCTION \
    --statement-id bedrock-agent-invoke \
    --action lambda:InvokeFunction \
    --principal bedrock.amazonaws.com \
    --source-arn "arn:aws:bedrock:ap-south-1:${AWS_ACCOUNT_ID}:agent/${AGENT_ID}" \
    --region ap-south-1
done
```

## Step 7: Integration with Your Application

Save your agent details in `.env`:

```bash
# Add to .env file
BEDROCK_AGENT_ID=your-agent-id
BEDROCK_AGENT_ALIAS_ID=your-alias-id
BEDROCK_REGION=ap-south-1
```

Example Python code to invoke the agent:

```python
import boto3
import json

bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='ap-south-1')

def chat_with_agent(user_input, session_id):
    response = bedrock_agent.invoke_agent(
        agentId='your-agent-id',
        agentAliasId='your-alias-id',
        sessionId=session_id,
        inputText=user_input
    )
    
    # Process streaming response
    result = ""
    for event in response['completion']:
        if 'chunk' in event:
            chunk = event['chunk']
            if 'bytes' in chunk:
                result += chunk['bytes'].decode('utf-8')
    
    return result

# Example usage
response = chat_with_agent(
    "What is the soil moisture for farmer F001?",
    "session-123"
)
print(response)
```

## Troubleshooting

### Model Access Issues
- Ensure you've requested access to Claude models in ap-south-1 region
- Check model availability: Some models may not be available in all regions

### Lambda Invocation Errors
- Verify Lambda functions are deployed and working
- Check IAM role has correct permissions
- Ensure Lambda resource-based policy allows Bedrock to invoke

### Agent Not Responding
- Click "Prepare" after making any changes to action groups
- Check CloudWatch logs for Lambda functions
- Verify API schemas match Lambda function signatures

### Session Management
- Each conversation needs a unique session ID
- Sessions expire after 1 hour of inactivity
- Use consistent session IDs for conversation continuity

## Cost Considerations

- **Bedrock Agent**: Pay per request
- **Claude 3 Sonnet**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Claude 3 Haiku**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- **Lambda**: Pay per invocation (very low cost)
- **DynamoDB**: Pay per read/write (on-demand pricing)

For development/testing, costs should be minimal (< $5/month).

## Next Steps

1. Test the agent thoroughly with various queries
2. Integrate agent into your FastAPI backend
3. Build the PWA frontend to interact with the agent
4. Add conversation history and session management
5. Implement user authentication
6. Add monitoring and logging

## Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Bedrock Agents Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Claude Model Documentation](https://docs.anthropic.com/claude/docs)
- [Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
