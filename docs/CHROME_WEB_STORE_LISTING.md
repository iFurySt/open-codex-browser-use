# Chrome Web Store Listing Draft

This document is the working copy for the first Chrome Web Store Dashboard
submission. Keep it aligned with `apps/chrome-extension/manifest.json` whenever
permissions, host access, or user-visible behavior changes.

## Dashboard Status

Before the CI publish workflow can submit the item for review, the Chrome Web
Store Developer Dashboard still needs:

- A store item created for Open Browser Use.
- Store listing fields completed.
- Privacy practices fields completed.
- A privacy policy URL attached to the developer account or item.
- The service account email added under the Chrome Web Store Developer Dashboard
  Account settings if CI/CD uses `CWS_SERVICE_ACCOUNT_JSON`.
- The resulting Extension ID copied into the `CWS_EXTENSION_ID` GitHub secret.

## Store Listing

Suggested item name:

```text
Open Browser Use
```

Suggested one-line summary:

```text
Connect local AI agents to your own Chrome browser through Open Browser Use.
```

Suggested detailed description:

```text
Open Browser Use is a developer extension for local browser automation. It
connects Chrome to the open-source Open Browser Use native host so approved
local tools and SDKs can create tabs, inspect tab state, execute Chrome DevTools
Protocol commands, observe downloads, and organize agent-controlled tabs.

The extension is intended for developers running Open Browser Use on their own
machine. It does not provide hosted automation, does not include the native host
binary, and requires the user to install and register the Open Browser Use
native messaging host separately.
```

Suggested category:

```text
Developer Tools
```

Suggested language:

```text
English
```

## Privacy Practices

Suggested single purpose:

```text
Open Browser Use lets a locally installed native host and local SDK control
Chrome tabs for developer-owned browser automation workflows.
```

Suggested data use disclosure:

```text
The extension can read tab metadata, browser history entries requested through
the local Open Browser Use API, download events while an automation session is
active, and page content exposed through Chrome DevTools Protocol commands.
This data is sent only to the locally installed Open Browser Use native host
over Chrome Native Messaging. The extension does not send data to an
Open Browser Use cloud service.
```

Suggested data sale / third-party use statement:

```text
Open Browser Use does not sell user data and does not use user data for
advertising, creditworthiness, or unrelated third-party purposes.
```

## Permission Justifications

Use these as the starting point for the Dashboard privacy fields. Keep them
short in the Dashboard if character limits apply.

| Permission | Justification |
| --- | --- |
| `alarms` | Reconnects to the local native host and maintains lightweight heartbeat behavior after the MV3 service worker is suspended. |
| `debugger` | Executes Chrome DevTools Protocol commands for developer-requested browser automation, inspection, navigation, screenshots, and event forwarding. |
| `downloads` | Observes downloads created during an active automation session so the local client can report file activity back to the user. |
| `downloads.ui` | Enables download-related UI behavior for automation sessions when Chrome exposes download activity to the user. |
| `history` | Lets the local client query user history only when a caller explicitly requests history through the Open Browser Use API. |
| `nativeMessaging` | Connects the extension to the locally installed `open-browser-use` native host. This is the primary transport for the product. |
| `scripting` | Injects the cursor content script into agent-controlled tabs so the local client can show and verify cursor movement. |
| `storage` | Persists native host connection status, extension instance id, and active automation session state across MV3 service worker restarts. |
| `tabGroups` | Groups and labels tabs controlled by an automation session so agent-created tabs are visually separated from user tabs. |
| `tabs` | Creates, lists, updates, and identifies Chrome tabs for local browser automation sessions. |
| `<all_urls>` host access | Allows the local Open Browser Use client to automate pages chosen by the user across arbitrary origins, including injecting the cursor script and attaching CDP where Chrome permits it. |

## Native Host Boundary

The Chrome Web Store package contains only the MV3 extension. Users must install
the native host separately and register it with the final Web Store extension ID:

```bash
open-browser-use install-manifest \
  --extension-id <chrome-web-store-extension-id> \
  --path /path/to/open-browser-use
```

## Dashboard Checklist

- Upload or select the `v0.1.3` extension package from
  `open-browser-use-chrome-extension-0.1.3.zip`.
- Add at least one screenshot that shows the extension popup or a local
  Open Browser Use automation session.
- Confirm the listing text matches the current native host requirement.
- Fill all permission justifications from the current manifest.
- Confirm privacy disclosures match the privacy policy URL.
- Save the item and copy Publisher ID and Extension ID into GitHub secrets.
