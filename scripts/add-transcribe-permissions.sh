#!/bin/bash

# Add Transcribe permissions to piritiya-developer IAM user.
# Must be run with credentials that have IAM permissions (root or admin).
# The piritiya-developer user cannot attach policies to itself.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
POLICY_JSON="$PROJECT_ROOT/docs/setup/TRANSCRIBE_POLICY.json"
IAM_USER="piritiya-developer"
POLICY_NAME="PiritiyaTranscribeAccess"

if [ ! -f "$POLICY_JSON" ]; then
  echo "Policy file not found: $POLICY_JSON"
  exit 1
fi

echo "Adding Transcribe permissions to IAM user: $IAM_USER"
echo "(This requires credentials with IAM permissions, e.g. root or admin.)"
echo ""

if ! aws iam put-user-policy \
  --user-name "$IAM_USER" \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://$POLICY_JSON" 2>&1; then
  echo ""
  echo "Failed. The piritiya-developer user cannot add policies to itself."
  echo "Use root or an IAM admin. See: docs/setup/TRANSCRIBE_PERMISSIONS_NEEDED.md"
  exit 1
fi

echo "Transcribe permissions added successfully."
echo "Ensure the user also has S3 access to AWS_TRANSCRIBE_BUCKET (e.g. piritiya-transcribe)."
