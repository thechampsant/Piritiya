#!/bin/bash

# Add ECR permissions to piritiya-developer IAM user
# Run this script to add the necessary ECR permissions for deployment

set -e

AWS_REGION="us-east-1"
IAM_USER="piritiya-developer"
POLICY_NAME="PiritiyaECRAccess"

echo "Adding ECR permissions to IAM user: $IAM_USER"

# Create inline policy for ECR access
aws iam put-user-policy \
  --user-name "$IAM_USER" \
  --policy-name "$POLICY_NAME" \
  --policy-document '{
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
  }'

echo "✅ ECR permissions added successfully!"
echo ""
echo "You can now run: ./scripts/deploy-production.sh"
