#!/bin/bash
# Recovery: create piritiya-data in us-east-1 and copy from a migration temp bucket.
# Use this if the main migration script failed at "Create piritiya-data" (name not yet released).
# Usage: ./scripts/migrate-piritiya-data-recover.sh <temp-bucket-name>
# Example: ./scripts/migrate-piritiya-data-recover.sh piritiya-data-migration-1772925035

set -e
TARGET_BUCKET="piritiya-data"
TARGET_REGION="us-east-1"
TEMP_BUCKET="${1:?Usage: $0 <temp-bucket-name>}"

echo "=============================================="
echo "Recover: create piritiya-data and copy from temp"
echo "=============================================="
echo "Temp bucket: s3://${TEMP_BUCKET}"
echo "Target: s3://${TARGET_BUCKET} (${TARGET_REGION})"
echo ""

echo "Step 1: Create piritiya-data in ${TARGET_REGION} (retrying until name is available)..."
for i in {1..20}; do
  if aws s3 mb "s3://${TARGET_BUCKET}" --region "$TARGET_REGION" 2>/dev/null; then
    echo "  Bucket created."
    break
  fi
  if [ $i -eq 20 ]; then
    echo "ERROR: Could not create bucket after 5 minutes. Try again later."
    exit 1
  fi
  echo "  Waiting 15s (attempt $i/20)..."
  sleep 15
done

echo "Step 2: Copy data from ${TEMP_BUCKET} to ${TARGET_BUCKET}..."
aws s3 sync "s3://${TEMP_BUCKET}" "s3://${TARGET_BUCKET}" --region "$TARGET_REGION"

echo "Step 3: Remove temp bucket..."
aws s3 rm "s3://${TEMP_BUCKET}" --recursive --region "$TARGET_REGION"
aws s3 rb "s3://${TEMP_BUCKET}" --region "$TARGET_REGION"

echo ""
echo "Done. piritiya-data is now in us-east-1 with your data."
