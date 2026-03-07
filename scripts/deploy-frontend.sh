#!/usr/bin/env bash
# Build frontend for production. Requires VITE_API_BASE_URL.
# Usage: VITE_API_BASE_URL=https://api.example.com ./scripts/deploy-frontend.sh
# Or:    export VITE_API_BASE_URL=https://api.example.com && ./scripts/deploy-frontend.sh

set -e
cd "$(dirname "$0")/.."

if [ -z "${VITE_API_BASE_URL}" ]; then
  echo "Error: VITE_API_BASE_URL must be set (your production backend URL)."
  echo "Example: VITE_API_BASE_URL=https://your-api.example.com ./scripts/deploy-frontend.sh"
  exit 1
fi

echo "Building frontend with VITE_API_BASE_URL=$VITE_API_BASE_URL"
cd frontend
npm run build
echo "Done. Output is in frontend/dist/. Deploy that folder to Netlify, Vercel, or S3."
