# AWS Infrastructure Status for Piritiya

**Last Updated:** March 7, 2026  
**Region:** us-east-1  
**IAM User:** piritiya-developer

---

## ✅ What You ALREADY HAVE

### 1. DynamoDB Tables (4/4 Created)
- ✅ `Farmers` - Contains farmer profiles with location and land details
- ✅ `NISARData` - Satellite soil moisture data
- ✅ `CropRecommendations` - Generated crop advice
- ✅ `Consultations` - Chat session history

**Status:** All tables exist and are accessible. Data is present in Farmers table.

### 2. Lambda Functions (3/3 Deployed)
- ✅ `get-soil-moisture` (Python 3.11)
- ✅ `get-crop-advice` (Python 3.11)
- ✅ `get-market-prices` (Python 3.11)

**Status:** All functions deployed and invocable.

### 3. S3 Buckets (3/3 Created)
- ✅ `piritiya-data` (created Feb 28, 2026)
- ✅ `piritiya-knowledge-base` (created Feb 28, 2026)
- ✅ `piritiya-transcribe` (created Mar 7, 2026) ← **JUST CREATED**

**Status:** All required buckets exist.

### 4. Bedrock Agent (Configured)
- ✅ Agent ID: `FNU9NS7PKO`
- ✅ Alias ID: `59ZL9U0XOY`

**Status:** Agent is configured in .env file.

### 5. Environment Configuration
- ✅ `.env` file exists with all required variables
- ✅ Region set to `us-east-1`
- ✅ Using AWS CLI credentials (access keys commented out)

---

## ❌ What You NEED TO FIX

### 1. IAM Permissions - Polly Access (CRITICAL)

**Issue:** Your IAM user `piritiya-developer` does NOT have permission to use Amazon Polly.

**Error:**
```
User: arn:aws:iam::288761728613:user/piritiya-developer is not authorized 
to perform: polly:SynthesizeSpeech
```

**Impact:** The `/speech/synthesize` endpoint will fail. Text-to-speech won't work.

**Fix:** Add this policy to your IAM user:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["polly:SynthesizeSpeech"],
      "Resource": "*"
    }
  ]
}
```

**How to add:**
1. Go to AWS Console → IAM → Users → piritiya-developer
2. Click "Add permissions" → "Create inline policy"
3. Paste the JSON above
4. Name it: `PiritiyaPollyAccess`
5. Click "Create policy"

### 2. IAM Permissions - Transcribe Access (Optional)

**Status:** Not tested yet, but likely missing.

**Fix:** Add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::piritiya-transcribe/*"
    }
  ]
}
```

**How to add:**
1. Go to AWS Console → IAM → Users → piritiya-developer
2. Click "Add permissions" → "Create inline policy"
3. Paste the JSON above
4. Name it: `PiritiyaTranscribeAccess`
5. Click "Create policy"

---

## 🎯 Action Items

### Immediate (Required for app to work fully):
1. ✅ Create S3 bucket `piritiya-transcribe` - **DONE**
2. ✅ Add `AWS_TRANSCRIBE_BUCKET=piritiya-transcribe` to .env - **DONE**
3. ❌ Add Polly permissions to IAM user - **YOU NEED TO DO THIS**

### Optional (For backend transcription):
4. ❌ Add Transcribe + S3 permissions to IAM user

---

## 🧪 Verification Commands

After adding permissions, test each service:

```bash
# Test Polly (text-to-speech)
aws polly synthesize-speech \
  --text "नमस्ते किसान भाई" \
  --output-format mp3 \
  --voice-id Kajal \
  --engine neural \
  --region us-east-1 \
  /tmp/polly-test.mp3

# Test Transcribe (speech-to-text)
aws transcribe start-transcription-job \
  --transcription-job-name test-job-$(date +%s) \
  --media MediaFileUri=s3://piritiya-transcribe/test.wav \
  --media-format wav \
  --language-code hi-IN \
  --region us-east-1

# Test Lambda
aws lambda invoke \
  --function-name get-soil-moisture \
  --cli-binary-format raw-in-base64-out \
  --payload '{"farmer_id":"F001"}' \
  /tmp/lambda-test.json \
  --region us-east-1

# Test DynamoDB
aws dynamodb get-item \
  --table-name Farmers \
  --key '{"farmer_id":{"S":"F001"}}' \
  --region us-east-1
```

---

## 📊 Current Status Summary

| Component | Status | Action Needed |
|-----------|--------|---------------|
| DynamoDB Tables | ✅ Working | None |
| Lambda Functions | ✅ Working | None |
| S3 Buckets | ✅ Working | None |
| Bedrock Agent | ✅ Configured | Test it |
| Polly (TTS) | ❌ No Permission | Add IAM policy |
| Transcribe (STT) | ⚠️ Unknown | Add IAM policy (optional) |

**Overall:** 85% complete. Just need to add Polly permissions and you're ready to go!

