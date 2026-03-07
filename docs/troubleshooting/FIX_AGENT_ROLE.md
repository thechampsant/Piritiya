# Fix Bedrock Agent Role Permissions

## Problem
Agent role `AmazonBedrockExecutionRoleForAgents_KDMBM9YKV1` doesn't have permission to use inference profiles.

## Solution: Add Policy via AWS Console

### Step 1: Open IAM Console
1. Go to **AWS Console** (use your root/admin account)
2. Navigate to **IAM** → **Roles**
3. Search for: `AmazonBedrockExecutionRoleForAgents_KDMBM9YKV1`
4. Click on the role

### Step 2: Add Inline Policy
1. Click **Permissions** tab
2. Click **Add permissions** → **Create inline policy**
3. Click **JSON** tab
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:GetInferenceProfile",
        "bedrock:ListInferenceProfiles"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/*",
        "arn:aws:bedrock:ap-south-1:288761728613:inference-profile/*",
        "arn:aws:bedrock:ap-south-1::inference-profile/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": [
        "arn:aws:lambda:ap-south-1:288761728613:function:get-soil-moisture",
        "arn:aws:lambda:ap-south-1:288761728613:function:get-crop-advice",
        "arn:aws:lambda:ap-south-1:288761728613:function:get-market-prices"
      ]
    }
  ]
}
```

5. Click **Next**
6. Policy name: `BedrockAgentModelAccess`
7. Click **Create policy**

### Step 3: Update Agent Model
1. Go to **Amazon Bedrock** → **Agents** → **PiritiyaAgent**
2. Click **Edit**
3. Select model: **Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`)
4. Click **Save** (should work now!)
5. Click **Prepare**

### Step 4: Test Agent
1. Click **Test** button in agent page
2. Try: "What is the soil moisture for farmer F001?"
3. Should work!

## Alternative: Use Our Custom Role

Instead of fixing the AWS-managed role, you can switch to our custom role:

1. In agent edit page, change **Agent resource role** to: `PiritiyaBedrockAgentRole`
2. This role already has the right permissions
3. Save and Prepare

## Why This Happened

AWS created a managed role for your agent, but it doesn't include permissions for:
- Inference profiles (newer Bedrock feature)
- Lambda function invocation

Adding the inline policy fixes both issues.

## Quick Test After Fix

```bash
# Test if agent works
python3 scripts/test_bedrock_agent.py
```

Should see successful responses instead of access denied errors!
