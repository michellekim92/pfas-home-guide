#!/bin/bash
# Deploy PFAS Home Guide to Vercel (HTTPS). First run opens a browser to log in.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

echo "=== Deploy to Vercel ==="
echo "Project root: $DIR"
echo ""

if [[ "${1:-}" == "--preview" ]]; then
  npx vercel@latest
else
  npx vercel@latest --prod
fi

echo ""
echo "Done. Use your *.vercel.app URL (or custom domain) for Amazon Associates."
