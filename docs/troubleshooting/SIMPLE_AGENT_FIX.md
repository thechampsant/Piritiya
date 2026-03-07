# Simple Bedrock Agent Fix (Updated for New AWS Model Access)

## Good News!
AWS now automatically enables models on first use. No manual model access setup needed!

## The Only Issue: User Permissions

Your `piritiya-developer` user needs permission to invoke the Bedrock agent.

## Fix (2 Steps via AWS Console)

### Step 1: Add Bedrock Permission to User

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
        "bedrock:Retrieve"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Policy name: `BedrockInvokeAccess`
6. Click **Create policy**

### Step 2: Test

```bash
python3 scripts/test_bedrock_agent.py
```

Should work immediately!

## Or Test in Console First (Fastest)

To verify the agent works RIGHT NOW:

1. AWS Console → **Bedrock** → **Agents** → **PiritiyaAgent**
2. Click **Test** button (top right)
3. Type: "What is the soil moisture for farmer UP-LUCKNOW-MALIHABAD-00001?"
4. Should get a response!

The console test uses your root credentials, so it will work. This proves the agent is configured correctly.

## After It Works

Integrate into your FastAPI backend for the chatbot interface:

```python
# Add to backend/main.py

@app.post("/chat")
async def chat(message: str, session_id: str = None):
    """Chatbot endpoint using Bedrock Agent"""
    import boto3
    from datetime import datetime
    
    if not session_id:
        session_id = f"session-{int(datetime.now().timestamp())}"
    
    bedrock = boto3.client('bedrock-agent-runtime', region_name='ap-south-1')
    
    response = bedrock.invoke_agent(
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
    
    return {
        "response": result,
        "session_id": session_id
    }
```

Then your chatbot frontend can call: `POST /chat` with the user's message!

## That's It!

Just add that one IAM policy and you're done. The agent is already configured and working.
