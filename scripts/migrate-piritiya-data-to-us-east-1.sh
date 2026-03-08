#!/bin/bash
# Migrate piritiya-data from ap-south-1 to us-east-1
# S3 bucket region cannot be changed; this script copies data to a new bucket in us-east-1
# and then replaces the old bucket so the name "piritiya-data" exists in us-east-1.

set -e
SOURCE_BUCKET="piritiya-data"
SOURCE_REGION="ap-south-1"
TARGET_REGION="us-east-1"
TEMP_BUCKET="piritiya-data-migration-$(date +%s)"

echo "=============================================="
echo "Migrate piritiya-data to us-east-1"
echo "=============================================="
echo "Source: s3://${SOURCE_BUCKET} (${SOURCE_REGION})"
echo "Target region: ${TARGET_REGION}"
echo "Temp bucket: ${TEMP_BUCKET}"
echo ""
read -p "This will copy all objects, delete the old bucket, and create piritiya-data in us-east-1. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

echo "Step 1: Create temp bucket in ${TARGET_REGION}..."
aws s3 mb "s3://${TEMP_BUCKET}" --region "$TARGET_REGION"

echo "Step 2: Copy all objects from ${SOURCE_BUCKET} to ${TEMP_BUCKET} (cross-region)..."
aws s3 sync "s3://${SOURCE_BUCKET}" "s3://${TEMP_BUCKET}" --source-region "$SOURCE_REGION" --region "$TARGET_REGION"

echo "Step 3: Empty and delete old bucket ${SOURCE_BUCKET} (frees the name)..."
aws s3 rm "s3://${SOURCE_BUCKET}" --recursive --region "$SOURCE_REGION"
aws s3 rb "s3://${SOURCE_BUCKET}" --region "$SOURCE_REGION"

echo "Step 4: Create piritiya-data in us-east-1 (retrying until name is released by AWS)..."
for i in {1..20}; do
  if aws s3 mb "s3://${SOURCE_BUCKET}" --region "$TARGET_REGION" 2>/dev/null; then
    echo "  Bucket created."
    break
  fi
  if [ $i -eq 20 ]; then
    echo "ERROR: Could not create bucket after 5 minutes. AWS may still be releasing the name."
    echo "Your data is safe in s3://${TEMP_BUCKET}. Run: ./scripts/migrate-piritiya-data-recover.sh ${TEMP_BUCKET}"
    exit 1
  fi
  echo "  Name not yet available, waiting 15s (attempt $i/20)..."
  sleep 15
done

echo "Step 5: Copy data from temp bucket to piritiya-data..."
aws s3 sync "s3://${TEMP_BUCKET}" "s3://${SOURCE_BUCKET}" --region "$TARGET_REGION"

echo "Step 6: Remove temp bucket..."
aws s3 rm "s3://${TEMP_BUCKET}" --recursive --region "$TARGET_REGION"
aws s3 rb "s3://${TEMP_BUCKET}" --region "$TARGET_REGION"

echo ""
echo "Done. piritiya-data is now in us-east-1. No code changes needed (bucket name unchanged)."
