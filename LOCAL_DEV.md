# 🏠 Local Development - Dead Simple Guide

## Initial Setup (One Time Only)

### 1. Initialize the local database

```bash
wrangler d1 execute blog-db --file=./schema.sql
```

That's it! This creates all the tables in your local D1 database.

## Running Locally

```bash
npm run dev
```

Open http://localhost:4321

**Everything just works!** ✨

## What's Auto-Configured

- ✅ **Test Turnstile keys** - No spam protection errors locally
- ✅ **Local D1 database** - Via Cloudflare's platform proxy
- ✅ **Environment variables** - Test keys in `wrangler.toml`
- ✅ **No NaN errors** - Proper error handling built in

## Optional: Comment Moderation Setup

To use the moderation tools, create a `.dev.vars` file:

```bash
# .dev.vars (create this file in the root directory)
ADMIN_KEY="your-super-secret-admin-key-here"
```

**Note**: Add `.dev.vars` to `.gitignore` (already done) to keep your keys safe!

Then you can use:
```bash
# View comment statistics
node moderate.js stats

# List all comments
node moderate.js list

# Or access the web admin panel at:
# http://localhost:4321/admin/moderate?key=your-super-secret-admin-key-here
```

See `MODERATION.md` for the complete guide.

## Testing the Features

### Test Likes
1. Go to `/blog/postgres-cheatsheet/`
2. Click the ❤️ button
3. Count should increment immediately
4. Click again to unlike

### Test Comments
1. Click the 💬 comment button in the engagement bar
2. Sidebar slides in from the right
3. Fill in:
   - Name: "Test User"
   - Comment: "This is a test comment!"
   - (No email required! ✨)
4. Complete the CAPTCHA (it's in test mode, super easy)
5. Click "Post Comment"
6. Your comment should appear immediately in the sidebar
7. Click X or outside to close sidebar

### Test Engagement Bar
- Like button shows current likes
- Comment button shows current comment count
- Click comment button to open sidebar
- Both update in real-time
- Sidebar has smooth slide animation

## Checking Your Local Data

### View all comments:
```bash
wrangler d1 execute blog-db --command="SELECT * FROM comments"
```

### View all likes:
```bash
wrangler d1 execute blog-db --command="SELECT * FROM likes"
```

### Count comments by post:
```bash
wrangler d1 execute blog-db --command="SELECT post_slug, COUNT(*) as count FROM comments GROUP BY post_slug"
```

### Clear all test data:
```bash
wrangler d1 execute blog-db --command="DELETE FROM comments"
wrangler d1 execute blog-db --command="DELETE FROM likes"
```

## Common Local Dev Issues

### "NaN" in counts
**Fix:** Run the database init command above. The database might not be initialized.

### "DB is not defined"
**Fix:** Make sure `database_id` is set in `wrangler.toml` (you should have added it already).

### Turnstile errors
**Fix:** Should never happen locally - test key is auto-configured. Check browser console for details.

### Actions not working
**Fix:** 
1. Stop the dev server (Ctrl+C)
2. Run `npm run dev` again
3. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

## The Magic Behind It

Your `wrangler.toml` has:
```toml
[vars]
TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
TURNSTILE_SITE_KEY = "1x00000000000000000000AA"
```

And `CommentsSidebar.astro` automatically uses these test keys in dev mode.

This means:
- **Local:** Always uses test keys (no setup needed)
- **Production:** Uses your real Cloudflare keys

## That's It!

No `.env` files. No complex setup. Just works. 🎉

---

**Ready for production?** See [QUICKSTART.md](./QUICKSTART.md) for deployment steps.

