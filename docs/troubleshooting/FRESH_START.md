# Piritiya - Fresh Start (us-east-1)

## Current Status
✅ Bedrock Agent working in us-east-1 with Nova 2 Sonic
✅ DynamoDB tables exist in us-east-1
✅ Mock data loaded in us-east-1
❌ Lambda functions need to be deployed to us-east-1
❌ Agent needs Lambda ARNs updated

## Step-by-Step Setup

### Step 1: Deploy Lambda Functions to us-east-1
```bash
export AWS_REGION=us-east-1
./lambda_functions/deploy.sh
```

### Step 2: Get Lambda ARNs
```bash
aws lambda list-functions --region us-east-1 --query 'Functions[?starts_with(FunctionName, `get-`)].{Name:FunctionName, Arn:FunctionArn}' --output table
```

### Step 3: Update Bedrock Agent Action Groups

Go to AWS Console → Bedrock → Agents → Your Agent → Edit

For each action group, update the Lambda ARN to the us-east-1 ARN from Step 2.

### Step 4: Update .env File
```bash
AWS_REGION=us-east-1
BEDROCK_AGENT_ID=<your-agent-id>
BEDROCK_AGENT_ALIAS_ID=<your-alias-id>
```

### Step 5: Test Agent
```bash
python3 scripts/test_bedrock_agent.py
```

### Step 6: Start FastAPI Backend
```bash
cd backend
python3 main.py
```

### Step 7: Test Chatbot
```bash
python3 backend/test_chatbot.py
```

## Quick Deploy Script

Run this to deploy everything:
```bash
./deploy_us_east_1.sh
```

Then update your agent's Lambda ARNs in the console.
