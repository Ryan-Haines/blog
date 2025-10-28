# 🚀 Quick Start Guide - Comments & Likes

## What I Just Built For You

✅ **Medium-style engagement bar** - Like ❤️ | Comment 💬 with live counts  
✅ **Sidebar comment panel** - Slides in from right, beautiful UX  
✅ **No email collection** - Just name + comment (privacy-friendly!)  
✅ **Like system** - One per IP, with animated heart  
✅ **Cloudflare D1** - Database integration  
✅ **Turnstile CAPTCHA** - Free, no tracking  
✅ **Rate limiting** - Anti-spam protection  
✅ **Honeypot detection** - Catches bots  
✅ **Seamless local/prod** - Zero config changes needed  
✅ **Full portability** - Export SQLite anytime

## ⚠️ Known Issue: TypeScript Errors

You might see TypeScript errors in `src/actions/index.ts`:
```
Module '"astro:actions"' has no exported member 'defineAction'
Module '"astro:schema"' has no exported member 'z'
```

**This is normal!** These errors will disappear once you:
1. Follow the Cloudflare setup steps below
2. Run `npm run dev` (Astro will generate the proper types)

The code is correct - TypeScript just needs the dev server to generate type definitions.

## 🎯 Next Steps (Required)

You need to set up a few things in the Cloudflare dashboard. **Don't worry, it's all free!**

### 1. Create D1 Database (2 minutes)

```bash
# Install Wrangler globally (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create your database
wrangler d1 create blog-db
```

**Copy the `database_id` from the output!** You'll need it in the next step.

### 2. Update wrangler.toml

Open `wrangler.toml` and add your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"  # ← Add it here
```

### 3. Initialize the Database

```bash
# For local development
wrangler d1 execute blog-db --file=./schema.sql

# For production (run this too!)
wrangler d1 execute blog-db --remote --file=./schema.sql
```

### 4. Set Up Turnstile (Free CAPTCHA)

1. Go to [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click **"Add site"**
3. Fill in:
   - **Site name**: Blog Comments
   - **Domain**: Your domain (or `localhost` for testing)
   - **Widget type**: Managed
4. Click **Create**
5. **Copy both keys:**
   - Site Key (public)
   - Secret Key (private)

### 5. Add Turnstile Site Key (Optional for Production)

In Cloudflare Pages **Environment Variables**, add:
- **Variable name**: `PUBLIC_TURNSTILE_SITE_KEY`  
- **Value**: Your Turnstile site key
- **Environment**: Production

*Note: For local dev, test keys are auto-configured in `wrangler.toml`*

### 6. Add Secret to Cloudflare Pages

1. Go to your Cloudflare Pages project
2. **Settings** → **Environment variables**
3. Add variable:
   - Name: `TURNSTILE_SECRET_KEY`
   - Value: Your secret key from Turnstile
   - Environment: Production (and Preview)
4. Save

### 7. Link D1 to Pages

1. In your Pages project settings
2. **Settings** → **Functions** → **D1 database bindings**
3. Click **Add binding**
4. Set:
   - Variable name: `DB`
   - D1 database: Select `blog-db`
5. Save

### 8. Deploy!

```bash
git add .
git commit -m "Add comments and likes system"
git push
```

Cloudflare Pages will auto-deploy your changes!

## 🧪 Test Locally (Super Easy!)

After you've set up the D1 database (steps 1-3 above), just run:

```bash
npm run dev
```

**That's it!** The local setup is automatic:
- ✅ Test Turnstile keys are auto-loaded (no NaN errors!)
- ✅ Local D1 database works out of the box
- ✅ No environment variables needed for local dev

Visit http://localhost:4321/blog/postgres-cheatsheet/

You should see:
- ❤️ Like button | 💬 Comment button (Medium-style bar below post)

**Try it out:**
1. Click the ❤️ like button - it should increment
2. Click the 💬 comment button - sidebar slides in from right
3. Post a comment (just name + text, no email!)
4. Comment appears immediately in sidebar
5. Close sidebar with X or click outside

The local setup uses:
- Test Turnstile keys (automatically selected in dev mode)
- Local D1 database via Wrangler
- No production secrets needed!

## 📝 How It Works

### Medium-Style Engagement Bar
A horizontal bar shows below each post with:
- ❤️ **Like button + count** - Click to toggle like
- 💬 **Comment button + count** - Click to jump to comments
- Updates in real-time as you interact

### Like System
- One like per IP address per post
- Instant UI updates (optimistic rendering)
- Animated heart on like
- Rate limited (5 likes per minute per IP)
- Stored in D1 database

### Comment System
- **Sidebar panel** - Opens when clicking 💬 button
- **No email required** - Just name + comment (privacy-first!)
- **Oldest comments show first** - Like a conversation thread
- Turnstile CAPTCHA verification
- Honeypot field (hidden, catches simple bots)
- Rate limiting (2 comments per 5 minutes per IP)
- Auto-approval by default (configurable)
- Simple spam detection (blocks common spam patterns)
- Smooth slide-in animation
- Click X or outside to close

### Spam Protection Layers
1. **Turnstile CAPTCHA** - Stops bots
2. **Honeypot field** - Catches simple bots
3. **Rate limiting** - Prevents spam floods
4. **Content filtering** - Blocks obvious spam patterns
5. **Manual moderation** - You can approve/delete via D1 commands

## 🛠️ Customization

### Change Auto-Approval to Manual Moderation

In `src/actions/index.ts`, line ~85:

```typescript
approved: 1 // Auto-approve
```

Change to:

```typescript
approved: 0 // Require manual approval
```

### Adjust Rate Limits

In `src/actions/index.ts`:

```typescript
// Comments: 2 per 5 minutes
checkRateLimit(db, ipAddress, 'comment', 5, 2)

// Likes: 5 per 1 minute  
checkRateLimit(db, ipAddress, 'like', 1, 5)
```

Change the numbers to your preference!

### Customize Spam Patterns

In `src/actions/index.ts`, edit the `containsSpam()` function to add more patterns.

## 🗄️ Database Management

### View all comments:
```bash
wrangler d1 execute blog-db --command="SELECT * FROM comments ORDER BY created_at DESC LIMIT 10"
```

### View comment count by post:
```bash
wrangler d1 execute blog-db --command="SELECT post_slug, COUNT(*) as count FROM comments WHERE approved = 1 GROUP BY post_slug"
```

### Delete a spam comment:
```bash
wrangler d1 execute blog-db --command="DELETE FROM comments WHERE id = X"
```

### Approve a pending comment:
```bash
wrangler d1 execute blog-db --command="UPDATE comments SET approved = 1 WHERE id = X"
```

### View likes by post:
```bash
wrangler d1 execute blog-db --command="SELECT post_slug, COUNT(*) as likes FROM likes GROUP BY post_slug"
```

### Export your entire database:
```bash
wrangler d1 export blog-db --output=backup.sql
```

## 📦 Data Portability

Your data is 100% portable! D1 is SQLite, so you can export anytime:

```bash
wrangler d1 export blog-db --output=my-comments.sql
```

This creates a standard SQLite dump that works with:
- Any SQLite database
- Turso
- Supabase (with pg_loader)
- PostgreSQL (with conversion tools)
- Self-hosted servers

## 💰 Costs

**$0/month** with Cloudflare free tier:
- Pages: Unlimited requests, 500 builds/month
- D1: 5GB storage, 5M reads/day, 100K writes/day
- Turnstile: Unlimited, completely free!

For a personal blog, you'll never hit these limits!

## 📚 Need More Help?

See the detailed guide: **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)**

## 🐛 Troubleshooting

**"NaN" shows for like/comment counts**
→ This is normal if D1 database isn't set up yet
→ Run: `wrangler d1 execute blog-db --file=./schema.sql`
→ Make sure database_id is in wrangler.toml

**"DB is not defined" (in production)**
→ Add D1 binding in Cloudflare Pages settings
→ Variable name must be exactly `DB`

**"Turnstile verification failed"**
→ Check TURNSTILE_SECRET_KEY environment variable
→ For local dev, test key is auto-configured in wrangler.toml

**TypeScript errors in actions/index.ts**
→ Run `npm run dev` once to generate types
→ These errors are expected before first run

**Comments not showing up**
→ Check browser console for errors
→ Verify database init ran successfully
→ Check that posts are approved (default is auto-approve)

**Engagement bar not updating after comment**
→ Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
→ Check that events are being dispatched in console

---

**Questions?** Check the full setup guide or the inline code comments!

