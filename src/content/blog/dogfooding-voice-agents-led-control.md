---
title: "Dogfooding a Voice Agent to Build Its Own LED Status Feature"
description: "I built a local voice transcription tool, then used a voice agent to build a feature that shows recording state via LED. Here's what happened."
pubDate: 2026-01-30
tags: ["voice", "ai", "automation", "whisper", "open-source"]
---

I built a voice transcription tool for Windows. Then I used it to talk to an AI agent that built a new feature for the tool itself.

## The Project: Windows AHK Dictate

Press a button, speak, get text. Runs entirely on your machine using Whisper. No API keys, no subscriptions, no data leaving your computer.

[Windows AHK Dictate](https://github.com/Ryan-Haines/windows-ahk-dictate) works with any mouse or keyboard that lets you bind buttons to keystrokes - Logitech G HUB, Razer Synapse, whatever. Press the button, speak, press again, and the transcribed text appears wherever your cursor is. Double-click to end and immediately submit - useful for agent chat.

## The Ask: LED State Feedback

Once the basic tool was working, I wanted visual feedback. The G502 has RGB LEDs, and I wanted them to show recording state - idle, recording, processing.

## What the Agent Did

I described what I wanted and let the agent figure it out:

1. **Dialed into the Logitech LED SDK** - Found the right DLLs and figured out how to interface with them
2. **Queried hardware identifiers** - Found my specific G502 among all connected Logitech hardware
3. **Traced through C headers** - The LED SDK isn't well-documented. The agent worked out the function signatures from header files
4. **One-shot programmatic LED control** - Direct control over the LED state, not just preset profiles
5. **Wired it to Whisper** - Connected LED state changes to the transcription service lifecycle

High-level request to low-level hardware integration. One session.

## RDP Support

I wanted this to work over RDP so I could transcribe on my home server from anywhere. By leveraging the Interception driver package, input gets captured at a low enough level that it works seamlessly over RDP.

I could have evaluated existing tools that might half-meet my needs. Instead, I just built one.

## Try It

The project is open source: [Windows AHK Dictate on GitHub](https://github.com/Ryan-Haines/windows-ahk-dictate)

Works with other mice and keyboards too - the G502 LED integration is a bonus. Private voice transcription that works over RDP.

---

*Building something cool with local AI tools? Drop a comment.*
