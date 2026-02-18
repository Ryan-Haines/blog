---
title: "Fixing OpenClaw's Amnesia: A BlueBubbles DM History Bug"
description: "How setting up BlueBubbles in a macOS VM led to discovering — and fixing — a bug where OpenClaw's agent lost all conversation context in DMs after every session reset."
pubDate: 2026-02-18
tags: ["openclaw", "bluebubbles", "imessage", "macos", "open-source", "debugging"]
---

I gave my OpenClaw agent iMessage superpowers. Then it forgot every conversation we ever had.

I'd upgraded from `imsg` to BlueBubbles, restarted the gateway, and watched my agent respond with zero context — as if we'd never spoken. `history_count: 0`. Every DM, every restart. Total amnesia. Turns out OpenClaw's BlueBubbles channel never backfilled DM history. Group chats worked fine. DMs were silently broken.

## The Upgrade

<img src="/images/lobsterBubbles.jpeg" alt="BlueBubbles — literally" class="float-right-img" />

OpenClaw supports two iMessage backends. `imsg` is the simple one — it works, it's easy. BlueBubbles is the full experience: typing indicators, read receipts, reactions, message effects. The catch is BlueBubbles needs SIP disabled for its Private API, and disabling SIP on your main machine is not only an incredibly bad idea, it will also disable your ability to run any macOS applications. So don't do it!

The solution: run BlueBubbles in a macOS VM. Your host stays locked down, the VM handles the messy parts. I used Apple's Virtualization.framework via `macosvm` — lightweight, ~4GB RAM, runs headless. Install macOS, sign into iCloud, install BlueBubbles, disable SIP inside the VM, enable Private API, set up a webhook tunnel back to the OpenClaw gateway. Standard stuff, [well-documented](https://docs.bluebubbles.app/private-api/installation).

Within an hour I had my agent sending iMessages with balloon effects and seeing typing indicators. It felt like a real upgrade.

Then I restarted the gateway. Chatted a bit more — everything seemed fine. Then I asked the agent to write up what we'd just accomplished together. Set up a VM, configured BlueBubbles, wired it into OpenClaw.

It had no idea what I was talking about.

## The Bug

The agent couldn't write about what it had just done because it had no memory of doing it. I checked the inbound metadata:

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

I had an idea for an upgrade, and the implementation went exactly as expected — BlueBubbles worked, the VM was solid, iMessage flowed through. But OpenClaw's BlueBubbles support was still young, and there was a bug lurking in a part of the system I wasn't focused on.

It wasn't immediately obvious. The bug only surfaced through more experimentation — chatting after a restart, then asking the agent to write up what we'd just done together. That's when the blank stare hit. The context was never being fetched for DMs after a session reset.

There's a lot of value in not just implementing a setup, but actually living with it and pushing the edges. Docs and changelogs don't catch everything. Sometimes it takes a real person running into the wall to find the crack.

[PR #20302](https://github.com/openclaw/openclaw/pull/20302) · [Issue #20296](https://github.com/openclaw/openclaw/issues/20296)
