# 🛡️ Rate Limiting & Anti-Spam Summary

## ✅ What You Already Have

Your blog **already has comprehensive spam protection** built-in! No additional setup needed for basic protection.

### Active Rate Limits

| Action | Limit | Window |
|--------|-------|--------|
| **Comments** | 2 per IP | 5 minutes |
| **Likes** | 5 per IP | 1 minute |

### Active Spam Protection

1. ✅ **Turnstile CAPTCHA** - Cloudflare's bot detection
2. ✅ **Honeypot Field** - Catches simple bots  
3. ✅ **Pattern Detection** - Auto-blocks spam keywords and suspicious URLs
4. ✅ **IP-based Rate Limiting** - Prevents spam floods
5. ✅ **Smart Response** - Fake success for spammers (they don't learn)

### What Gets Auto-Blocked

Comments containing:
- Spam keywords: viagra, cialis, porn, casino, bitcoin, etc.
- Suspicious domains: .xyz, .top, .click, .loan, .win
- HTML/BBCode links
- Multiple URLs

**Result:** Marked as spam (`approved = -1`) in database, but spammer thinks it succeeded!

---

## 🎛️ How to Moderate Comments

You now have **3 moderation tools**:

### 1️⃣ CLI Tool (Quickest)

```bash
# Set your admin key (one time)
echo 'ADMIN_KEY="your-secret-key"' > .dev.vars

# View statistics
node moderate.js stats

# List all comments
node moderate.js list

# List only spam
node moderate.js list spam

# Approve a comment
node moderate.js approve 42

# Delete a comment
node moderate.js delete 13
```

### 2️⃣ Web Admin Panel (Easiest)

**Local:** http://localhost:4321/admin/moderate?key=YOUR_ADMIN_KEY  
**Production:** https://yourblog.com/admin/moderate?key=YOUR_ADMIN_KEY

Features:
- 📊 Live statistics dashboard
- 📝 Filter comments by status (all/pending/approved/spam)
- ✅ One-click approve/reject/delete
- 🔍 View IP addresses and metadata

### 3️⃣ Direct Database (Advanced)

```bash
# View all comments
npx wrangler d1 execute blog-db --remote \
  --command "SELECT * FROM comments ORDER BY created_at DESC LIMIT 10"

# Approve comment #42
npx wrangler d1 execute blog-db --remote \
  --command "UPDATE comments SET approved = 1 WHERE id = 42"

# Delete comment #13
npx wrangler d1 execute blog-db --remote \
  --command "DELETE FROM comments WHERE id = 13"
```

---

## ⚙️ Configuration

### Current Settings

Located in `/src/actions/index.ts`:

```typescript
// Line 120: Comment rate limit
checkRateLimit(db, ipAddress, 'comment', 5, 2)
//                                       ↑   ↑
//                               5 minutes   2 max

// Line 155: Auto-approve mode
approved: 1  // Change to 0 for manual approval
```

### Make Comments Require Approval

Change line 155 in `/src/actions/index.ts`:

```typescript
approved: 0  // Pending approval (was: 1)
```

Then all new comments will need your approval via moderation tools.

### Adjust Rate Limits

Edit line 120 in `/src/actions/index.ts`:

```typescript
// More strict: 1 comment per 10 minutes
checkRateLimit(db, ipAddress, 'comment', 10, 1)

// More relaxed: 5 comments per 3 minutes  
checkRateLimit(db, ipAddress, 'comment', 3, 5)
```

---

## 🚀 Quick Start

### Step 1: Generate Admin Key

```bash
# Generate a secure random key
openssl rand -hex 32
# Example output: a1b2c3d4e5f6...
```

### Step 2: Add to Local Environment

```bash
# Create .dev.vars file
echo 'ADMIN_KEY="paste-your-key-here"' > .dev.vars
```

### Step 3: Add to Cloudflare (Production)

1. Go to Cloudflare Pages Dashboard
2. Select your blog project
3. **Settings** → **Environment variables**
4. Add new variable:
   - Name: `ADMIN_KEY`
   - Value: (paste your key)
   - Environment: Production

### Step 4: Test Locally

```bash
# Start dev server
npm run dev

# In another terminal, try the CLI
node moderate.js stats

# Or open the web panel
open http://localhost:4321/admin/moderate?key=YOUR_ADMIN_KEY
```

---

## 📊 Comment Status Values

| Status | Value | Visible? | Meaning |
|--------|-------|----------|---------|
| Approved | `1` | ✅ Yes | Shows on public blog |
| Pending | `0` | ❌ No | Awaiting approval |
| Spam | `-1` | ❌ No | Marked as spam |

---

## 🆘 Common Issues

### "Unauthorized" Error on Admin Panel
- Check `ADMIN_KEY` is set in Cloudflare dashboard
- Make sure you're passing `?key=YOUR_KEY` in URL
- Try accessing production URL, not localhost

### CLI Tool Not Working
```bash
# Check if ADMIN_KEY is set
echo $ADMIN_KEY

# If empty, export it
export ADMIN_KEY="your-key-here"

# Or source .dev.vars
source .dev.vars
```

### Too Much Spam?
```bash
# Temporarily disable comments by making rate limit super strict
# Change line 120 in /src/actions/index.ts to:
checkRateLimit(db, ipAddress, 'comment', 60, 1)  // 1 per hour
```

---

## 📚 More Info

- **Full Guide:** See `MODERATION.md`
- **Setup Guide:** See `CLOUDFLARE_SETUP.md`
- **Database Schema:** See `schema.sql`
- **Actions Code:** See `/src/actions/index.ts`

---

## 🎯 Daily Workflow

```bash
# Morning: Check overnight comments
node moderate.js stats
node moderate.js list pending

# Approve good ones
node moderate.js approve 123

# Delete spam
node moderate.js delete 456

# Check spam folder occasionally (false positives?)
node moderate.js list spam
```

That's it! Your blog is protected. 🛡️

