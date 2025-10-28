#!/bin/bash

# Release script for deploying staging → production

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Release to Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "❌ Error: Not in a git repository"
  exit 1
fi

# Fetch latest
echo "📡 Fetching latest changes..."
git fetch origin
echo ""

# Switch to staging
echo "📦 Switching to staging branch..."
git checkout staging
git pull origin staging
echo ""

# Show what will be deployed
echo "📋 Changes to be deployed:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log origin/main..staging --oneline --color=always | head -20
echo ""

# Check if there are changes
if ! git log origin/main..staging --oneline | grep -q .; then
  echo "✅ Staging and main are in sync. Nothing to deploy!"
  exit 0
fi

# Confirmation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "🤔 Deploy these changes to PRODUCTION? (type 'yes'): " confirm

if [ "$confirm" != "yes" ]; then
  echo ""
  echo "❌ Release cancelled"
  exit 0
fi

echo ""
echo "🔀 Merging staging → main..."
git checkout main
git pull origin main
git merge staging --no-ff -m "Release: $(date +%Y-%m-%d-%H%M)"

echo ""
echo "⬆️  Pushing to production..."
git push origin main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successfully deployed to production!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Deployment URL: https://yourdomain.com"
echo "⏱️  Cloudflare Pages will build in ~1-2 minutes"
echo ""
echo "Next steps:"
echo "  1. Monitor Cloudflare Pages dashboard"
echo "  2. Test: Post a comment on your blog"
echo "  3. Test: Access admin panel"
echo ""
echo "To rollback if needed:"
echo "  git revert HEAD && git push"
echo ""
