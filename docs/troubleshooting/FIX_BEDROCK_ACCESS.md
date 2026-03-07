# Fix Bedrock Access Denied Issue

## Problem
The IAM user `piritiya-developer` has `AmazonBedrockFullAccess` policy attached, but still getting "Access Denied" when invoking the agent.

## Solution: Add Inline Policy via AWS Console

### Step 1: Go to IAM Console
1. Open AWS Console
2. Go to **IAM** → **Users**
3. Click on **piritiya-developer**

### Step 2: Add Inline Policy
1. Click on **Permissions** tab
2. Click **Add permissions** → **Create inline policy**
3. Click on **JSON** tab
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock:Retrieve",
        "bedrock:RetrieveAndGenerate",
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Click **Next**
6. Policy name: `BedrockAgentInvokePolicy`
7. Click **Create policy**

### Step 3: Test Again
After adding the policy, run:
```bash
python3 scripts/test_bedrock_agent.py
```

## Alternative: Use AWS Console to Test Agent

If the above doesn't work immediately, you can test the agent directly in AWS Console:

1. Go to **Amazon Bedrock** → **Agents**
2. Click on **PiritiyaAgent**
3. Click **Test** button (top right)
4. Try these queries:
   - "What is the soil moisture for farmer F001?"
   - "Give me crop recommendations for farmer F001"
   - "What are the current market prices for wheat?"

This will work because the Console uses your root/admin credentials.

## Why This Happened

The `AmazonBedrockFullAccess` managed policy might not include the specific `bedrock:InvokeAgent` permission, or there might be a service control policy (SCP) or permission boundary restricting access.

## If Still Not Working

Check if there's a Permission Boundary or SCP:
1. In IAM user page, check if there's a **Permissions boundary** set
2. If yes, that boundary might be blocking Bedrock access
3. Contact your AWS administrator to update the boundary

Or simply use the AWS Console to test the agent - that's the quickest way to verify it works!
