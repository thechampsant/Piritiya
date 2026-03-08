# AWS Setup Steps for Piritiya

This guide covers the AWS resources and configuration needed for Piritiya (chat, Lambda, DynamoDB, Bedrock, and voice: Transcribe + Polly).

---

## Prerequisites

- AWS account
- AWS CLI installed and configured (optional, for scripting)
- Backend runs with credentials (e.g. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) or an IAM role

---

## 1. IAM User or Role

Create an IAM user (or role) that your backend (FastAPI) uses.

### Required permissions

Attach a policy (inline or managed) that allows:

| Service   | Permission                                      | Purpose                    |
| --------- | ----------------------------------------------- | -------------------------- |
| Lambda    | `lambda:InvokeFunction`                         | Invoke soil/crop/market Lambdas |
| DynamoDB  | `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:Scan`, `dynamodb:Query`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:BatchGetItem` | Farmers, SoilMoisture, CropRecommendations, Consultations |
| Bedrock   | `bedrock:InvokeAgent`                           | Chat endpoint via Bedrock Agent Runtime |
| Transcribe| `transcribe:StartTranscriptionJob`, `transcribe:GetTranscriptionJob` | Speech-to-text (batch processing) |
| S3        | `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` | Transcribe input/output bucket |
| Polly     | `polly:SynthesizeSpeech`                        | Text-to-speech             |

### Example policy (replace REGION, ACCOUNT_ID, bucket and table names as needed)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": [
        "arn:aws:lambda:REGION:ACCOUNT_ID:function:get-soil-moisture",
        "arn:aws:lambda:REGION:ACCOUNT_ID:function:get-crop-advice",
        "arn:aws:lambda:REGION:ACCOUNT_ID:function:get-market-prices"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Scan",
        "dynamodb:Query", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:BatchGetItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Farmers",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/SoilMoisture",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/CropRecommendations",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Consultations"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeAgent"],
      "Resource": "arn:aws:bedrock:REGION:ACCOUNT_ID:agent/*"
    },
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
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR-TRANSCRIBE-BUCKET/*"
    },
    {
      "Effect": "Allow",
      "Action": ["polly:SynthesizeSpeech"],
      "Resource": "*"
    }
  ]
}
```

### Credentials

- For local/dev: create access keys for the IAM user and set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` in `.env`.
- For production: prefer an IAM role attached to the compute (e.g. Lambda, ECS) and no long-lived keys.

---

## 2. DynamoDB Tables

Create these tables in the same region as your backend (e.g. `us-east-1` or `ap-south-1`).

| Table name           | Partition key (example) | Sort key (optional) |
| -------------------- | ----------------------- | -------------------- |
| Farmers              | farmer_id (String)      | —                    |
| SoilMoisture         | (match Lambda contract) | —                    |
| CropRecommendations  | (match Lambda contract) | —                    |
| Consultations        | (e.g. session_id or farmer_id) | —           |

Use the AWS Console (DynamoDB → Tables → Create) or Infrastructure as Code. Ensure key names and types match what your Lambda functions and backend code use.

---

## 3. Lambda Functions

Deploy and maintain these functions in the same region:

- **get-soil-moisture** – inputs/outputs as defined in your backend (e.g. `farmer_id` → soil data).
- **get-crop-advice** – e.g. `farmer_id`, optional `soil_moisture` → crop recommendations.
- **get-market-prices** – e.g. optional `crop`, `district` → market prices.

Ensure the IAM user/role from step 1 has `lambda:InvokeFunction` on these three function ARNs.

---

## 4. Bedrock Agent

1. In AWS Console go to **Amazon Bedrock** → **Agents** → **Create agent**.
2. Configure the agent (e.g. Claude model, instructions, action groups).
3. Add action groups that call your Lambda functions (get-soil-moisture, get-crop-advice, get-market-prices) so the agent can use them during conversation.
4. Create an **alias** (e.g. default or "live") and note:
   - **Agent ID**
   - **Alias ID**
5. In backend `.env` set:
   - `BEDROCK_AGENT_ID=<agent-id>`
   - `BEDROCK_AGENT_ALIAS_ID=<alias-id>`

See `docs/setup/BEDROCK_SETUP.md` or `docs/guides/CREATE_AGENT_CONSOLE.md` in this repo for detailed steps.

---

## 5. S3 Bucket for Transcribe (Speech-to-Text)

Required only if you use the **/speech/transcribe** endpoint.

1. In AWS Console go to **S3** → **Create bucket**.
2. Choose a name (e.g. `piritiya-transcribe`) and the same region as your backend.
3. Set bucket permissions so the IAM user/role from step 1 can:
   - `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on this bucket (and prefix if you use one).
4. In backend `.env` set:
   - `AWS_TRANSCRIBE_BUCKET=piritiya-transcribe` (or your bucket name).

If this variable is not set, the backend will return 503 for `/speech/transcribe`; the app can still use Web Speech API for speech-to-text.

---

## 6. Polly (Text-to-Speech)

- No separate AWS resource to create.
- Ensure the IAM user/role from step 1 has **`polly:SynthesizeSpeech`**.
- Use a **region where Polly is available** (e.g. `us-east-1`). Check AWS docs for Kajal/Aditi voice availability per region.

---

## 7. Region and .env Summary

Use a **single region** for all services (e.g. `us-east-1` or `ap-south-1`).

### Backend .env (minimum)

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>

BEDROCK_AGENT_ID=<agent-id>
BEDROCK_AGENT_ALIAS_ID=<alias-id>

# Optional – only for /speech/transcribe
AWS_TRANSCRIBE_BUCKET=piritiya-transcribe
```

---

## Checklist

- [ ] 1. IAM user or role with permissions for Lambda, DynamoDB, Bedrock, Transcribe, S3 (Transcribe bucket), Polly
- [ ] 2. DynamoDB tables: Farmers, SoilMoisture, CropRecommendations, Consultations
- [ ] 3. Lambda functions: get-soil-moisture, get-crop-advice, get-market-prices
- [ ] 4. Bedrock Agent + alias; BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID in .env
- [ ] 5. S3 bucket for Transcribe; AWS_TRANSCRIBE_BUCKET in .env (if using Transcribe)
- [ ] 6. Polly permission (polly:SynthesizeSpeech) in IAM
- [ ] 7. Backend .env: AWS_REGION, credentials, Bedrock IDs, optional AWS_TRANSCRIBE_BUCKET
