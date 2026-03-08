#!/bin/bash

# Add API Gateway (HTTP API) permissions to piritiya-developer IAM user.
# Must be run with credentials that have IAM permissions (root or admin).
# The piritiya-developer user cannot attach policies to itself.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
POLICY_JSON="$PROJECT_ROOT/docs/setup/API_GATEWAY_POLICY.json"
IAM_USER="piritiya-developer"
POLICY_NAME="PiritiyaAPIGatewayAccess"

if [ ! -f "$POLICY_JSON" ]; then
  echo "Policy file not found: $POLICY_JSON"
  exit 1
fi

echo "Adding API Gateway permissions to IAM user: $IAM_USER"
echo "(This requires credentials with IAM permissions, e.g. root or admin.)"
echo ""

if ! aws iam put-user-policy \
  --user-name "$IAM_USER" \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://$POLICY_JSON" 2>&1; then
  echo ""
  echo "❌ Failed. The piritiya-developer user cannot add policies to itself."
  echo "   Use root or an IAM admin account. See: docs/setup/API_GATEWAY_PERMISSIONS_NEEDED.md"
  exit 1
fi

echo "✅ API Gateway permissions added successfully!"
echo ""
echo "As piritiya-developer, run: ./scripts/deploy-production.sh"
