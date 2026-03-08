# Add ECR Permissions - Manual Steps

Your IAM user `piritiya-developer` needs ECR permissions but cannot modify its own permissions. You need to add them through the AWS Console.

---

## Option 1: Attach Managed Policy (Easiest)

1. Go to **AWS Console** → **IAM** → **Users** → **piritiya-developer**
2. Click **Add permissions** → **Attach policies directly**
3. Search for: `AmazonEC2ContainerRegistryFullAccess`
4. Check the box next to it
5. Click **Add permissions**

✅ Done! This gives full ECR access.

---

## Option 2: Add Inline Policy (More Restrictive)

1. Go to **AWS Console** → **IAM** → **Users** → **piritiya-developer**
2. Click **Permissions** tab
3. Click **Add inline policy**
4. Click **JSON** tab
5. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:CreateRepository",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages"
      ],
      "Resource": "*"
    }
  ]
}
```

6. Click **Review policy**
7. Name it: `PiritiyaECRAccess`
8. Click **Create policy**

✅ Done! This gives only the ECR permissions needed for deployment.

---

## Verify Permissions

After adding permissions, verify with:

```bash
aws ecr describe-repositories --region us-east-1
```

If this works without errors, you're good to go!

---

## Continue Deployment

After adding ECR permissions, run:

```bash
./scripts/deploy-production.sh
```

The deployment will continue from where it left off.

---

## Why This Happened

The IAM user `piritiya-developer` has these policies:
- ✅ AmazonDynamoDBFullAccess
- ✅ AmazonS3FullAccess
- ✅ AmazonBedrockFullAccess
- ✅ AWSLambda_FullAccess
- ❌ **Missing:** ECR access

ECR (Elastic Container Registry) is needed to store the Lambda container image.

---

**Recommended:** Use Option 1 (managed policy) for simplicity.
