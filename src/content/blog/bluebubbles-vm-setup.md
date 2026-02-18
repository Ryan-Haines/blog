---
title: "From imsg to BlueBubbles: Secure iMessage for OpenClaw in a macOS VM"
description: "How to upgrade your OpenClaw iMessage integration from imsg to BlueBubbles without disabling SIP — using a lightweight macOS VM."
pubDate: "Feb 18 2026"
tags: ["openclaw", "bluebubbles", "imessage", "macos", "vm"]
---

OpenClaw supports two iMessage backends: `imsg` (basic, easy setup, great for getting started) and BlueBubbles (typing indicators, read receipts, reactions, message effects — the full iMessage experience). The catch: BlueBubbles needs SIP disabled for its Private API. Disabling SIP on your main machine is scary. Solution: run it in a macOS VM.

## The Setup

### 1. Create a macOS VM

Use `macosvm` (a CLI wrapper around Apple's Virtualization.framework) or UTM. Create a VM with ~80GB disk (room for macOS updates), 4GB RAM, 2 CPUs. Install from an IPSW restore image (macOS 26.3 Tahoe or latest). Total footprint: ~4GB RAM.

### 2. Initial VM Setup

Complete the macOS setup wizard. Sign into iCloud with your agent's Apple ID (this is the identity your agent will message from). Verify iMessage works in Messages.app.

### 3. Install BlueBubbles

Download from https://bluebubbles.app. Do the basic setup — you can skip Firebase (it's optional, only needed for push notifications to the BlueBubbles mobile app). Set a server password. Choose LAN URL as proxy service.

### 4. Disable SIP in the VM

Shut down the VM. Boot into Recovery Mode (boot with `--recovery` flag, select Options → Utilities → Terminal). Run `csrutil disable`. Reboot. Your host machine's SIP stays untouched.

### 5. Enable Private API

Follow BlueBubbles Private API setup: https://docs.bluebubbles.app/private-api/installation — this involves running a sudo command to install the helper. Grant Full Disk Access + Accessibility permissions to BlueBubbles.

### 6. Connect the Webhook

Set up an SSH reverse tunnel from host to VM so the VM's localhost:18789 reaches the OpenClaw gateway. In BlueBubbles webhook settings, add `http://127.0.0.1:18789/bluebubbles-webhook?password=YOUR_BB_PASSWORD`. This lets BlueBubbles push incoming messages to OpenClaw.

### 7. Update OpenClaw Config

In `openclaw.json`: enable the `bluebubbles` channel with serverUrl pointing to the VM's IP, set the password, configure webhook path. Disable the old `imessage` channel. Update bindings to route through `bluebubbles`. Restart the gateway.

### 8. Keep Messages.app Alive

In headless/VM setups, Messages.app can go idle. Set up a LaunchAgent that pokes Messages every 5 minutes via AppleScript (OpenClaw docs have the exact script).

## Why This Matters

You get the full iMessage experience (typing indicators, reactions, read receipts, message effects) while keeping SIP enabled on your host. The VM is sandboxed — if anything goes wrong, you can snapshot/restore. Total cost: ~4GB RAM and ~50GB disk.

The VM approach gives you the best of both worlds: BlueBubbles' rich feature set without compromising your main system's security posture. Your OpenClaw agent can send messages with effects, see when people are typing, and react to messages — all while your host machine stays locked down.

For production setups, consider automating VM startup/shutdown based on OpenClaw gateway status. The VM only needs to run when your agent is actively messaging.