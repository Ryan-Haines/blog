# Comment Moderation Guide

## 🛡️ Rate Limiting & Spam Protection

Your blog already has **comprehensive anti-spam protection**:

### Built-in Rate Limits

1. **Comments**: 2 per 5 minutes per IP address
2. **Likes**: 5 per 1 minute per IP address
3. **Turnstile CAPTCHA**: Blocks automated bots
4. **Honeypot Field**: Catches simple bots
5. **Spam Pattern Detection**: Auto-detects common spam patterns

### What Gets Blocked Automatically

Comments containing these patterns are automatically marked as spam:
- Common spam keywords (viagra, cialis, porn, casino, bitcoin, etc.)
- Suspicious URLs (.xyz, .top, .click, .loan, .win domains)
- HTML links or BBCode
- Multiple URLs

**Smart Behavior**: Spam comments are saved to the database with `approved = -1` but appear successful to the spammer (prevents them from learning what works).

---

## 📊 Moderation Tools

You have **three ways** to moderate comments:

### 1. CLI Tool (Easiest for Quick Checks)

```bash
# Show statistics
node moderate.js stats

# List all comments
node moderate.js list

# List pending comments only
node moderate.js list pending

# Approve a comment
node moderate.js approve 42

# Mark as spam
node moderate.js reject 13

# Delete permanently
node moderate.js delete 7
```

**Setup**: Add your admin key to `.dev.vars`:

```bash
# .dev.vars
ADMIN_KEY="your-super-secret-key-here"
```

### 2. Web Admin Panel

Access: `https://yourblog.com/admin/moderate?key=YOUR_ADMIN_KEY`

Features:
- 📊 Real-time statistics dashboard
- 📝 View all comments with filters (all/pending/approved/spam)
- ✅ One-click approve/reject/delete
- 🔍 See commenter IP addresses and metadata

**Security**: The page is protected by your `ADMIN_KEY`. Only you can access it.

### 3. Direct Database Access (Advanced)

Using Wrangler:

```bash
# View all comments
npx wrangler d1 execute blog-db --remote --command "SELECT * FROM comments ORDER BY created_at DESC LIMIT 10"

# Approve a comment
npx wrangler d1 execute blog-db --remote --command "UPDATE comments SET approved = 1 WHERE id = 42"

# Delete a comment
npx wrangler d1 execute blog-db --remote --command "DELETE FROM comments WHERE id = 13"

# View spam comments
npx wrangler d1 execute blog-db --remote --command "SELECT * FROM comments WHERE approved = -1"
```

---

## 🔧 Configuration

### Adjusting Rate Limits

Edit `/src/actions/index.ts`:

```typescript
// Line 120 - Comment rate limit
const rateLimitOk = await checkRateLimit(db, ipAddress, 'comment', 5, 2);
//                                                      window^  ^max
// Change to: (db, ipAddress, 'comment', 10, 1) = 1 comment per 10 minutes

// Line 229 - Like rate limit  
const rateLimitOk = await checkRateLimit(db, ipAddress, 'like', 1, 5);
// Change to: (db, ipAddress, 'like', 5, 3) = 3 likes per 5 minutes
```

### Enabling Manual Approval (No Auto-Approve)

Change line 155 in `/src/actions/index.ts`:

```typescript
// Current (auto-approve):
approved: 1

// Change to (manual approval):
approved: 0
```

When set to `0`, all new comments require your approval before appearing on the site.

### Adding Custom Spam Patterns

Edit the `containsSpam()` function (line 71):

```typescript
const spamPatterns = [
  /\b(viagra|cialis|porn|xxx|casino|bitcoin)\b/i,
  /https?:\/\/[^\s]+\.(xyz|top|click|loan|win)/i,
  /<a\s+href/i,
  /\[url=/i,
  // Add your own patterns:
  /\b(crypto|forex|trading)\b/i,  // Block crypto spam
  /follow me/i,                    // Block follow requests
];
```

---

## 🚨 Emergency: Block All Comments

If you're getting hammered with spam, temporarily disable comments:

**Option 1**: Comment out the form in `/src/components/CommentsSidebar.astro` (line 44-93)

**Option 2**: Add this to the top of the `addComment` handler:

```typescript
// Line 93 in /src/actions/index.ts
handler: async (input, context) => {
  throw new Error('Comments are temporarily disabled');
  // ... rest of code
```

**Option 3**: Set a very strict rate limit:

```typescript
const rateLimitOk = await checkRateLimit(db, ipAddress, 'comment', 60, 1);
// 1 comment per 60 minutes
```

---

## 📧 Comment Notifications (Optional)

To get notified of new comments, you could add this to the `addComment` handler:

```typescript
// After line 157 (after comment is inserted)
await fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `New comment by ${input.authorName} on ${input.postSlug}`,
  }),
});
```

Use with:
- Discord webhook
- Slack webhook
- Email service (SendGrid, Resend, etc.)

---

## 📊 Comment Status Meanings

| Status | Value | Meaning |
|--------|-------|---------|
| Approved | `1` | Visible to everyone |
| Pending | `0` | Awaiting your approval |
| Spam | `-1` | Hidden, marked as spam |

---

## 🔑 Environment Variables Needed

Add to `.dev.vars` (local) and Cloudflare dashboard (production):

```bash
# Required for moderation
ADMIN_KEY="your-secret-admin-key-here-make-it-long-and-random"

# Already configured (for comments to work)
TURNSTILE_SECRET_KEY="your-turnstile-secret"
PUBLIC_TURNSTILE_SITE_KEY="your-turnstile-site-key"
```

To add to Cloudflare:
```bash
npx wrangler secret put ADMIN_KEY
# Paste your secret key when prompted
```

---

## 🎯 Best Practices

1. **Check daily**: Run `node moderate.js stats` to see activity
2. **Review spam folder**: Sometimes false positives happen
3. **Watch for patterns**: If you see new spam types, add them to `spamPatterns`
4. **Backup your database**: Run regular backups of your D1 database
5. **Keep admin key secret**: Never commit it to git or share publicly

---

## 🆘 Troubleshooting

**CLI tool not working?**
```bash
# Make sure ADMIN_KEY is set
echo $ADMIN_KEY

# If empty, export it:
export ADMIN_KEY="your-key-here"

# Or add to .dev.vars and source it
source .dev.vars
```

**Admin page returns "Unauthorized"?**
- Check that `ADMIN_KEY` is set in your Cloudflare environment variables
- Make sure you're passing `?key=YOUR_ADMIN_KEY` in the URL
- Try accessing from your production URL, not localhost

**Comments not appearing?**
- They might be pending approval (check with `node moderate.js list pending`)
- Check database: `npx wrangler d1 execute blog-db --remote --command "SELECT * FROM comments"`

---

## 📚 Further Reading

- Rate limiting algorithm: Token bucket (sliding window)
- Cloudflare Turnstile: https://www.cloudflare.com/products/turnstile/
- D1 Database docs: https://developers.cloudflare.com/d1/

