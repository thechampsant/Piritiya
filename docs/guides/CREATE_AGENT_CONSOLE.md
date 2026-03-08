# Create Bedrock Agent - AWS Console Method

Since the `piritiya-developer` user doesn't have IAM permissions, create the agent using AWS Console.

## Quick Steps

### 1. Open AWS Console (us-east-1)
- Make sure you're in **us-east-1** region (top right)

### 2. Go to Bedrock → Agents → Create Agent

**Agent details:**
- Agent name: `PiritiyaAgent`
- Description: `AI agricultural advisor for Uttar Pradesh farmers`
- Agent resource role: `PiritiyaBedrockAgentRole`

**Instructions for the Agent:**
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

**Model:** Amazon Nova Pro (`amazon.nova-pro-v1:0`)

**Why Nova Pro?**
- No marketplace subscription required
- Included with Bedrock access
- Works well for agricultural advisory
- Supports multiple languages including Hindi

### 3. Add Action Groups

Click **Add Action Group** three times:

**Action Group 1: SoilMoistureActions**
- Name: `SoilMoistureActions`
- Description: `Fetch soil moisture data from NISAR satellite`
- Lambda function: `get-soil-moisture`
- Action group type: Define with function details
- Function: `getSoilMoisture`
- Description: `Get soil moisture data for a farmer`
- Parameters:
  - Name: `farmer_id`
  - Type: `string`
  - Description: `Unique identifier for the farmer`
  - Required: Yes

**Action Group 2: CropAdviceActions**
- Name: `CropAdviceActions`
- Description: `Get crop recommendations`
- Lambda function: `get-crop-advice`
- Action group type: Define with function details
- Function: `getCropAdvice`
- Description: `Get crop recommendations for a farmer`
- Parameters:
  - Name: `farmer_id`
  - Type: `string`
  - Description: `Unique identifier for the farmer`
  - Required: Yes

**Action Group 3: MarketPriceActions**
- Name: `MarketPriceActions`
- Description: `Get market prices for crops`
- Lambda function: `get-market-prices`
- Action group type: Define with function details
- Function: `getMarketPrices`
- Description: `Get current market prices`
- Parameters:
  - Name: `crop`
  - Type: `string`
  - Description: `Name of the crop (optional)`
  - Required: No

### 4. Create and Prepare

- Click **Create Agent**
- Click **Prepare** (this compiles the agent)

### 5. Create Alias

- Go to **Aliases** tab
- Click **Create alias**
- Name: `production`
- Click **Create**

### 6. Get IDs and Update .env

After creation, copy:
- Agent ID (from agent details page)
- Alias ID (from aliases tab)

Update your `.env` file:
```bash
AWS_REGION=us-east-1
BEDROCK_AGENT_ID=<your-agent-id>
BEDROCK_AGENT_ALIAS_ID=<your-alias-id>
```

### 7. Test

```bash
python3 scripts/test_bedrock_agent.py
```

Should work now!

## Troubleshooting

If you get permission errors when testing:
1. Make sure you're using us-east-1 region
2. Check that Lambda functions exist in us-east-1
3. Verify agent is in "Prepared" status

The agent creation takes about 5 minutes in the console.
