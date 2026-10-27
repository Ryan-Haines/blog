---
title: "UniFi Smart Detection Without a ui.com Account"
description: "A local workaround for Protect's Smart Detection agreement gate, without creating a ui.com account or enabling remote access. Unsupported, version-specific, and at your own risk."
pubDate: 2026-10-27
tags: ["unifi", "homelab", "privacy", "ai-writing"]
---

I wanted baby-cry detection on my UniFi G4 Instant. The camera supports it locally, but Protect disabled the Smart Detection checkbox and told me to temporarily enable remote access. I didn't want to create a ui.com account and enable remote management just to sign an agreement for a local feature.

**At your own risk:** this is an unsupported modification to Protect's installed JavaScript. Updates can overwrite it or break it. Restarting Protect briefly interrupts recording. Have a verified backup of your Protect settings as well as the files below before proceeding.

**Tested October 27, 2026:** UDM SE, UniFi OS 5.1.33, Protect backend 7.3.70 / frontend 7.3.26, G4 Instant firmware 5.5.31. These are literal edits for those specific files, not a universal installer.

The trick: this backend already understands a `local` agreement status for ordinary Smart Detection and audio detection. Unlocking the checkbox alone wasn't enough—the normal save still needed an owner email to submit acceptance externally. The patch adds an explicit local path while retaining owner authorization and leaving face/license-plate recognition restricted.

## 1. SSH in and back up

Enable console SSH in UniFi OS, then connect from your computer using your console's LAN IP:

```sh
ssh root@YOUR_CONSOLE_IP
```

On the console, locate the files and make working copies:

```sh
cd /usr/share/unifi-protect/app
protect_ui=node_modules/@ubnt/unifi-protect-ui-internal/dist/swai-7.3.26.js
protect_work="/data/protect-local-$(date +%Y%m%dT%H%M%S)"
mkdir -m 700 "$protect_work"
cp -a service.js "$protect_work/service.js.original"
cp -a "$protect_ui" "$protect_work/swai-7.3.26.js.original"
cp -a "$protect_work/service.js.original" "$protect_work/service.js"
cp -a "$protect_work/swai-7.3.26.js.original" "$protect_work/swai-7.3.26.js"
printf 'Keep this backup path: %s\n' "$protect_work"
ls -l service.js* "$protect_ui"*
```

Keep that backup path. If either asset has a `.gz` or `.br` sibling, stop: compressed assets need separate handling or the browser may receive the old code. Also confirm Protect's installed manifest selects this frontend entry; don't patch every bundle.

Verify the original files match the ones tested here:

```sh
sha256sum -c <<'HASHES'
b2dbea8740a201826b66d427e26cc428651751fcf1c4bda6de9b26765e558c16  service.js
0ffb0344d673a7f6e04703e1ae6695b77d65d07ba16886cb06956e2581e5cff4  node_modules/@ubnt/unifi-protect-ui-internal/dist/swai-7.3.26.js
HASHES
```

**Both must report OK.** If not, stop and inspect your own installed code. Version labels alone aren't enough.

## 2. Apply these exact replacements

Edit the working copies in `$protect_work`, **not the installed originals**. For example:

```sh
vi "$protect_work/service.js"
vi "$protect_work/swai-7.3.26.js"
```

Use literal find/replace, not regular expressions. Each **Find** string must occur exactly once in its file. If it doesn't, stop. Minified variable names are specific to this build.

### Backend: `service.js`

This adds a local-agreement branch after the existing owner check. It requires remote access to be off, the Smart Detection agreement type, an agreed action, and matching current contract ID/version. It uses Protect's existing JWT helper and model to save `local`; it does not submit acceptance to the external service.

**Find:**

```js
if(!m||!(m in s.IRONCLAD_TYPES))return{status:400};const g=(0,s.getUniqueDeviceId)(t,m);
```

**Replace with:**

```js
if(!m||!(m in s.IRONCLAD_TYPES))return{status:400};if(!0===e.body.localAgreement){const r=t.nvr;if(!r)return{status:500};const a=r.agreements.smartDetectAgreement;if(!1!==r.isRemoteAccessEnabled||m!==s.IRONCLAD_TYPES.smartDetection||e.body.status!==s.ET_STATUS.agreed||u!==a.actualContract||p!==a.actualVersion)return{status:400};const l=await(0,n.jwtSignAsync)({data:{status:"local"},secret:(0,s.getNvrDeviceId)(t)});if(!l)return{status:500};return r.update({smartDetectAgreement:{lastUpdateAt:Date.now(),status:o.STATUS.AGREED}}),r.agreements.smartDetectAgreement.data=l,r.dirtyAttributes.push("agreements"),await r.save(),c.info("Saved local Smart Detection agreement with Remote Access disabled"),await(0,i.publish)("agreements.check"),{status:200,data:{status:"local",localAgreement:!0}}}const g=(0,s.getUniqueDeviceId)(t,m);
```

### Frontend: `swai-7.3.26.js`

**A. Unlock the checkbox while keeping the owner and other agreement checks.**

Find:

```js
x=!T&&!w||!r?.isOwner||!s,N=
```

Replace with:

```js
x=!T&&!w||!r?.isOwner,N=
```

**B. Allow the agreement API call to request local acceptance.**

Find:

```js
setAgreement(e,a,r,n){let i=this.buildUrl("/ironclad/sendAcceptance");return this.fetch(i,{body:{cid:e,vid:a,status:r,type:n},method:"POST"})}
```

Replace with:

```js
setAgreement(e,a,r,n,l=!1){let i=this.buildUrl("/ironclad/sendAcceptance");return this.fetch(i,{body:{cid:e,vid:a,status:r,type:n,...l?{localAgreement:!0}:{}},method:"POST"})}
```

**C. Request that local path when remote access is off.**

Find:

```js
await e?.api.setAgreement(n.actualContract,n.actualVersion,"agreed")
```

Replace with:

```js
await e?.api.setAgreement(n.actualContract,n.actualVersion,"agreed",void 0,!e?.isRemoteAccessEnabled)
```

**D. Leave face and license-plate recognition off for local use.** Their backend restrictions remain intact.

Find:

```js
a?.smartDetection.enable||(e?p("nvr.smartDetection",{enable:!0,faceRecognition:!0,licensePlateRecognition:!0,precision:"auto"}
```

Replace with:

```js
a?.smartDetection.enable||(e?p("nvr.smartDetection",{enable:!0,faceRecognition:s,licensePlateRecognition:s,precision:"auto"}
```

## 3. Check, install, and enable

Check both working copies before installing. **Do not proceed if either command fails:**

```sh
/usr/bin/node24 --check "$protect_work/service.js"
/usr/bin/node24 --check "$protect_work/swai-7.3.26.js"
```

In the same SSH session, install the files with their preserved ownership and permissions, then restart Protect:

```sh
cp -a "$protect_work/service.js" service.js &&
cp -a "$protect_work/swai-7.3.26.js" "$protect_ui" &&
systemctl restart unifi-protect
systemctl is-active unifi-protect
```

Once Protect is active, hard-refresh your browser, sign in as the local owner, and enable **Smart Detection** under **Legal Permissions**. Save, then look for your camera's audio detection options. Leave remote access disabled throughout.

Our save succeeded and audio detection options appeared, without a ui.com account or fake email. **Still to test:** selecting/saving Baby Crying, actual detection events, persistence after a browser reload and subsequent Protect restart, and notifications. Don't assume native phone push works with remote access off, or that every Protect feature is offline.

## Undoing the file changes

In the same session (or set `protect_work` to your saved backup path first):

```sh
cd /usr/share/unifi-protect/app
systemctl stop unifi-protect &&
cp -a "$protect_work/service.js.original" service.js &&
cp -a "$protect_work/swai-7.3.26.js.original" node_modules/@ubnt/unifi-protect-ui-internal/dist/swai-7.3.26.js &&
systemctl start unifi-protect
```

Then hard-refresh the browser. This restores **code only**; it does not undo saved Smart Detection/agreement settings. Restoring those requires your pre-change settings backup. If a copy fails after stopping Protect, resolve it before restarting. Disable SSH again if you enabled it only for this change.
