# Bedrock Model Selection Guide for ap-south-1

## Problem
Getting "request rate too high" error with Nova Pro when creating agent.

## Recommended Models (Best to Worst)

### 1. Mistral 7B Instruct (BEST FOR STARTING)
- **Model ID:** `mistral.mistral-7b-instruct-v0:2`
- **Why:** Lightweight, fast, good quotas, widely available
- **Cost:** Low
- **Good for:** Testing, development, production with moderate load
- **Quota:** Usually high (10+ requests/second)

### 2. Mistral Large 3
- **Model ID:** `mistral.mistral-large-3-675b-instruct`
- **Why:** More powerful, good reasoning, better quotas than Claude
- **Cost:** Medium
- **Good for:** Production with complex queries
- **Quota:** Moderate (5+ requests/second)

### 3. Claude 3 Haiku
- **Model ID:** `anthropic.claude-3-haiku-20240307-v1:0`
- **Why:** Fast, cheap, good for simple tasks
- **Cost:** Low
- **Good for:** High-volume simple queries
- **Quota:** Good (varies by account)

### 4. Claude 3 Sonnet
- **Model ID:** `anthropic.claude-3-sonnet-20240229-v1:0`
- **Why:** Balanced performance and cost
- **Cost:** Medium
- **Good for:** Production with complex reasoning
- **Quota:** Moderate (may need quota increase)

### 5. Amazon Nova Lite (Alternative to Nova Pro)
- **Model ID:** `amazon.nova-lite-v1:0`
- **Why:** Lighter version, better quotas
- **Cost:** Low
- **Good for:** Testing Amazon models
- **Quota:** Better than Nova Pro

## How to Change Model in Bedrock Agent

### Via AWS Console:

1. Go to **Amazon Bedrock** → **Agents**
2. Click on **PiritiyaAgent**
3. Click **Edit** (top right)
4. In the **Model** section, select one of these:
   - **Mistral 7B Instruct** (recommended for starting)
   - **Mistral Large 3** (if you need more power)
   - **Claude 3 Haiku** (if you prefer Claude)
5. Click **Save**
6. Click **Prepare** to redeploy the agent

### Model Selection Tips:

**For Testing/Development:**
- Use **Mistral 7B Instruct** - fast, cheap, high quotas

**For Production:**
- Start with **Mistral 7B Instruct**
- Upgrade to **Mistral Large 3** or **Claude 3 Sonnet** if needed

**Avoid for Now:**
- Nova Pro (rate limits)
- Claude Opus (expensive, lower quotas)
- Claude Sonnet 4.x (newer, may have lower quotas)

## Request Quota Increase (If Needed)

If you still hit rate limits:

1. Go to **AWS Console** → **Service Quotas**
2. Search for "Bedrock"
3. Find the model quota (e.g., "Mistral 7B requests per minute")
4. Click **Request quota increase**
5. Request higher limit (e.g., 100 requests/minute)
6. Usually approved within 24 hours

## Testing Model Availability

Test if a model works before using in agent:

```bash
# Test Mistral 7B
aws bedrock-runtime invoke-model \
  --model-id mistral.mistral-7b-instruct-v0:2 \
  --body '{"prompt":"Hello","max_tokens":50}' \
  --region ap-south-1 \
  /tmp/output.json

# Test Claude 3 Haiku
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","messages":[{"role":"user","content":"Hello"}],"max_tokens":50}' \
  --region ap-south-1 \
  /tmp/output.json
```

## Recommended: Start with Mistral 7B

For Piritiya, I recommend starting with **Mistral 7B Instruct**:

1. Good enough for agricultural advice
2. Fast responses
3. High quotas (unlikely to hit rate limits)
4. Low cost
5. Supports Hindi (important for your use case)

You can always upgrade to a more powerful model later if needed.

## Model Comparison for Piritiya

| Model | Speed | Cost | Quota | Hindi Support | Recommendation |
|-------|-------|------|-------|---------------|----------------|
| Mistral 7B | ⚡⚡⚡ | 💰 | ✅✅✅ | ✅ | ⭐⭐⭐ Best for starting |
| Mistral Large 3 | ⚡⚡ | 💰💰 | ✅✅ | ✅ | ⭐⭐ Good for production |
| Claude 3 Haiku | ⚡⚡⚡ | 💰 | ✅✅ | ✅ | ⭐⭐ Alternative |
| Claude 3 Sonnet | ⚡⚡ | 💰💰 | ✅ | ✅ | ⭐ If you need Claude |
| Nova Pro | ⚡⚡ | 💰💰 | ❌ | ✅ | ❌ Rate limit issues |

## Next Steps

1. Change agent model to **Mistral 7B Instruct**
2. Click **Prepare** to redeploy
3. Test the agent
4. If it works well, keep it
5. If you need more power, upgrade to Mistral Large 3

This should solve your rate limiting issue!
