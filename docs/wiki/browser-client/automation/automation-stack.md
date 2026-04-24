# Automation Stack

## Short Answer

The browser is operated primarily through CDP. Playwright is used for injected
selector and locator semantics, not as an external Playwright browser process.

## CDP Layer

Most browser effects route through the backend `executeCdp` method. The client
attaches to a tab, then sends Chrome DevTools Protocol commands such as:

- `Input.dispatchMouseEvent`
- `Input.dispatchKeyEvent`
- `Page.navigate`
- `Page.reload`
- `Page.getNavigationHistory`
- `Page.navigateToHistoryEntry`
- `Page.captureScreenshot`
- `Runtime.evaluate`

The client also listens for CDP-originated events through the backend event
channel, including page load, navigation, console, and exception events.

## Playwright Selector Layer

The client embeds Playwright's injected selector runtime and evaluates it inside
the target page. The injected global is:

```text
window.__codexPlaywrightInjected
```

Locator operations use that injected runtime to parse selectors, find elements,
inspect text/attributes/state, and compute useful points.

The click path still becomes CDP input:

1. Resolve locator in page JavaScript.
2. Compute a target point, usually near the element center.
3. Dispatch mouse input through CUA/CDP.

## CUA Layer

CUA commands are high-level mouse, keyboard, scroll, drag, and screenshot
operations. They are implemented with CDP input and page evaluation helpers.

Examples:

- `cua_click` -> mouse move/down/up CDP events.
- `cua_type` -> key/text input events.
- `cua_scroll` -> wheel input events.
- `cua_get_visible_screenshot` -> screenshot capture from the active tab.

## Chrome Ownership

The client does not start a Chrome process. In Chrome mode it connects to a
Chrome extension/native-host style backend and operates tabs exposed by that
backend. Features like `browser_user_claim_tab` indicate it can claim user tabs
from that Chrome backend.

IAB mode is different: it connects to the Codex in-app browser backend selected
by matching Codex session metadata.

