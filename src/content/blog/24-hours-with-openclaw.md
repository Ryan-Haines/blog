---
title: "24 Hours with OpenClaw (Including Sleep)"
description: "Setting up an AI assistant on a Mac Mini that integrates with iMessage - without immediately pwning myself. A practical guide to secure home lab AI."
pubDate: 2026-02-06
tags: ["ai", "automation", "homelab", "macos", "security"]
---

> Setting up an AI assistant on a Mac Mini that integrates with iMessage - without immediately pwning myself.

[OpenClaw](https://openclaw.ai) is the current hotness. An agent for agents, that has access to whatever computing resources you give it - a hacker's dream, and a security nightmare. Here's how I set up OpenClaw without feeling like I've immediately asked myself to become a data point in prompt injection research.

## Why a Mac Mini?

OpenClaw is an agent for agents - meaning that it runs on a PC and has access to everything that PC does - full disk and shell control. You can run this on nearly anything - the hardware requirements are slight enough that people have reported running it successfully on a Raspberry Pi. That's likely a toy use, but an older laptop should also do fine.

A Mac Mini has the nice integration with the Apple ecosystem so that I can text the thing with iMessage. If you don't feel like you need this, any x86 tiny PC will work fine with Telegram/Discord or other messaging apps as the communication gateway.

### Hardware Choices

I went with:
- **32GB RAM** - 16GB feels cramped when developing, and this thing will be running an AI gateway, probably multiple agents, plus whatever else I throw at it
- **1TB storage** - 256GB is oppressively small, 1TB might be overkill, but I'd rather not think about it
- **10GbE NIC** - This is the upgrade I'd recommend the most if you're only getting one. A 10GbE NIC opens up home lab possibilities (NAS integration, media streaming, etc.) that would be too slow over standard gigabit, and I wouldn't recommend adding a dongle NIC later.

Before installing OpenClaw, I isolated the Mac Mini on its own VLAN. If you're running UniFi (or similar), here's the approach:

### Create a Dedicated VLAN

1. Create a new network/VLAN for the Mac Mini
2. **Don't use "Isolate Network"** - that's too restrictive and overrides allow rules
3. Instead, create firewall rules:
   - **Block connection** with VLANs by default
   - **Allow VNC** (port 5900, TCP) from your main network so you can remote in
   - Add more ports later as needed (web dev, etc.)

### VNC Access: Moving the Mac Mini Off Your Desk

From another Mac: **Go → Connect to Server → `vnc://[mac-mini-ip]:5900`**

Windows users can use any VNC client - RealVNC, TightVNC, etc.

If you're certain that the network configuration is correct but you still can't connect to the Mac Mini over VNC, check if you need to refresh the DHCP lease on the Mac Mini itself.

## Data Security Model: Don't Skip This!

You have to decide how you want your OpenClaw agent to be able to act. You could login with your own personal Apple account, give it access to all your calendars, notes, messages, emails and contacts immediately, and have it start performing automations with that data.

I chose to create a new Apple account just for the agent, and give it additional access to my data as needed. This is a rough edge in the setup and I suspect many people will choose to run OpenClaw agents directly under their main Apple ID. Yikes.

I was able to receive messages to the agent immediately after creating the account. iMessage took about 2 hours to allow my new account to send messages.

### FileVault Consideration

If you want the Mac Mini to boot unattended, you'll need to **disable FileVault**. Otherwise it waits for a password at the encryption screen before booting.

If physical access to the machine is a concern, keep FileVault on and accept that you'll need to enter a password after reboots.

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

OpenClaw needs a gateway token. This needs to be added to a config file - Claude can generate it for you. In fact, it's probably simplest to run the above setup script and then run Claude Code and ask it "hey, is my OpenClaw working? Can I send and receive iMessages with it?" - using an LLM to configure OpenClaw is literally what's recommended in the setup docs. Your tools build tools now.

### Full Disk Access

The iMessage integration needs to read `~/Library/Messages/chat.db`. Grant Full Disk Access to Terminal (or whatever terminal app you use):

**System Settings → Privacy & Security → Full Disk Access → add Terminal**

You'll also need to add the Node.js executable so it can interact with the `imsg` CLI:
- Press `Cmd+Shift+G` in the file picker
- Navigate to your Node installation (likely `/opt/homebrew/bin/node` if you used Homebrew)

### API Keys

During the install you'll have the option to select various skills, and you'll need keys for the services you want to use.

### Start the Gateway

To start the gateway (in case your install got interrupted):

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

Make sure you're using a model that actually exists. I initially had `claude-opus-4-6` configured (wishful thinking - maybe next week it will be updated). Change it to `claude-opus-4-5` or `claude-sonnet-4` depending on your needs and budget.

### iMessage Allowlist

OpenClaw uses an allowlist for iMessage - it won't respond to random numbers. You can ask it to add more values to the allowlist.

## The Meta Moment

Here's the funny part: when the gateway wouldn't start, I pointed Claude Code at the OpenClaw troubleshooting docs and had it debug its own hosting environment. The agent found a config issue with the gateway token that I'd missed.

This method is actually what's recommended in the setup docs. Building Claude with Claude. We're through the looking glass.

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

*Total setup time: ~4 hours. Most of that was waiting for iMessage to sync and debugging config issues. Once it's running, it just works. If it can't accomplish something it will tell me what I need to give it access to.*
