# Final Bedrock Agent Fix - Step by Step

## Current Status
- ✅ Agent created: PiritiyaAgent
- ✅ Agent prepared successfully
- ✅ Model: Claude 3 Haiku
- ✅ Role: PiritiyaBedrockAgentRole
- ❌ Testing fails: Access denied for user

## The Real Problem
The `piritiya-developer` IAM user doesn't have permission to INVOKE the agent. The agent itself is fine.

## Solution: Add User Permission via Console

### Step 1: Add Bedrock Invoke Permission to User
1. AWS Console → **IAM** → **Users** → **piritiya-developer**
2. **Permissions** tab → **Add permissions** → **Create inline policy**
3. Click **JSON** tab
4. Paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock:InvokeModel",
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Policy name: `BedrockInvokeAccess`
6. Click **Create policy**

### Step 2: Test the Agent

After adding the policy, test with:

```bash
python3 scripts/test_bedrock_agent.py
```

Should work now!

## Alternative: Test in Console (Works Immediately)

If you want to verify the agent works RIGHT NOW:

1. AWS Console → **Bedrock** → **Agents** → **PiritiyaAgent**
2. Click **Test** button
3. Try: "What is the soil moisture for farmer UP-LUCKNOW-MALIHABAD-00001?"

This works because the console uses your root credentials which have full access.

## Integration with FastAPI

Once the agent works, integrate it into your FastAPI backend:

```python
# Add to backend/main.py

import boto3
import json

bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='ap-south-1')

@app.post("/chat")
def chat_with_agent(message: str, session_id: str = None):
    """Chat with Bedrock Agent"""
    if not session_id:
        session_id = f"session-{datetime.now().timestamp()}"
    
    response = bedrock_agent.invoke_agent(
        agentId=os.getenv('BEDROCK_AGENT_ID'),
        agentAliasId=os.getenv('BEDROCK_AGENT_ALIAS_ID'),
        sessionId=session_id,
        inputText=message
    )
    
    # Process streaming response
    result = ""
    for event in response['completion']:
        if 'chunk' in event:
            chunk = event['chunk']
            if 'bytes' in chunk:
                result += chunk['bytes'].decode('utf-8')
    
    return {"response": result, "session_id": session_id}
```

## Why This Will Work

1. The agent is properly configured (we saw "successfully prepared")
2. The agent role has Lambda permissions (we added them)
3. The agent role has Bedrock model permissions (we added them)
4. Only missing piece: USER permission to invoke the agent

Adding that one policy will make everything work!
