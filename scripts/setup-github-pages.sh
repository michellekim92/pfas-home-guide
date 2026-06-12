#!/bin/bash
# Connect this folder to a new GitHub repo and push for GitHub Pages deploy.
set -euo pipefail

REPO_NAME="${1:-pfas-home-guide}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "No git repo found. Run from the project folder after git init."
  exit 1
fi

echo "=== PFAS Home Guide → GitHub Pages ==="
echo ""
echo "1. Create an empty repo on GitHub (no README, no .gitignore):"
echo "   https://github.com/new?name=${REPO_NAME}"
echo ""
read -r -p "2. Your GitHub username: " GH_USER
read -r -p "3. Repo name [${REPO_NAME}]: " INPUT_NAME
REPO_NAME="${INPUT_NAME:-$REPO_NAME}"

REMOTE="https://github.com/${GH_USER}/${REPO_NAME}.git"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote origin already set: $(git remote get-url origin)"
  read -r -p "Replace with ${REMOTE}? [y/N] " REPLACE
  if [[ "${REPLACE,,}" == "y" ]]; then
    git remote set-url origin "$REMOTE"
  fi
else
  git remote add origin "$REMOTE"
fi

echo ""
echo "Pushing main branch..."
git push -u origin main

SITE_URL="https://${GH_USER}.github.io/${REPO_NAME}/"
echo ""
echo "=== Next steps ==="
echo "4. Open Pages settings and set Source to GitHub Actions:"
echo "   https://github.com/${GH_USER}/${REPO_NAME}/settings/pages"
echo ""
echo "5. Watch the deploy workflow (about 1–2 min):"
echo "   https://github.com/${GH_USER}/${REPO_NAME}/actions"
echo ""
echo "Your site will be live at:"
echo "   ${SITE_URL}"
echo ""
echo "Use this URL on your Amazon Associates application."
