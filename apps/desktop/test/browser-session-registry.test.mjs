import assert from "node:assert/strict";
import test from "node:test";

import { BrowserSessionRegistry } from "../dist-main/main/browser-session-registry.js";

test("captures a route and registers one selected tab per window conversation", () => {
  const registry = new BrowserSessionRegistry();
  registry.captureRoute(7, {
    conversationId: "thread-1",
    url: "https://example.com"
  });

  const first = registry.registerPage(7, 11, "thread-1");
  const second = registry.registerPage(7, 11, "thread-1");

  assert.equal(first.id, second.id);
  assert.equal(first.routeKey, "7:thread-1");
  assert.equal(first.pageKey, "11:thread-1");
  assert.equal(first.url, "https://example.com");
  assert.deepEqual(registry.getSelectedTab(7, "thread-1")?.id, first.id);
});

test("attaches and detaches guest webContents for a tab", () => {
  const registry = new BrowserSessionRegistry();
  registry.captureRoute(7, {
    conversationId: "thread-1",
    url: "about:blank"
  });

  const webContents = {
    id: 42,
    getTitle: () => "Example Domain",
    getURL: () => "https://example.com/"
  };

  const tab = registry.attachGuestWebContents(7, 11, "thread-1", webContents);
  assert.equal(tab.guestWebContentsId, 42);
  assert.equal(tab.title, "Example Domain");
  assert.equal(tab.url, "https://example.com/");
  assert.equal(registry.getTab(tab.id)?.webContents, webContents);

  registry.detachGuestWebContents(42);
  assert.equal(registry.getTab(tab.id)?.guestWebContentsId, null);
  assert.equal(registry.getTab(tab.id)?.webContents, null);
});

test("keeps same conversation isolated by BrowserWindow id", () => {
  const registry = new BrowserSessionRegistry();
  registry.captureRoute(1, {
    conversationId: "thread-1",
    url: "https://one.example"
  });
  registry.captureRoute(2, {
    conversationId: "thread-1",
    url: "https://two.example"
  });

  const firstWindowTab = registry.registerPage(1, 10, "thread-1");
  const secondWindowTab = registry.registerPage(2, 20, "thread-1");

  assert.notEqual(firstWindowTab.id, secondWindowTab.id);
  assert.equal(firstWindowTab.routeKey, "1:thread-1");
  assert.equal(secondWindowTab.routeKey, "2:thread-1");
  assert.equal(registry.getSelectedTab(1, "thread-1")?.id, firstWindowTab.id);
  assert.equal(registry.getSelectedTab(2, "thread-1")?.id, secondWindowTab.id);
});

test("releases route and window mappings", () => {
  const registry = new BrowserSessionRegistry();
  registry.captureRoute(1, {
    conversationId: "thread-1",
    url: "about:blank"
  });
  registry.captureRoute(1, {
    conversationId: "thread-2",
    url: "about:blank"
  });

  const first = registry.registerPage(1, 10, "thread-1");
  const second = registry.registerPage(1, 10, "thread-2");

  registry.releaseRoute(1, "thread-1");
  assert.equal(registry.getTab(first.id), null);
  assert.equal(registry.getTab(second.id)?.id, second.id);

  registry.releaseWindow(1);
  assert.equal(registry.getTab(second.id), null);
  assert.deepEqual(registry.listTabs(), []);
});

test("scopes active turn route access to its selected tab", () => {
  const registry = new BrowserSessionRegistry();
  registry.captureRoute(1, {
    conversationId: "thread-1",
    url: "about:blank"
  });
  registry.captureRoute(2, {
    conversationId: "thread-1",
    url: "about:blank"
  });
  const firstWindowTab = registry.registerPage(1, 10, "thread-1");
  const secondWindowTab = registry.registerPage(2, 20, "thread-1");

  registry.captureTurnRoute(1, {
    conversationId: "thread-1",
    turnId: "turn-1",
    url: "about:blank"
  });

  assert.doesNotThrow(() => {
    registry.assertTurnCanAccessTab("thread-1", "turn-1", firstWindowTab.id);
  });
  assert.throws(() => {
    registry.assertTurnCanAccessTab("thread-1", "turn-1", secondWindowTab.id);
  }, /cannot access tab/);
  assert.throws(() => {
    registry.assertTurnCanAccessTab("thread-1", "turn-2", firstWindowTab.id);
  }, /No active browser route/);

  registry.releaseTurnRoute("thread-1", "turn-1");
  assert.doesNotThrow(() => {
    registry.assertTurnCanAccessTab("thread-1", "turn-2", firstWindowTab.id);
  });
});
