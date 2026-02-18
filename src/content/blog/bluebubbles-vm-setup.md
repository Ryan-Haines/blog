---
title: "Fixing OpenClaw's Amnesia: A BlueBubbles DM History Bug"
description: "How setting up BlueBubbles in a macOS VM led to discovering — and fixing — a bug where OpenClaw's agent lost all conversation context in DMs after every session reset."
pubDate: 2026-02-18
tags: ["openclaw", "bluebubbles", "imessage", "macos", "open-source", "debugging"]
---

I gave my OpenClaw agent iMessage superpowers. Then it forgot every conversation we ever had.

I'd upgraded from `imsg` to BlueBubbles, restarted the gateway, and watched my agent respond with zero context — as if we'd never spoken. `history_count: 0`. Every DM, every restart. Total amnesia. Turns out OpenClaw's BlueBubbles channel never backfilled DM history. Group chats worked fine. DMs were silently broken.

<img src="/images/lobsterBubbles.jpeg" alt="BlueBubbles — literally" width="400" />

## The Upgrade

OpenClaw supports two iMessage backends. `imsg` is the simple one — it works, it's easy. BlueBubbles is the full experience: typing indicators, read receipts, reactions, message effects. The catch is BlueBubbles needs SIP disabled for its Private API, and disabling SIP on your main machine is a non-starter.

The solution: run BlueBubbles in a macOS VM. Your host stays locked down, the VM handles the messy parts. I used Apple's Virtualization.framework via `macosvm` — lightweight, ~4GB RAM, runs headless. Install macOS, sign into iCloud, install BlueBubbles, disable SIP inside the VM, enable Private API, set up a webhook tunnel back to the OpenClaw gateway. Standard stuff, [well-documented](https://docs.bluebubbles.app/private-api/installation).

Within an hour I had my agent sending iMessages with balloon effects and seeing typing indicators. It felt like a real upgrade.

Then I restarted the gateway.

## The Bug

After restart, something was off. The agent responded to messages with zero context. It didn't know what we'd been talking about five minutes ago. I checked the inbound metadata:

```json
{
  "history_count": 0
}
```

Zero. Every DM, every time, after every session reset. The agent was starting fresh with no conversation history.

I dug into OpenClaw's source. The history backfill code — the part that fetches recent messages from the channel API so the agent has context — only ran for group chats. It checked `isGroup` / `isRoomish` and skipped DMs entirely. The `dmHistoryLimit` config option existed but was only used to limit in-memory session turns. It never triggered an API fetch.

Every other OpenClaw channel (Telegram, Discord, Signal, Slack) handles this correctly. BlueBubbles was the outlier.

## The Fix

The fix was straightforward: [PR #20302](https://github.com/openclaw/openclaw/pull/20302).

I created a new `history.ts` module that fetches message history from the BlueBubbles REST API for both groups and DMs. It tries multiple endpoint patterns for compatibility across BlueBubbles server versions:

```
/api/v1/chat/{chatGuid}/messages?limit={limit}&sort=DESC
/api/v1/messages?chatGuid={chatGuid}&limit={limit}
/api/v1/chat/{chatGuid}/message?limit={limit}
```

Then wired it into `processMessage` in `monitor-processing.ts` — before `finalizeInboundContext` gets called, it fetches history respecting `historyLimit` (groups) and `dmHistoryLimit` (DMs), and passes it as `InboundHistory` in the context payload. Errors fail gracefully to empty history.

After the fix:

```json
{
  "history_count": 25
}
```

The agent remembers. Conversations persist across restarts. It knows what you said yesterday.

## The VM Setup (Quick Version)

For anyone who wants the full BlueBubbles experience without compromising their host:

1. **Create a macOS VM** — `macosvm` or UTM, ~80GB disk, 4GB RAM, 2 CPUs
2. **Sign into iCloud** in the VM, verify iMessage works
3. **Install BlueBubbles** — skip Firebase (optional), set a server password, use LAN URL
4. **Disable SIP in the VM** — boot recovery, `csrutil disable`, reboot. Host SIP stays on.
5. **Enable Private API** — follow [BlueBubbles docs](https://docs.bluebubbles.app/private-api/installation), grant Full Disk Access + Accessibility
6. **SSH tunnel** — reverse tunnel from host to VM so `localhost:18789` reaches the gateway. Add webhook URL in BlueBubbles settings.
7. **Update OpenClaw config** — enable `bluebubbles` channel, disable old `imessage`, restart
8. **Keep Messages.app alive** — LaunchAgent with AppleScript poke every 5 minutes

Total footprint: ~4GB RAM, ~50GB disk. Your host stays secure.

## Why This Matters

This bug was invisible until you restarted. Everything worked during a session — the agent had context from the live conversation. But the moment the session reset (gateway restart, config change, timeout), the agent lost all DM history. Group chats were fine. Only DMs were affected.

It's the kind of bug that erodes trust slowly. The agent seems less capable, less aware. You might not even realize it's a bug — you might just think the AI isn't great at maintaining context. But it's not a model problem. It's a plumbing problem. The context was never being fetched.

If you're running OpenClaw with BlueBubbles, update to pick up the fix. If you're considering the switch from `imsg`, the VM approach gives you the full iMessage experience without compromising your host. And now, your agent actually remembers talking to you.

[PR #20302](https://github.com/openclaw/openclaw/pull/20302) · [Issue #20296](https://github.com/openclaw/openclaw/issues/20296)
