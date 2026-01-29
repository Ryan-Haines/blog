---
title: "Git Ignore Specific Lines: Keep Local Config Changes Out of Your Diff"
description: "How to use .gitattributes and filters to ignore specific lines in git, so you can change local config values without dirtying your git status"
pubDate: 2025-01-15
tags: ["git", "tutorial", "development", "tools"]
---

> I've often asked myself this: you don't want to change the baseline config file, but you still want to change some values for your *local* environment, while keeping a clean git diff. How do you achieve this when onboarding to a new project?

## The Problem

You've cloned a new project. There's a config file with database credentials, API keys, or environment-specific settings. You need to change these values for your local setup, but every time you run `git status`, you see:

```
modified:   config/database.json
```

You could:
- Add the whole file to `.gitignore` (but then you lose the template)
- Manually reset the file before commits (tedious and error-prone)
- Use environment variables (but what if the project doesn't support that yet?)

There's a better way: **use `.gitattributes` with a filter to ignore specific lines**.

## The Solution: Git Attributes + Filters

Git filters let you transform files on checkout and commit. You can use this to automatically remove or replace specific lines based on markers, keeping your local changes out of git's view.

### Step 1: Mark the Lines You Want to Ignore

In your config file, add a special marker comment to lines you want git to ignore:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "secret123" // LOCAL_ONLY
  }
}
```

Or in a more structured way:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "secret123" // git-ignore-line
  }
}
```

### Step 2: Create a Git Filter Script

Create a script that removes lines containing your marker. Save it as `.git/filters/ignore-local-lines`:

```bash
#!/bin/bash
# Remove lines marked with // git-ignore-line or // LOCAL_ONLY
sed '/\/\/ git-ignore-line/d; /\/\/ LOCAL_ONLY/d'
```

Make it executable:

```bash
chmod +x .git/filters/ignore-local-lines
```

### Step 3: Configure Git to Use the Filter

Add to your `.gitattributes` file (create it if it doesn't exist):

```
config/database.json filter=ignore-local-lines
*.config.json filter=ignore-local-lines
```

Then configure the filter in your `.git/config` or `~/.gitconfig`:

```ini
[filter "ignore-local-lines"]
    clean = .git/filters/ignore-local-lines
    smudge = cat
    required
```

The `clean` filter runs on commit (removes the marked lines), and `smudge` runs on checkout (just passes through unchanged).

### Step 4: Apply the Filter to Existing Files

If the file is already tracked, you need to refresh it:

```bash
git rm --cached config/database.json
git add config/database.json
```

Now when you commit, git will automatically strip out any lines marked with your ignore marker. Your local file keeps your changes, but git only sees the baseline version.

## Alternative: Using a Cleaner Pattern

For more complex scenarios, you might want a filter that preserves the line structure but replaces values:

```bash
#!/bin/bash
# Replace values on lines marked with // git-ignore-line
sed 's/\(.*\)\/\/ git-ignore-line/\1\/\/ DEFAULT_VALUE/'
```

This keeps the line but replaces your local value with a default, which can be useful for maintaining file structure.

## When to Use This

This pattern works best for:
- **Config files** with local environment values
- **Database connection strings** that differ per developer
- **API endpoints** pointing to local vs. remote services
- **Feature flags** you want to test locally

It's less ideal for:
- Files that change frequently (the filter adds overhead)
- Binary files (filters work on text)
- Files where structure matters critically (JSON with trailing commas, etc.)

## The Trade-off

This approach adds some complexity. Every developer needs to set up the filter, and it requires discipline to mark lines consistently. But for teams where local config divergence is common, it's a clean solution that keeps git diffs focused on actual changes.

## Quick Setup Script

Here's a one-liner to set this up quickly:

```bash
mkdir -p .git/filters && \
echo '#!/bin/bash
sed "/\/\/ git-ignore-line/d; /\/\/ LOCAL_ONLY/d"' > .git/filters/ignore-local-lines && \
chmod +x .git/filters/ignore-local-lines && \
echo '*.config.json filter=ignore-local-lines' >> .gitattributes && \
git config filter.ignore-local-lines.clean '.git/filters/ignore-local-lines' && \
git config filter.ignore-local-lines.smudge 'cat' && \
git config filter.ignore-local-lines.required true
```

Now you can mark any line with `// git-ignore-line` and it won't show up in your git diff. Your local changes stay local, and your commits stay clean.

---

*Have other git tricks for keeping local changes separate? Drop a comment below.*








