---
title: "Building a $0/Month Blog That I Actually Own"
description: "How I finally put my domain to work using Cloudflare's free tier, Astro, and party parrots"
pubDate: 2025-10-28
tags: ["webdev", "astro", "cloudflare", "tutorial"]
---

> How I finally put my domain to work using Cloudflare's free tier, Astro, and party parrots

## The Domain That Did Nothing

I've owned `ryanhaines.com` for years. And what did I do with it? Absolutely nothing productive. It just redirected to my LinkedIn profile like some kind of digital business card that cost me $12/year to maintain.

Why? Because I'm **frugal**. I wasn't about to drop $5-20/month on hosting when all I wanted was a simple blog to share technical posts. That's $60-240/year to host some markdown files and a contact form.

But then Cloudflare happened. Free tier. D1 database. Pages hosting. All free. Not "free trial" or "free credits for 3 months" - actually free. So naturally, I had to build something.

## The Requirements

I had a few non-negotiables:

1. **Write in Markdown** - I'm a developer, not a WordPress admin
2. **Comments and likes** - Static sites are cool, but I wanted interaction
3. **Full ownership** - If Cloudflare [enshittifies](https://en.wikipedia.org/wiki/Enshittification), I can export and leave
4. **Zero cost** - The whole point, really
5. **No vendor lock-in** - SQLite dumps are portable. Vendor-specific APIs are not.

## Why Not Use [Insert Popular Service Here]?

You're probably thinking: "Why not just use Disqus? Or Giscus? Or Utterances?"

Great question! Here's why I said no:

- **Disqus** - Ads, tracking, owned by a ad-tech company. Hard pass.
- **Giscus/Utterances** - Requires readers to have GitHub accounts. My mom doesn't have a GitHub account.
- **Commento/Hyvor** - Costs money after free tier. See "frugal" above.
- **Facebook Comments** - lol no

I wanted something simple: name + comment. No login, no tracking, no third-party dependencies that could vanish overnight. A form, a database, and spam protection - that's all it takes.

## The Stack

After some research (and by research, I mean asking Claude what would work), I landed on:

- **[Astro](https://astro.build/)** - Fast, markdown-friendly, modern
- **[Cloudflare Pages](https://pages.cloudflare.com/)** - Free hosting with global CDN
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** - Free SQLite database (5M reads/day on free tier!)
- **[Turnstile](https://www.cloudflare.com/products/turnstile/)** - Free CAPTCHA that doesn't make users play "find the crosswalk"
- **[Tailwind CSS](https://tailwindcss.com/)** - Because hand-writing CSS in 2025 is for masochists

Everything here is either standard web tech (Astro, Tailwind) or built on SQLite (D1), which means the data is portable and the code isn't locked to any single platform.

## Building It (The Fun Parts)

### 1. Theme Setup

First things first: I'm not a designer. So I found the beautiful [Dante Astro Theme](https://github.com/JustGoodUI/dante-astro-theme) and made it my own.

**Important lesson:** If you add dark mode, handle the flash of unstyled content! Nothing says "amateur hour" like your site flickering between light and dark on every page load. Astro makes this easy with inline theme scripts that run before the page renders.

```astro
<script is:inline>
  // This runs BEFORE page renders
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(theme);
</script>
```

### 2. The Commenting System

This was the meaty part. I built a custom system with:

- **Sidebar panel** - Comments slide in from the right (Medium-style)
- **No email collection** - I'm not a marketing agency
- **Rate limiting** - 2 comments per 5 minutes per IP
- **Turnstile CAPTCHA** - Stops the bots
- **Spam detection** - Pattern matching for common spam phrases

The database schema is dead simple:

```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  ip_address TEXT,
  approved INTEGER DEFAULT 1
);
```

Standard SQLite with no foreign keys to proprietary systems.

### 3. Admin Panel

Because trolls exist, I built a moderation panel at `/admin/moderate`. It's protected by an admin key (randomly generated, stored in environment variables) and lets me:

- View all comments
- Approve/reject/delete
- See spam patterns
- Check rate limit stats

It's basic but functional. And since it's just SQL queries, I can also moderate via command line if needed:

```bash
wrangler d1 execute blog-db --remote \
  --command "DELETE FROM comments WHERE id = 666"
```

### 4. Party Parrots <img src="/parrot.gif" alt="parrot" style="display: inline; height: 30px; width: auto; vertical-align: middle;" />

Here's where I added personality. I'm a card-carrying member of the [Cult of the Party Parrot](https://cultofthepartyparrot.com/), so naturally, when you like a post on my blog, you get rewarded with party parrots.

You can "like" up to 50 times per post (like Medium). Trust me, you'll know when you've reached the limit.

This kind of whimsy is what makes personal blogs fun. Big platforms would A/B test this to death. I just added it because it makes me smile.

### 5. Emergency Controls

Planning for the worst is good practice. I added:

- **Extreme rate limiting** - Can dial it down to 1 comment per hour if needed
- **Manual approval mode** - One line change to require all comments be approved
- **Spam patterns** - Auto-detect and silently reject obvious spam
- **Kill switch** - Can disable comments entirely in 30 seconds

Hopefully I never need these. But it's nice to know they're there.

## The WTF Moments of Learning Cloudflare

I weep for the people who were forced to learn this platform from reading the docs alone. Cloudflare's platform is powerful, but there are... nuances.

**The Static Page Trap:** When I first started, I created a static Cloudflare Pages site and threw up a simple HTML "hello world!" file. This setup would have been great for just HTML+CSS+JS, but it was completely incompatible with Astro's server actions. After much head-scratching, I realized I needed to delete the entire Worker and create a new Pages project. This wasn't obvious from the Cloudflare interface - there's no "hey, you've gone down the wrong path here, bud" warning.

**The Binding Maze:** Many things in Cloudflare are configured to work in one specific way or with one type of system. I spent 30 minutes debugging "DB is not defined" before realizing I forgot to bind the database in the dashboard. Not the code. Not wrangler.toml. The *dashboard*. In a different settings page. Cool cool cool.

**The Breadcrumb Hell:** Here's the thing that caused me the most head-scratching: Cloudflare's breadcrumbs are confusing as fuck. The AI would sometimes reference navigation paths that didn't match what I was seeing. I'd say "I don't see that option, I see Settings and Functions." Claude would respond, "Oh, you're on the Functions page. You need to be on the Bindings page." Finding when I was on the wrong path was the tricky part, but AI is surprisingly good at picking up on where you've diverged once you give it context clues (and swear at it enough).

**A Note on Instructions:** Because the breadcrumbs caused me so much confusion, I'm using more general terms to describe the actions in this tutorial. Besides, Cloudflare could push a UI update tomorrow that makes specific navigation paths irrelevant or incorrect - and that's likely the source of the issue. The AI was probably trained on out-of-date definitions of the Cloudflare platform. So I'll tell you *what* to do, but you might need to hunt around a bit to find *where* to do it.

**What Is Wrangler Anyways?** Wrangler is Cloudflare's CLI tool for interacting with your local and production databases. You also have to authenticate it, which was kind of nerve-wracking. When the prompt popped up asking me to authorize it in my browser, I had a moment of "did I really want to click that? Am I about to give away all of my data by mistake?" It felt almost like a leap of faith. The onboarding experience could have been smoother - maybe some reassurance that this is normal and expected? Once I got past that hurdle, executing commands was pretty straightforward.

**Wrangler vs Dashboard:** Some things you configure in the CLI, some in the dashboard, and it's not always obvious which. Environment variables? Dashboard. Database creation? CLI. Database binding? Dashboard. Database queries? CLI. See the pattern? Me neither.

**The Thing About AI:** I built this entire blog in about 2 days of evening work. Without AI, it would've been 2 weeks of StackOverflow rabbit holes and reading scattered documentation. The Cloudflare docs are comprehensive but not always beginner-friendly. Having an AI that can read them, understand my specific situation, and generate working examples? Absolute game changer.

## The Portability Factor

This was crucial to me. If Cloudflare decides to [enshittify](https://en.wikipedia.org/wiki/Enshittification) their platform (looking at you, every blogging platform from the 2000s that got acquired and killed), I can leave. Here's how:

```bash
# Export the entire database
wrangler d1 export blog-db --output=my-data.sql

# It's just SQLite, works anywhere
sqlite3 backup.db < my-data.sql
```

The blog itself is static files + server actions. Astro can deploy to Vercel, Netlify, your own VPS, or any other Node.js host.

## The Results

What did this cost me?

- **Cloudflare Pages:** $0/month
- **D1 Database:** $0/month (under free tier limits)
- **Turnstile:** $0/month (unlimited on free tier)
- **Domain:** $12/year (I already owned it)
- **Time:** ~2 evenings

What did I get?

- A blog that's actually mine
- Comments and engagement
- Global CDN performance
- No ads or tracking
- Complete portability
- The satisfaction of building it myself
- An extra half roll of 3D printing filament per month, based on the money I saved on hosting (I recommend SUNLU PETG)

## Want to Build Your Own?

If this sounds appealing, here's the rough roadmap:

### Step 1: Set Up Astro
```bash
npm create astro@latest my-blog
cd my-blog
npx astro add cloudflare tailwind
```

### Step 2: Choose Your Theme
- Start from scratch (brave)
- Use a template like [Dante](https://github.com/JustGoodUI/dante-astro-theme)
- Steal shamelessly from blogs you like (*Ed. note: even Claude calls it "stealing." Welcome to the brave new world.*)

### Step 3: Add Dark Mode Properly
```javascript
// Prevent flash of unstyled content
const getThemePreference = () => {
  if (typeof localStorage !== 'undefined' && 
      localStorage.getItem('theme')) {
    return localStorage.getItem('theme');
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};
```

### Step 4: Set Up Cloudflare D1
```bash
# Create database
npx wrangler d1 create my-blog-db

# Initialize schema
npx wrangler d1 execute my-blog-db --file=schema.sql
```

### Step 5: Add Turnstile (No Email Required!)
1. Get free keys from [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Add to your comment form
3. Verify server-side

**Hot tip:** Don't collect emails unless you need them. Users appreciate it, and you avoid having the Belgian police show up to fine you for GDPR violations.

**The Testing Problem:** Getting Turnstile to work locally is nearly a non-starter. Getting the production API to actually call Cloudflare's crazy spam detection system locally is a non-starter, so I recommend just using the testing version of Turnstile provided by Cloudflare. Getting it to work in a staging environment requires creating a whole new set of bindings, which wasn't obvious to me as a Cloudflare newcomer. It's also a headache for reasons I won't bore you with. I'll confess: I wasn't able to successfully test Turnstile in staging, but I decided to rely on Cloudflare's easy rollback if it didn't work in production. Once I was relatively confident the only reason it wasn't working was that I wasn't deployed to prod, I just shipped it. The luxury of owning your own project - you can break the rules when you want to.

### Step 6: Build the Admin Panel
Protect it with a secret key in environment variables:

```typescript
if (request.headers.get('X-Admin-Key') !== env.ADMIN_KEY) {
  return new Response('Unauthorized', { status: 401 });
}
```

**A Note on Testing:** When I first tested the admin panel, I ran into some weird serialization bugs which meant the data displayed on the admin panel was completely incorrect. The AI claimed it was actually a bug in Astro itself (which I didn't fully verify - could have been an AI hallucination). Either way, the agent eventually figured out a different way to query the admin panel data that worked, without me having to debug it manually. Reminder: you still have to test whatever the AI is making. It's not magic, it's probabilistic text generation that happens to be really good at writing code.

### Step 7: Add Personality
This is your blog. Add gifs, weird fonts, easter eggs, a gallery of pictures of your cat - whatever makes you happy. The big platforms can't do this because they're optimizing for "engagement metrics." You're optimizing for something better: making yourself smile.

### Step 8: Deploy

First, you'll need to connect your GitHub repo to Cloudflare Pages in the dashboard. Look for the option to create a new Pages project and connect it to Git. Select your repo, configure the build settings (framework preset: Astro, build command: `npm run build`, output directory: `dist`), and deploy.

After the initial setup:

```bash
git push
```

That's it. Cloudflare Pages auto-deploys from your GitHub repo. 

**Best practice:** Push your changes to a feature branch, open a PR to `main`, and Cloudflare will automatically build a preview deployment for that branch. You get a URL like `feature-branch-name.yourproject.pages.dev` to test before merging to production. This is how you do it right - test in preview, then merge to prod.

## The Bigger Picture

This blog cost me nothing but time, and I learned a bunch:

- Astro's islands architecture is genius for blogs
- Cloudflare's free tier is shockingly generous
- SQLite is underrated for small-to-medium apps
- AI makes learning new platforms way less painful
- Building things yourself is deeply satisfying

Let's be real: this is a vanity project. It's as much about platform ownership as it is about blogging. But here's the thing - once you're off the ground with your own platform, you have far less need for the Substacks and Mediums of the world. You're not dependent on their algorithms, their pivot to video, their "new monetization strategy," or whatever they decide to do next quarter.

I own the platform, the data, the design, and the destiny. That's worth the two evenings it took to build.

## Try It Yourself

The source code for this blog is [public on GitHub](https://github.com/Ryan-Haines/blog). Clone it, modify it, make it yours. That's the whole point.

And hey, if you build something cool, leave a comment below. Or don't leave a comment - I'm not your boss. But I'd love to hear what you build.

Just don't spam me. Turnstile is watching. 👀

---

**P.S.** - Don't forget to like the post and get your party parrot!
