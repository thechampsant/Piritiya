# ECR Permissions Required

Your IAM user `piritiya-developer` needs ECR (Elastic Container Registry) permissions to deploy the backend Lambda container.

---

## Quick Fix (Automated)

Run this script to add ECR permissions:

```bash
./scripts/add-ecr-permissions.sh
```

This will add an inline policy called `PiritiyaECRAccess` to your IAM user.

---

## Manual Fix (AWS Console)

If you prefer to add permissions manually:

1. Go to **IAM Console** → **Users** → **piritiya-developer**
2. Click **Add permissions** → **Attach policies directly**
3. Search for and attach: **AmazonEC2ContainerRegistryFullAccess**

OR add an inline policy:

1. Go to **IAM Console** → **Users** → **piritiya-developer**
2. Click **Add inline policy**
3. Use JSON editor and paste:

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

4. Name it: `PiritiyaECRAccess`
5. Click **Create policy**

---

## Why ECR is Needed

ECR (Elastic Container Registry) is AWS's Docker registry service. We need it to:
- Store the backend Lambda container image
- Version and manage container images
- Deploy Lambda functions using container images

---

## After Adding Permissions

Run the deployment script again:

```bash
./scripts/deploy-production.sh
```

---

## Verification

After adding permissions, verify with:

```bash
# This should work without errors
aws ecr describe-repositories --region us-east-1
```

If you see a list of repositories (or empty list), permissions are working!

---

**Next Step:** Add ECR permissions, then run `./scripts/deploy-production.sh`
