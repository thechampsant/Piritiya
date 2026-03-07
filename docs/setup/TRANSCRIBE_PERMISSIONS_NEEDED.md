# Amazon Transcribe Permissions Required

The IAM user `piritiya-developer` (and the Lambda execution role when deployed) needs Amazon Transcribe permissions so the `/speech/transcribe` endpoint can run transcription jobs.

---

## Error You Saw

```
User: arn:aws:iam::288761728613:user/piritiya-developer is not authorized to perform: transcribe:StartTranscriptionJob on resource: arn:aws:transcribe:us-east-1:288761728613:transcription-job/...
```

---

## Who Must Add This Policy

**The `piritiya-developer` user cannot attach policies to itself.** Use **root** or an IAM user with IAM permissions.

---

## Quick Fix (AWS CLI) — run as admin

```bash
cd /path/to/Piritiya
aws iam put-user-policy \
  --user-name piritiya-developer \
  --policy-name PiritiyaTranscribeAccess \
  --policy-document file://docs/setup/TRANSCRIBE_POLICY.json
```

Then retry voice input (backend will need Transcribe + S3 access to `AWS_TRANSCRIBE_BUCKET`).

---

## Manual Fix (AWS Console)

1. Sign in as **root** or an IAM admin.
2. IAM → Users → **piritiya-developer** → Add permissions → Create inline policy.
3. JSON tab → paste the contents of [docs/setup/TRANSCRIBE_POLICY.json](TRANSCRIBE_POLICY.json).
4. Name: **PiritiyaTranscribeAccess** → Create policy.

---

## Verify (after an admin attaches the policy)

Confirm the policy is on the user and which identity your backend uses:

```bash
# See which identity your current AWS CLI/backend uses
aws sts get-caller-identity

# List inline policies on piritiya-developer (run as admin)
aws iam list-user-policies --user-name piritiya-developer
```

If **PiritiyaTranscribeAccess** is not in the list, an admin has not attached it yet. The `piritiya-developer` user cannot add it themselves.

---

## S3 for Transcribe

The backend uploads audio to and reads results from the bucket in `AWS_TRANSCRIBE_BUCKET` (e.g. `piritiya-transcribe`). Ensure `piritiya-developer` (and the Lambda role in production) can:

- `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on that bucket.

If the user already has **AmazonS3FullAccess** or a bucket-specific policy, no change is needed. Otherwise add S3 access for that bucket.
