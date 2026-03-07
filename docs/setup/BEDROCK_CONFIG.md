# How to Configure Bedrock Agent ID and Alias

This guide shows you exactly where to find your Bedrock Agent ID and Alias ID, and how to configure them in your application.

## Step 1: Find Your Agent ID

### Via AWS Console:

1. Go to **AWS Console** → **Amazon Bedrock**
2. Click **Agents** in the left sidebar
3. Click on your agent name (e.g., "PiritiyaAgent")
4. You'll see the **Agent ID** at the top of the page
   - Format: `XXXXXXXXXX` (10 alphanumeric characters)
   - Example: `A1B2C3D4E5`

### Via AWS CLI:

```bash
# List all agents
aws bedrock-agent list-agents --region ap-south-1

# Get specific agent details
aws bedrock-agent get-agent --agent-id YOUR_AGENT_ID --region ap-south-1
```

## Step 2: Find Your Agent Alias ID

### Via AWS Console:

1. In your agent page, click the **Aliases** tab
2. You'll see a list of aliases (e.g., "production", "v1", or "TSTALIASID")
3. Click on the alias name
4. The **Alias ID** is shown in the alias details
   - Format: `XXXXXXXXXX` (10 alphanumeric characters)
   - Example: `TSTALIASID` (test alias) or custom ID

**Note:** Every agent automatically gets a test alias called `TSTALIASID` that you can use for testing.

### Via AWS CLI:

```bash
# List all aliases for an agent
aws bedrock-agent list-agent-aliases \
  --agent-id YOUR_AGENT_ID \
  --region ap-south-1

# Get specific alias details
aws bedrock-agent get-agent-alias \
  --agent-id YOUR_AGENT_ID \
  --agent-alias-id YOUR_ALIAS_ID \
  --region ap-south-1
```

## Step 3: Configure in Your Application

### Option A: Using .env file (Recommended)

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and update these values:
```bash
# Bedrock Configuration
BEDROCK_AGENT_ID=A1B2C3D4E5          # Replace with your actual Agent ID
BEDROCK_AGENT_ALIAS_ID=TSTALIASID    # Replace with your actual Alias ID
```

3. Your `.env` file should look like:
```bash
# AWS Configuration
AWS_REGION=ap-south-1

# Bedrock Configuration
BEDROCK_AGENT_ID=A1B2C3D4E5
BEDROCK_AGENT_ALIAS_ID=TSTALIASID
KNOWLEDGE_BASE_ID=your-kb-id-here

# ... other configurations
```

### Option B: Using Environment Variables

Export directly in your terminal:
```bash
export BEDROCK_AGENT_ID=A1B2C3D4E5
export BEDROCK_AGENT_ALIAS_ID=TSTALIASID
export AWS_REGION=ap-south-1
```

### Option C: Pass as Command Line Arguments

For testing scripts:
```bash
python3 scripts/test_bedrock_agent.py A1B2C3D4E5 TSTALIASID
```

## Step 4: Verify Configuration

### Test with Python:

```python
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Verify values
agent_id = os.getenv('BEDROCK_AGENT_ID')
alias_id = os.getenv('BEDROCK_AGENT_ALIAS_ID')

print(f"Agent ID: {agent_id}")
print(f"Alias ID: {alias_id}")
```

### Test with the test script:

```bash
# Using .env file
python3 scripts/test_bedrock_agent.py $(grep BEDROCK_AGENT_ID .env | cut -d '=' -f2) $(grep BEDROCK_AGENT_ALIAS_ID .env | cut -d '=' -f2)

# Or directly
python3 scripts/test_bedrock_agent.py YOUR_AGENT_ID YOUR_ALIAS_ID
```

## Common Issues

### "Agent not found" error
- Double-check the Agent ID is correct
- Ensure you're using the correct AWS region (ap-south-1)
- Verify the agent exists: `aws bedrock-agent get-agent --agent-id YOUR_AGENT_ID --region ap-south-1`

### "Alias not found" error
- Verify the Alias ID is correct
- Check if alias exists: `aws bedrock-agent list-agent-aliases --agent-id YOUR_AGENT_ID --region ap-south-1`
- You can use `TSTALIASID` for testing (automatically created)

### "Access denied" error
- Ensure your AWS credentials have Bedrock permissions
- Check IAM policy includes `bedrock:InvokeAgent` permission

## Example Configuration Files

### Complete .env file:
```bash
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Bedrock Configuration
BEDROCK_AGENT_ID=A1B2C3D4E5
BEDROCK_AGENT_ALIAS_ID=TSTALIASID
KNOWLEDGE_BASE_ID=KB123456

# S3 Buckets
S3_BUCKET_DATA=piritiya-data
S3_BUCKET_KNOWLEDGE_BASE=piritiya-knowledge-base

# DynamoDB Tables
DYNAMODB_TABLE_FARMERS=Farmers
DYNAMODB_TABLE_NISAR=NISARData
DYNAMODB_TABLE_CROP_RECOMMENDATIONS=CropRecommendations
DYNAMODB_TABLE_CONSULTATIONS=Consultations

# Lambda Functions
LAMBDA_SOIL_MOISTURE=get-soil-moisture
LAMBDA_CROP_ADVICE=get-crop-advice
LAMBDA_MARKET_PRICES=get-market-prices
```

### Python usage example:
```python
import os
import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Bedrock client
bedrock = boto3.client(
    'bedrock-agent-runtime',
    region_name=os.getenv('AWS_REGION')
)

# Invoke agent
response = bedrock.invoke_agent(
    agentId=os.getenv('BEDROCK_AGENT_ID'),
    agentAliasId=os.getenv('BEDROCK_AGENT_ALIAS_ID'),
    sessionId='session-123',
    inputText='What is the soil moisture for farmer F001?'
)
```

## Quick Reference

| Configuration | Where to Find | Example Value |
|--------------|---------------|---------------|
| Agent ID | Bedrock Console → Agents → Your Agent | `A1B2C3D4E5` |
| Alias ID | Bedrock Console → Agents → Your Agent → Aliases | `TSTALIASID` |
| Region | Your AWS region | `ap-south-1` |

## Next Steps

1. ✅ Configure Agent ID and Alias ID in `.env`
2. Test with: `python3 scripts/test_bedrock_agent.py`
3. Integrate into your FastAPI backend
4. Build frontend to interact with the agent

## Resources

- [Bedrock Agents Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Bedrock Agent Runtime API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_InvokeAgent.html)
- [AWS CLI Bedrock Commands](https://docs.aws.amazon.com/cli/latest/reference/bedrock-agent/)
