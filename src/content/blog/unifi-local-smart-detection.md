---
title: "UniFi Smart Detection Without a ui.com Account"
description: "A local workaround for Protect's Smart Detection agreement gate, without creating a ui.com account or enabling remote access. Unsupported, version-specific, and at your own risk."
pubDate: 2026-10-27
tags: ["unifi", "homelab", "privacy", "ai-writing"]
---

I wanted baby-cry detection on my UniFi G4 Instant. The camera supports it locally, but Protect disabled the Smart Detection checkbox and told me to temporarily enable remote access. I didn't want to create a ui.com account and enable remote management just to sign an agreement for a local feature.

So we patched it.

**At your own risk:** this is an unsupported modification to Protect's installed JavaScript. Updates can overwrite it or break it. Back up the files and affected settings, have a rollback ready, and expect a recording interruption when restarting Protect.

The trick: this backend already understands a `local` agreement status for ordinary Smart Detection and audio detection. Unlocking the checkbox alone wasn't enough: saving still failed because the normal agreement flow needed an owner email to submit acceptance externally.

The workaround had three parts:

1. Remove the checkbox's remote-access requirement, keeping the owner and other agreement checks.
2. Add an explicit local-agreement request and backend handler. Require the owner, remote access off, and the current Smart Detection contract ID/version; store a `local` token using Protect's existing JWT helper and model.
3. Leave face and license-plate recognition off, since they require the external agreement. Restart Protect, hard-refresh the browser, then enable Smart Detection under Legal Permissions and save.

No fake email, cloud login, or remote access. This records a local choice; it doesn't submit acceptance to the external agreement service. The exact edits depend on the installed bundles—don't blindly remove remote-access checks throughout Protect.

**Tested October 27, 2026:** UDM SE, UniFi OS 5.1.33, Protect backend 7.3.70 / frontend 7.3.26, G4 Instant firmware 5.5.31.

The save succeeded and audio detection options appeared. Actual baby-cry events, persistence after a browser reload or subsequent Protect restart, and notifications still need testing. This isn't a claim that every Protect feature works offline.
