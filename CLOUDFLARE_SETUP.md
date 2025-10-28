# Cloudflare Setup Guide

This guide walks you through setting up D1 database and Turnstile for your blog's comments and likes feature.

## Prerequisites

- Cloudflare account (free tier works!)
- Your site deployed on Cloudflare Pages
- Wrangler CLI installed (`npm install -g wrangler`)

## Step 1: Install Wrangler (if not already installed)

```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

## Step 3: Create D1 Database

```bash
wrangler d1 create blog-db
```

**Important:** Copy the `database_id` from the output!

Example output:
```
✅ Successfully created DB 'blog-db'!

[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← COPY THIS!
```

## Step 4: Update wrangler.toml

Open `wrangler.toml` and paste your `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "blog-db"
database_id = "YOUR_DATABASE_ID_HERE"  # ← Paste the ID here
```

## Step 5: Initialize Database Schema

Run the schema SQL file to create your tables:

```bash
wrangler d1 execute blog-db --file=./schema.sql
```

You should see output like:
```
🌀 Mapping SQL input into an array of statements
🌀 Executing on blog-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
✅ Executed 9 commands in 0.123ms
```

**For production**, run it with `--remote`:

```bash
wrangler d1 execute blog-db --remote --file=./schema.sql
```

## Step 6: Set Up Turnstile (Free CAPTCHA)

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the left sidebar (under "Zero Trust" or search for it)
3. Click **"Add site"**
4. Configure:
   - **Site name**: Blog Comments
   - **Domain**: Your domain (e.g., `yourdomain.com`) or `localhost` for testing
   - **Widget type**: Managed (recommended)
   - Click **Create**

5. **Copy your keys:**
   - **Site Key** (public)
   - **Secret Key** (private)

## Step 7: Update Your Code with Turnstile Site Key

Open `src/components/Comments.astro` and replace the placeholder:

```html
<!-- Around line 71 -->
<div class="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>
```

Replace `YOUR_TURNSTILE_SITE_KEY` with your actual Turnstile **Site Key** (public key).

## Step 8: Add Secrets to Cloudflare Pages

1. Go to your [Cloudflare Pages dashboard](https://dash.cloudflare.com/)
2. Select your blog project
3. Go to **Settings** → **Environment variables**
4. Add these variables:
   
   **Turnstile Secret Key:**
   - **Variable name**: `TURNSTILE_SECRET_KEY`
   - **Value**: Your Turnstile **Secret Key**
   - **Environment**: Production (and Preview if you want)
   
   **Admin Key (for comment moderation):**
   - **Variable name**: `ADMIN_KEY`
   - **Value**: A long, random secret key (e.g., generate with `openssl rand -hex 32`)
   - **Environment**: Production (and Preview if you want)
   
5. Click **Save**

**💡 Tip:** To generate a secure admin key, run:
```bash
openssl rand -hex 32
# Or use any random string generator
```

**Keep this key safe!** You'll use it to access the moderation panel at `/admin/moderate?key=YOUR_ADMIN_KEY`

## Step 9: Link D1 Database to Pages Project

1. In your Cloudflare Pages project settings
2. Go to **Settings** → **Functions** → **D1 database bindings**
3. Click **Add binding**
4. Configure:
   - **Variable name**: `DB` (must match your wrangler.toml)
   - **D1 database**: Select `blog-db`
5. Click **Save**

## Step 10: Deploy!

Push your code to GitHub (or your git provider), and Cloudflare Pages will automatically deploy.

```bash
git add .
git commit -m "Add comments and likes with D1 + Turnstile"
git push
```

## Testing Locally

To test with local D1 database:

```bash
# Start the dev server with Cloudflare adapter
npm run dev
```

The `platformProxy` in your `astro.config.mjs` enables local D1 testing!

**Note:** For local testing with Turnstile, you may want to use a test site key:
- Test Site Key: `1x00000000000000000000AA` (always passes)
- Test Secret Key: `1x0000000000000000000000000000000AA` (always passes)

Just remember to replace with real keys before deploying to production!

## Verify Everything Works

1. Visit a blog post on your site
2. You should see:
   - ❤️ Like button at the bottom of the post
   - Comment form with Turnstile CAPTCHA
   - Comments list (empty at first)
3. Try liking the post - the count should increment
4. Try posting a comment - it should appear after submission

## Troubleshooting

### "DB is not defined" Error

- Make sure you've added the D1 binding in Cloudflare Pages settings
- Variable name must be exactly `DB`
- Redeploy after adding the binding

### "Turnstile verification failed"

- Make sure `TURNSTILE_SECRET_KEY` is set in Pages environment variables
- Check that you're using the correct site key in `Comments.astro`
- For local testing, use test keys

### Comments not appearing

- Check browser console for errors
- Verify the database was initialized with `wrangler d1 execute`
- Check that posts are approved (default is auto-approve, `approved = 1`)

### Rate limiting too strict?

Edit the rate limit parameters in `src/actions/index.ts`:
- `checkRateLimit(db, ipAddress, 'comment', 5, 2)` 
  - `5` = minutes window
  - `2` = max comments in that window

## Database Management

### View all comments:
```bash
wrangler d1 execute blog-db --command="SELECT * FROM comments ORDER BY created_at DESC"
```

### View all likes:
```bash
wrangler d1 execute blog-db --command="SELECT post_slug, COUNT(*) as likes FROM likes GROUP BY post_slug"
```

### Delete spam comment:
```bash
wrangler d1 execute blog-db --command="DELETE FROM comments WHERE id = X"
```

### Approve pending comment:
```bash
wrangler d1 execute blog-db --command="UPDATE comments SET approved = 1 WHERE id = X"
```

### Export database (for portability):
```bash
wrangler d1 export blog-db --output=backup.sql
```

## Cost (Spoiler: FREE!)

With Cloudflare's free tier:
- **Pages**: Unlimited requests, 500 builds/month
- **D1**: 5GB storage, 5M reads/day, 100K writes/day
- **Turnstile**: Unlimited (completely free!)

For a personal blog, you'll never hit these limits. 🎉

## Data Portability

Your data is yours! D1 is SQLite, so you can export anytime:

```bash
wrangler d1 export blog-db --output=my-blog-data.sql
```

This creates a standard SQLite dump that you can import anywhere (Turso, Supabase, PostgreSQL with conversion, etc.).

---

## Need Help?

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Astro Actions Docs](https://docs.astro.build/en/guides/actions/)

