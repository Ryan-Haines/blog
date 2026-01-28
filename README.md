# Ryan's Personal Blog Site

A modern, fast, and beautiful personal blog built with Astro.js and Tailwind CSS.

## 🚀 Features

- ✅ Dark and light mode
- ✅ Blog with MDX support
- ✅ Portfolio/Projects showcase
- ✅ About and Contact pages
- ✅ RSS Feed
- ✅ SEO optimized
- ✅ Mobile-first responsive design
- ✅ Fast page loads with static site generation

## 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Content:** MDX (Markdown + JSX)
- **TypeScript:** For type safety
- **Hosting:** Cloudflare Pages

## 📦 Project Structure

```
/
├── public/              # Static assets (images, favicon, etc.)
├── src/
│   ├── components/      # Reusable Astro components
│   ├── content/         # Blog posts and projects (MDX/Markdown)
│   │   ├── blog/
│   │   └── projects/
│   ├── data/           # Site configuration
│   ├── layouts/        # Page layouts
│   ├── pages/          # Page routes
│   └── styles/         # Global styles
├── astro.config.mjs    # Astro configuration
├── tailwind.config.mjs # Tailwind configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command            | Action                                       |
| :----------------- | :------------------------------------------- |
| `npm install`      | Installs dependencies                        |
| `npm run dev`      | Starts local dev server at `localhost:4321`  |
| `npm run build`    | Build your production site to `./dist/`      |
| `npm run preview`  | Preview your build locally, before deploying |

## 📝 Adding Content

### New Blog Post

Create a new `.md` or `.mdx` file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "A brief description"
pubDate: 2025-10-27
tags: ["tag1", "tag2"]
---

Your content here...
```

### New Project

Create a new `.md` file in `src/content/projects/`:

```markdown
---
title: "Project Name"
description: "Project description"
pubDate: 2025-10-27
tags: ["tag1", "tag2"]
projectUrl: "https://project-url.com"
githubUrl: "https://github.com/user/repo"
---

Project details...
```

## ⚙️ Configuration

Edit `src/data/site.config.ts` to customize:
- Site title and description
- Author information
- Social links
- Navigation menu

## 🚀 Deployment

### Cloudflare Pages

1. Push your code to GitHub
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Go to Pages → Create a project
4. Connect your GitHub repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Deploy!

Your site will automatically redeploy when you push to your main branch.
