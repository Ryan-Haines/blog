# Deployment Guide

## Branch Strategy

```
main          → Production (yourdomain.com)
staging       → Staging environment (auto-preview)
feature/*     → Feature previews
```

## Cloudflare Pages Setup

### 1. Production Environment (main branch)

**Automatic deployment on push to `main`**

Environment variables (already set):
- `TURNSTILE_SECRET_KEY` - Production Turnstile key
- `ADMIN_KEY` - Production admin key
- Database binding: `blog-db` (production)

### 2. Staging Environment Setup

#### Create Staging Branch
```bash
git checkout -b staging
git push -u origin staging
```

#### Configure in Cloudflare Dashboard

1. Go to **Cloudflare Pages** → Your project
2. **Settings** → **Builds & deployments**
3. Under **Preview deployments**, staging will auto-deploy
4. Find your staging URL: `staging.yourproject.pages.dev`

#### Set Staging Environment Variables

1. Go to **Settings** → **Environment variables**
2. Click **Add variable** for **Preview** environment
3. Add these variables:

```
TURNSTILE_SECRET_KEY = "your-staging-turnstile-key"
ADMIN_KEY = "different-staging-admin-key"
```

**Important**: Use **different** keys for staging!

#### Option A: Separate Staging Database (Recommended)

Create a separate D1 database for staging:

```bash
# Create staging database
npx wrangler d1 create blog-db-staging

# Initialize schema
npx wrangler d1 execute blog-db-staging --remote --file=./schema.sql
```

Then in Cloudflare Pages:
1. **Settings** → **Functions** → **D1 database bindings**
2. Add binding for **Preview** environment:
   - Variable name: `DB`
   - D1 database: `blog-db-staging`

#### Option B: Share Production Database

If you want staging to use the same database (less safe):
- Just use the same D1 binding
- Be careful! Staging comments will appear in production

---

## Deployment Workflow

### Daily Development

```bash
# Work on feature
git checkout -b feature/new-feature
git commit -am "Add new feature"
git push

# Auto-deploys to: feature-new-feature.yourproject.pages.dev
```

### Release to Staging

```bash
# Merge to staging for testing
git checkout staging
git merge feature/new-feature
git push

# Auto-deploys to: staging.yourproject.pages.dev
# Test thoroughly!
```

### Release to Production

```bash
# After testing, merge to main
git checkout main
git merge staging
git push

# Auto-deploys to: yourdomain.com
```

---

## Release Cut Process

### Manual Release (Simple)

```bash
#!/bin/bash
# release.sh

echo "🚀 Cutting release to production"
echo ""

# Ensure we're on staging
git checkout staging
git pull

# Get latest changes
echo "Current commits ahead of main:"
git log main..staging --oneline
echo ""

read -p "Deploy these changes to production? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Release cancelled"
  exit 0
fi

# Merge to main
git checkout main
git pull
git merge staging --no-ff -m "Release: $(date +%Y-%m-%d)"
git push

echo ""
echo "✅ Deployed to production!"
echo "   View at: https://yourdomain.com"
echo ""
echo "Next steps:"
echo "  - Monitor Cloudflare Pages dashboard"
echo "  - Check admin panel: /admin/moderate?key=YOUR_KEY"
echo "  - Test comments on a blog post"
```

Make it executable:
```bash
chmod +x release.sh
```

### Automated Release (Advanced)

Using GitHub Actions or similar:

```yaml
# .github/workflows/release.yml
name: Release to Production

on:
  workflow_dispatch:  # Manual trigger
    inputs:
      confirm:
        description: 'Type "deploy" to confirm'
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.event.inputs.confirm == 'deploy'
    steps:
      - uses: actions/checkout@v3
        with:
          ref: staging
      
      - name: Merge to main
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git fetch origin main
          git checkout main
          git merge origin/staging --no-ff -m "Release: $(date +%Y-%m-%d)"
          git push origin main
```

---

## Environment Comparison

| Feature | Local | Staging | Production |
|---------|-------|---------|------------|
| **URL** | localhost:4321 | staging.*.pages.dev | yourdomain.com |
| **Database** | Local (.wrangler) | D1 Staging | D1 Production |
| **Turnstile** | Test keys | Test/Real keys | Real keys |
| **Admin Key** | .dev.vars | Staging key | Production key |
| **Purpose** | Development | Testing | Live users |

---

## Rollback Process

If production breaks:

```bash
# Quick rollback
git checkout main
git revert HEAD  # Reverts last commit
git push

# Or reset to previous version
git reset --hard <previous-commit-hash>
git push --force  # ⚠️  Use with caution!
```

Cloudflare Pages keeps deployment history:
1. Go to **Deployments** tab
2. Find last working deployment
3. Click **⋯** → **Rollback to this deployment**

---

## Testing Checklist

Before releasing to production:

**On Staging:**
- [ ] Post a test comment
- [ ] Like a post
- [ ] Access admin panel with staging key
- [ ] Approve/reject/delete comments
- [ ] Test spam detection
- [ ] Test rate limiting (post 3+ comments quickly)
- [ ] Check theme switching (light/dark mode)
- [ ] Test on mobile
- [ ] Check all blog posts render

**On Production (after deploy):**
- [ ] Quick smoke test
- [ ] Monitor for errors
- [ ] Check comment form works
- [ ] Admin panel accessible

---

## Monitoring

### Check Deployment Status

**Cloudflare Dashboard:**
- Pages → Your project → **Deployments**
- View build logs
- See deployment status

**Via Wrangler:**
```bash
npx wrangler pages deployment list
```

### View Production Logs

```bash
npx wrangler pages deployment tail
```

### Check Database

**Production:**
```bash
npx wrangler d1 execute blog-db --remote --command "SELECT COUNT(*) FROM comments"
```

**Staging:**
```bash
npx wrangler d1 execute blog-db-staging --remote --command "SELECT COUNT(*) FROM comments"
```

---

## Quick Commands

```bash
# View staging preview
git checkout staging
git push
# Visit: staging.yourproject.pages.dev

# Deploy to production
./release.sh

# Rollback
git revert HEAD && git push

# Check deployment status
npx wrangler pages deployment list
```

---

## Tips

1. **Always test on staging first**
2. **Use different admin keys** for each environment
3. **Separate databases** prevent staging from polluting production
4. **Monitor after deploy** - check Cloudflare logs
5. **Keep staging in sync** - regularly merge main → staging to avoid drift
6. **Tag releases** for easy rollback:
   ```bash
   git tag v1.0.0
   git push --tags
   ```

---

## Troubleshooting

**Staging not deploying?**
- Check Cloudflare Pages build logs
- Ensure environment variables are set for Preview environment

**Database errors on staging?**
- Verify D1 binding is configured for Preview environment
- Check database exists: `npx wrangler d1 list`

**Admin panel unauthorized on staging?**
- Add `ADMIN_KEY` to Preview environment variables
- Use different key than production!

---

## Emergency Contacts

- **Cloudflare Status**: https://www.cloudflarestatus.com/
- **Support**: Cloudflare Dashboard → Support
- **Rollback**: Use Deployments tab in dashboard
