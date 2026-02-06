---
title: "24 Hours with ClaudeBot (Including Sleep)"
description: "Setting up an AI assistant on a Mac Mini that integrates with iMessage - without immediately pwning myself. A practical guide to secure home lab AI."
pubDate: 2026-02-06
tags: ["ai", "automation", "homelab", "macos", "security"]
---

I wanted an AI assistant I could text. Not through some app, not through a web interface - just iMessage. After 24 hours (including sleep), I had a Claude-powered bot running on a Mac Mini that I can message from my phone. Here's how I set it up without compromising my home network.

## Why a Mac Mini?

The [OpenClaw](https://openclaw.ai) project caught my attention because it integrates directly with iMessage. That's the killer feature - no special apps, no browser tabs, just text your AI like you'd text a friend.

Running it locally on a Mac Mini has advantages over a VPS:
- **iMessage integration** requires macOS
- **No ongoing VPS maintenance** - it's my hardware, my responsibility, but also my control
- **Home lab possibilities** - once it's on your network, it can do things cloud services can't

### Hardware Choices

I went with:
- **32GB RAM** - 16GB feels cramped when developing, and this thing will be running an AI gateway plus whatever else I throw at it
- **1TB storage** - 256GB is oppressively small, 1TB might be overkill, but I'd rather not think about it
- **10GbE NIC** - This is the upgrade I'd recommend if you're only getting one. Opens up home lab possibilities (NAS integration, media streaming, etc.) that would be too slow over standard gigabit

## Network Security: Don't Skip This

Before installing anything AI-related, I isolated the Mac Mini on its own VLAN. If you're running UniFi (or similar), here's the approach:

### Create a Dedicated VLAN

1. Create a new network/VLAN for the Mac Mini
2. **Don't use "Isolate Network"** - that's too restrictive
3. Instead, create firewall rules:
   - **Block inbound** from other VLANs by default
   - **Allow VNC** (port 5900, TCP) from your main network so you can remote in
   - Add more ports later as needed (web dev, etc.)

### VNC Access

From another Mac: **Go → Connect to Server → `vnc://[mac-mini-ip]:5900`**

Windows users can use any VNC client - RealVNC, TightVNC, etc.

### The DHCP Gotcha

I configured a static IP in UniFi but the Mac Mini didn't pick it up. The fix: **refresh the DHCP lease on the Mac Mini itself**.

Network settings in UniFi aren't pushed to devices automatically - they're pulled when the device renews its lease. This explains every "why won't my static IP work" problem I've ever had. Go to System Settings → Network → your connection → Details → TCP/IP → Renew DHCP Lease.

## macOS Setup

### Fresh Apple Account

Create a new Apple ID for the Mac Mini. A few gotchas:
- **Verify your email** - iMessage won't activate without it
- **iMessage sync takes ~2 hours** - be patient
- **Apple's password prompts are chaotic** - sometimes it asks for your Apple ID password, sometimes your local account password, even when you'd expect the other. I don't understand the logic. Just try both.

### FileVault Consideration

If you want the Mac Mini to boot unattended (stuffed in a closet, reboots after power outages), you'll need to **disable FileVault**. Otherwise it waits for a password at the encryption screen before booting.

Evaluate your threat model. If physical access to the machine is a concern, keep FileVault on and accept that you'll need to enter a password after reboots.

## Installing OpenClaw

The [OpenClaw docs](https://docs.openclaw.ai) are solid, but here's the actual sequence that worked:

### Prerequisites

```bash
brew install node imsg
```

The `imsg` package is what enables iMessage integration. Don't skip it.

### Install OpenClaw

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

### The Gateway Token

OpenClaw needs a gateway token. Add this to your shell config:

```bash
echo "export OPENCLAW_GATEWAY_TOKEN=$(openssl rand -hex 32)" >> ~/.zshrc
source ~/.zshrc
```

### Full Disk Access

The iMessage integration needs to read `~/Library/Messages/chat.db`. Grant Full Disk Access to Terminal (or whatever terminal app you use):

**System Settings → Privacy & Security → Full Disk Access → add Terminal**

You'll also need to add the Node.js executable so it can interact with the `imsg` CLI:
- Press `Cmd+Shift+G` in the file picker
- Navigate to your Node installation (likely `/opt/homebrew/bin/node` if you used Homebrew)

### API Keys

You'll need keys for the services you want to use:
- **Anthropic** (required) - for Claude
- **ElevenLabs** (optional) - for voice
- **Google Places** (optional) - for location queries
- Others as needed

For Anthropic specifically: you need an **API key with billing credits**, not just a Claude Pro subscription. They're separate products. Go to [console.anthropic.com](https://console.anthropic.com) to set up API access.

### Start the Gateway

```bash
openclaw gateway --port 18789
```

You should see output like:
```
[gateway] agent model: anthropic/claude-opus-4-5
[gateway] listening on ws://127.0.0.1:18789
[imessage] [default] starting provider (imsg)
```

## Configuration

The config lives at `~/.openclaw/openclaw.json`. A few things to check:

### Model Selection

Make sure you're using a model that actually exists. I initially had `claude-opus-4-6` configured (wishful thinking). Change it to `claude-opus-4-5` or `claude-sonnet-4` depending on your needs and budget.

### iMessage Allowlist

OpenClaw uses an allowlist for iMessage - it won't respond to random numbers. Add your phone number:

```json
{
  "imessage": {
    "allowlist": ["+1XXXXXXXXXX"]
  }
}
```

## The Meta Moment

Here's the funny part: when the gateway wouldn't start, I pointed Claude Code at the OpenClaw troubleshooting docs and had it debug its own hosting environment. The agent found a config issue with the gateway token that I'd missed.

Building Claude with Claude. We're through the looking glass.

## What's Next

Once you're texting your bot, the possibilities open up:
- Home automation triggers
- Calendar and email integration  
- Web research on demand
- Code assistance from your phone
- Whatever else you can dream up

I had it build me an entire webapp with authentication the same day I set it up. But that's a post for another time.

---

**Links:**
- [OpenClaw](https://openclaw.ai) - The project that makes this possible
- [OpenClaw Docs](https://docs.openclaw.ai) - Setup guides and configuration
- [OpenClaw Discord](https://discord.com/invite/clawd) - Community support
- [Anthropic Console](https://console.anthropic.com) - API key management
- [imsg](https://github.com/wunderwuzzi23/imsg) - The iMessage CLI tool

*Total setup time: ~4 hours of active work, spread across 24 hours. Most of that was waiting for iMessage to sync and debugging config issues. Once it's running, it just works.*
