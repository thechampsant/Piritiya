# CloudFront Permissions Required

The IAM user `piritiya-developer` needs CloudFront permissions so the deploy script can create the distribution (or list it after you create it in the console).

---

## Who Must Add This Policy

**The `piritiya-developer` user cannot attach policies to itself.** You must use one of:

- **AWS root account** (sign in as root in the console), or  
- **Another IAM user/role** that has IAM permissions (e.g. `iam:PutUserPolicy`).

If you only have `piritiya-developer` credentials, ask your account owner/admin to add the policy using the steps below, or use the **Alternative** (create CloudFront in console and paste domain when the script asks).

---

## Error You May See

```
User: arn:aws:iam::288761728613:user/piritiya-developer is not authorized to perform: cloudfront:CreateDistribution on resource: arn:aws:cloudfront::288761728613:distribution/*
```

---

## Who Must Add This Policy

**The `piritiya-developer` user cannot attach policies to itself.** Use **root** or an IAM user with IAM permissions.

---

## Quick Fix (AWS CLI) — must run as admin (not as piritiya-developer)

Use credentials that have IAM permissions (root or an IAM admin), then:

```bash
cd /path/to/Piritiya
aws iam put-user-policy \
  --user-name piritiya-developer \
  --policy-name PiritiyaCloudFrontAccess \
  --policy-document file://docs/setup/CLOUDFRONT_POLICY.json
```

Then re-run: `./scripts/deploy-production.sh frontend`

---

## Manual Fix (AWS Console)

1. Sign in as **root** or an IAM admin.
2. IAM → Users → **piritiya-developer** → Add permissions → Create inline policy.
3. JSON tab → paste the contents of [docs/setup/CLOUDFRONT_POLICY.json](CLOUDFRONT_POLICY.json).
4. Name: **PiritiyaCloudFrontAccess** → Create policy.

---

## Alternative: Create CloudFront in Console, Then Paste Domain

If you don’t add CloudFront permissions:

1. Create the distribution manually in **CloudFront → Create distribution** (Origin: `piritiya-app-288761728613.s3.us-east-1.amazonaws.com`, default root: `index.html`, Comment: `Piritiya PWA Distribution`).
2. When the deploy script says “CloudFront distribution not found”, it will prompt: **Enter your CloudFront domain (e.g. dxxxx.cloudfront.net)**.
3. Paste the domain from the CloudFront console (e.g. `d1234abcd.cloudfront.net`). The script will continue and update Lambda CORS and save the URL.
