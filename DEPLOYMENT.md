# Deploying to Cloudflare Pages

## Prerequisites
- A GitHub account
- A Cloudflare account (free tier works great!)
- Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Push to GitHub

First, create a new repository on GitHub, then push your code:

```bash
# If you haven't already set the remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push your code
git push -u origin master
```

### 2. Connect to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the left sidebar
3. Click **Create a project**
4. Click **Connect to Git**

### 3. Configure Your Build

Select your repository and configure:

- **Production branch:** `master` (or `main`)
- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variables:** None needed for basic setup

### 4. Deploy!

Click **Save and Deploy**. Cloudflare will:
- Build your site
- Deploy it to their global CDN
- Give you a `*.pages.dev` URL

### 5. Custom Domain (Optional)

After deployment:
1. Go to your Pages project
2. Click **Custom domains**
3. Add your domain and follow DNS instructions

## Automatic Deployments

Every time you push to your repository, Cloudflare Pages will automatically:
- Pull the latest changes
- Build your site
- Deploy the new version

## Build Settings Summary

```
Framework:              Astro
Build command:          npm run build
Build output directory: dist
Node version:           20 (automatically detected from .node-version)
```

## Environment Variables

For basic setup, no environment variables are needed. If you add dynamic features later (like Cloudflare Workers or D1), you can add them in:

**Settings → Environment variables**

## Troubleshooting

### Build Fails
- Check the build logs in Cloudflare Pages dashboard
- Verify your `package.json` scripts are correct
- Ensure all dependencies are listed in `package.json`

### Site Not Updating
- Clear your browser cache
- Check the deployment history in Cloudflare dashboard
- Verify your latest commit is in GitHub

### 404 Errors
- Ensure your `astro.config.mjs` site URL matches your domain
- Check that all page routes are correct

## Performance Tips

Your Cloudflare Pages site will be lightning fast because:
- Static files are served from global CDN
- Automatic HTTPS
- HTTP/3 support
- Brotli compression
- Smart caching

## Cost

Cloudflare Pages free tier includes:
- ✅ 500 builds per month
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 100 custom domains

Perfect for personal blogs! 🚀

