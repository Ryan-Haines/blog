---
title: "What is a Docker, Anyways?"
description: "A friendly, no-gatekeeping guide to understanding Docker - what it does, why it exists, and when you need to use it"
pubDate: 2026-01-28T12:00:00
tags: ["docker", "devops", "tutorial", "beginners"]
---

> A friendly, no-gatekeeping guide to understanding Docker

## The Docker Mystery

<div style="float: right; margin: 0 0 1rem 1rem; max-width: 300px;">

![Docker meme](/docker_meme.jpg)

</div>

Most developers run into Docker pretty early in their careers. Usually it goes something like this:

**Day 1:** "Just run `docker compose up` and everything will work."

**Day 7:** Something breaks. A coworker tells you to run `docker system prune -a` and restart.

**Day 30:** You hear terms like "container" and "sandbox" thrown around. You nod along, vaguely understanding it has something to do with isolation.

**Day 90:** You're using Docker Compose regularly, but if someone asked you to explain what's actually happening under the hood, you'd probably change the subject.

Sound familiar? You're not alone. Docker stays mysteriously opaque for a lot of developers because they're never forced to understand it - they just need it to work.

## My Hot Take

The best way to learn Docker is to know it exists, and then use it as little as possible.

Seriously. You'll eventually hit a point in your development where you *feel* the problems Docker solves - environment inconsistency, deployment headaches, onboarding nightmares. That's when Docker clicks. Until then, it's just overhead.

**It's more important to build a working prototype than to build a robust Docker setup.** Don't let anyone gatekeep you into thinking you need to master containerization before you're allowed to ship software. Build first. Dockerize later, when you actually need it.

That said, when you *do* hit those problems, Docker becomes incredibly valuable. So let's actually explain it.

## The One Command You Need to Know

Before we go deeper, let me give you the single most important Docker command:

```bash
docker compose up -d
```

This command looks for a `docker-compose.yml` file in your current directory, reads the configuration, and starts up all the services defined in it. The `-d` flag runs everything in "detached" mode (in the background, so you get your terminal back).

When you run this, Docker talks to something called **containerd** - a lower-level process that's responsible for actually starting and stopping individual containers. containerd always runs in a Linux environment. On Mac and Windows, Docker Desktop quietly spins up a Linux VM behind the scenes, and containerd lives inside that. If you're on Windows, this is why you see mysterious "vmmem" processes eating your RAM - that's the Linux VM running Docker's engine room.

If you learn nothing else from this article, remember: `docker compose up -d` in a directory with a `docker-compose.yml` file. That's the incantation.

## What Problem Does Docker Solve?

### The "Works on My Machine" Syndrome

You've probably heard this one. Developer A builds a feature, tests it locally, ships it. Developer B pulls the code, runs it, and... nothing works. Different Node version. Different Python version. Missing system dependency. Wrong database driver.

Docker solves this by letting you define *exactly* what environment your code needs to run.

### The Setup Guide From Hell

Ever joined a project with a 47-step setup guide? "Install PostgreSQL 14.2, then install Redis 7.0, then install this specific version of ImageMagick, then configure your PATH variables, then..."

Docker collapses all of that into: `docker compose up`.

### Environment Consistency

Your code runs on your laptop. It needs to run the same way on your coworker's laptop, on your CI server, and in production. Docker gives you that consistency.

## The Building Blocks

Docker has three main concepts, and they build on each other:

### Dockerfile: The Recipe

A Dockerfile is a text file that describes how to set up an environment. It's a list of instructions:

```dockerfile
# Start with a base image (someone else's pre-configured Linux)
FROM node:20-slim

# Set up your working directory
WORKDIR /app

# Copy your dependency list and install them
COPY package*.json ./
RUN npm ci

# Copy the rest of your code
COPY . .

# Define what command runs when the container starts
CMD ["node", "index.js"]
```

Each line in a Dockerfile is a step. Docker runs these steps in order, from top to bottom.

### Image: The Snapshot

When you "build" a Dockerfile, you get an **image**. An image is a snapshot of a fully-configured environment - all the packages installed, all the files copied, everything ready to go.

```bash
# Build the Dockerfile into an image
docker build -t my-app .
```

Images are immutable. Once built, they don't change. You can share them, store them in registries, and run them on any machine that has Docker installed.

### Container: The Running Instance

When you "run" an image, you get a **container**. This is the actual running process. You can have multiple containers running from the same image - they're independent copies.

```bash
# Run the image as a container
docker run my-app
```

**The relationship:** Dockerfile → (build) → Image → (run) → Container

Think of it this way: a Dockerfile is source code, an image is a compiled binary, and a container is a running process.

## The Docker Runtime

To actually run containers, you need the Docker runtime installed. You have two options:

1. **Docker Desktop** - A GUI application with pretty buttons
2. **Docker CLI** - Command line tools

If you're on Windows, you'll also need WSL (Windows Subsystem for Linux) installed first.

**My recommendation:** Learn the CLI, not the GUI. The Docker Desktop GUI is convenient, but it obscures what's actually happening. When Docker inevitably breaks (and it will), you'll need to understand the CLI commands to debug it. Learning through the GUI is like learning to drive only using a Tesla's autopilot - you'll be useless when you need to actually steer.

## A Real Example: Web Scraping with Playwright

Let's say you want to build a web scraper using Playwright (Microsoft's browser automation tool). Playwright needs actual browsers installed, which is a nightmare to set up manually across different machines.

Here's how Docker makes this trivial:

**Dockerfile:**
```dockerfile
# Use Microsoft's official Playwright image (browsers pre-installed!)
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set up working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy your scraping code
COPY . .

# Run the scraper
CMD ["node", "scrape.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  scraper:
    build: .
    volumes:
      - ./output:/app/output  # Save scraped data to your local machine
```

**To run it:**
```bash
docker compose up
```

That single command works identically on Mac, Windows, and Linux. No browser installation. No driver configuration. No "it works on my machine."

## Dockerfile vs docker-compose.yml

Docker provides two tools to define the runtime for your containers, and there's some overlap between them, so it's important to understand the differences.

### Dockerfile = What Goes In

A Dockerfile defines **what goes INTO a container**:

- What base image to start from (Ubuntu? Node? Python?)
- What packages to install
- What code to copy in
- What the default command should be

Think of it as: **"Here's how to build this thing once."**

The result gets "crystallized" into an image that you can run over and over without rebuilding.

### docker-compose.yml = How It Runs

A docker-compose.yml defines **how to RUN containers**:

- Which containers to start
- What ports to expose
- What environment variables to set
- How containers connect to each other
- What volumes to mount

Think of it as: **"Here's how to run these things together, every time."**

### Why Both?

**Put it in the Dockerfile if:**
- It's something you want "baked in" to the image
- It's build-time setup (installing packages, copying code)
- It makes the image self-contained and portable

**Put it in docker-compose.yml if:**
- It changes between environments (ports, passwords, API keys)
- It's about how containers relate to each other
- It's runtime configuration, not build-time setup

**The principle:** Dockerfiles crystallize actions that run *occasionally* (when you build). Compose files define actions that run *every time* (when you start containers). The more you can bake into the Dockerfile, the faster your containers start.

## Why Your Docker Experiment Probably Failed: Networking

Here's a dirty secret: a huge percentage of Docker experiments fail because of networking. You spin up a container, try to connect to something, and... nothing.

### Docker's Networking Model (Dumbed Way Down)

Imagine your computer is connected to the internet through your home router. Simple enough.

Now imagine you handed down your old laptop to your cousin. It's on your home network (the LAN), and it can also access the internet through the same router. Makes sense.

Docker is like your brother's old laptop that's *also* on the LAN... except by default, it's **not connected to the internet**. It has its own little isolated network. Why? "Security reasons" - invented by people who very much enjoyed having a job debugging this problem over and over for years on end.

### Bridge vs Host Networking

Docker has two main networking modes:

**Bridge networking (default):** Docker creates its own virtual router. Your container connects to Docker's router, and then Docker's router connects to your router. This is "secure" but also a massive pain when you just want your container to talk to the internet.

**Host networking:** Docker plugs directly into *your* router. No middleman. Your container gets the same network access as any other program on your machine.

If you're just learning Docker and want things to work, use host networking:

```yaml
version: '3.8'
services:
  my-app:
    build: .
    network_mode: host  # Skip Docker's network complexity
```

Or from the command line:

```bash
docker run --network host my-app
```

**The tradeoff:** Host networking is less "isolated" and won't work in all environments (notably, it behaves differently on Mac/Windows vs Linux). But when you're learning, it removes an entire category of "why isn't this working" problems.

Once you understand Docker better, you can graduate to bridge networking and learn about port mapping, container-to-container communication, and all that jazz. But for building prototypes? Just use host mode and move on with your life.

## Troubleshooting: When Builds Hang Forever

Your Docker image can fail to build for any number of reasons, and the tricky part is that you might not see helpful output about *why*. This is especially true if an AI agent is building the image for you - it might just report "build failed" or seem to hang indefinitely.

**What a healthy build looks like:** You should see stuff happening regularly in your terminal - packages downloading, files copying, commands executing. If your build just... stops... with no new output for minutes, something is waiting for input that will never come.

One of the most common culprits: **interactive package installers**. Certain Linux packages prompt you for input during installation:

- **`tzdata`** - Asks you to select your timezone (this one is [infamous](https://techoverflow.net/2019/05/18/how-to-fix-configuring-tzdata-interactive-input-when-building-docker-images/))
- **`keyboard-configuration`** - Asks about your keyboard layout
- **`locales`** - Asks about language settings

In a Docker build, there's no one there to answer these prompts, so it just... waits. Forever.

The fix is to set environment variables at the top of your Dockerfile:

```dockerfile
FROM ubuntu:22.04

# Put these near the top of your Dockerfile
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Now package installs won't hang waiting for input
RUN apt-get update && apt-get install -y some-package
```

If you notice a build hanging for a very long time, missing environment variables are a good place to start investigating. This trips up almost everyone at least once.

## Getting Started: The Cheat Sheet

Here are the commands you'll use 90% of the time:

```bash
# Build an image from a Dockerfile
docker build -t my-app .

# Run a container from an image
docker run my-app

# Run with port mapping (access localhost:3000)
docker run -p 3000:3000 my-app

# Start all services defined in docker-compose.yml
docker compose up

# Start in detached mode (background)
docker compose up -d

# Stop all services
docker compose down

# See what's running
docker ps

# See logs from a container
docker logs <container-id>

# When things are broken, nuclear option
docker system prune -a
```

## The Bottom Line

<div style="float: right; margin: 0 0 1rem 1rem; max-width: 350px;">

![Riding the Docker whale](/docker_hulud.jpg)

</div>

Docker is easy to use and hard to master. You can get by for years just running `docker compose up` without understanding what's happening underneath. But building a mental model for how Docker actually works - images, containers, networking, the difference between build-time and run-time - makes you way more effective when things break. And things will break.

Even if you never set up Docker from scratch, understanding these concepts helps you navigate projects that already use it. You'll debug faster, onboard quicker, and finally feel like you're actually riding the whale instead of just hanging on for dear life.

---

*Have questions about Docker, or tips for beginners? Drop a comment below. And if this cleared things up for you, smash that like button - you know you want to see the party parrots.*
