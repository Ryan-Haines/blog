---
title: "Freezer Tracker"
description: "Self-hosted freezer inventory app with natural language input and Tailscale sharing. Built entirely via SMS to an AI agent."
pubDate: 2026-02-16
githubUrl: "https://github.com/Ryan-Haines/freezer-tracker"
tags: ["docker", "fastapi", "react", "tailscale", "ai", "homelab", "open-source"]
---

A simple, self-hosted app for tracking what's in your freezer. Add items with natural language, see capacity at a glance, share access with family over Tailscale.

## What It Does

- **Natural language input** — type "2 lbs of chicken thighs" and it parses automatically
- **Capacity estimation** — visual progress bar based on your freezer dimensions, with manual calibration
- **Inline editing** — edit items directly in the table
- **Tailscale sharing** — secure access from any device on your tailnet, no port forwarding

## Stack

FastAPI + React + SQLite, fully containerized with Docker Compose. Zero ongoing cost.

## Read More

[I Built a Freezer Inventory App from My Couch](/blog/freezer-tracker-app)
