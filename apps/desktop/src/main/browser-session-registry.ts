import type { WebContents } from "electron";

import type { BrowserRoute, BrowserTurnRoute } from "../shared/contracts.js";

export type BrowserTabRecord = {
  id: number;
  routeKey: string;
  pageKey: string;
  conversationId: string;
  windowId: number;
  ownerWebContentsId: number;
  guestWebContentsId: number | null;
  webContents: WebContents | null;
  title: string;
  url: string;
  active: boolean;
  attachedAt: number | null;
  updatedAt: number;
};

type RouteState = {
  conversationId: string;
  windowId: number;
  url: string;
  updatedAt: number;
};

export class BrowserSessionRegistry {
  #nextTabId = 1;
  #routesByKey = new Map<string, RouteState>();
  #tabsById = new Map<number, BrowserTabRecord>();
  #tabIdsByPageKey = new Map<string, number>();
  #routeKeysByTabId = new Map<number, string>();
  #selectedTabIdsByRouteKey = new Map<string, number>();
  #routeKeysByTurnRouteKey = new Map<string, string>();

  captureRoute(windowId: number, route: BrowserRoute): void {
    const routeKey = this.routeKey(windowId, route.conversationId);
    this.#routesByKey.set(routeKey, {
      conversationId: route.conversationId,
      windowId,
      url: route.url,
      updatedAt: Date.now()
    });

    const selectedTabId = this.#selectedTabIdsByRouteKey.get(routeKey);
    if (selectedTabId) {
      this.updateTab(selectedTabId, { url: route.url });
    }
  }

  releaseRoute(windowId: number, conversationId: string): void {
    const routeKey = this.routeKey(windowId, conversationId);
    this.#routesByKey.delete(routeKey);
    for (const [turnRouteKey, mappedRouteKey] of this.#routeKeysByTurnRouteKey) {
      if (mappedRouteKey === routeKey) {
        this.#routeKeysByTurnRouteKey.delete(turnRouteKey);
      }
    }
    const tabId = this.#selectedTabIdsByRouteKey.get(routeKey);
    this.#selectedTabIdsByRouteKey.delete(routeKey);
    if (tabId) {
      this.#removeTab(tabId);
    }
  }

  releaseWindow(windowId: number): void {
    for (const route of [...this.#routesByKey.values()].filter((route) => route.windowId === windowId)) {
      this.releaseRoute(windowId, route.conversationId);
    }
    for (const tab of [...this.#tabsById.values()].filter((tab) => tab.windowId === windowId)) {
      this.#removeTab(tab.id);
    }
  }

  hasRoute(windowId: number, conversationId: string): boolean {
    return this.#routesByKey.has(this.routeKey(windowId, conversationId));
  }

  captureTurnRoute(windowId: number, route: BrowserTurnRoute): void {
    const routeKey = this.routeKey(windowId, route.conversationId);
    if (!this.#routesByKey.has(routeKey)) {
      this.captureRoute(windowId, route);
    }
    this.#routeKeysByTurnRouteKey.set(this.turnRouteKey(route.conversationId, route.turnId), routeKey);
  }

  releaseTurnRoute(conversationId: string, turnId: string): void {
    this.#routeKeysByTurnRouteKey.delete(this.turnRouteKey(conversationId, turnId));
  }

  assertTurnCanAccessTab(conversationId: string, turnId: string, tabId: number): void {
    const scopedRouteKeys = [...this.#routeKeysByTurnRouteKey.entries()]
      .filter(([turnRouteKey]) => turnRouteKey.startsWith(`${conversationId}:`))
      .map(([, routeKey]) => routeKey);
    if (scopedRouteKeys.length === 0) {
      return;
    }
    const routeKey = this.#routeKeysByTurnRouteKey.get(this.turnRouteKey(conversationId, turnId));
    if (!routeKey) {
      throw new Error(`No active browser route is captured for turn ${turnId}.`);
    }
    if (this.#routeKeysByTabId.get(tabId) !== routeKey) {
      throw new Error(`Turn ${turnId} cannot access tab ${tabId}.`);
    }
  }

  registerPage(windowId: number, ownerWebContentsId: number, conversationId: string): BrowserTabRecord {
    const routeKey = this.routeKey(windowId, conversationId);
    const pageKey = this.pageKey(ownerWebContentsId, conversationId);
    const existingTabId = this.#tabIdsByPageKey.get(pageKey);
    if (existingTabId) {
      const existing = this.#tabsById.get(existingTabId);
      if (existing) {
        this.#selectedTabIdsByRouteKey.set(routeKey, existing.id);
        return existing;
      }
    }

    const route = this.#routesByKey.get(routeKey);
    const tab: BrowserTabRecord = {
      id: this.#nextTabId++,
      routeKey,
      pageKey,
      conversationId,
      windowId,
      ownerWebContentsId,
      guestWebContentsId: null,
      webContents: null,
      title: "",
      url: route?.url ?? "about:blank",
      active: true,
      attachedAt: null,
      updatedAt: Date.now()
    };

    this.#tabsById.set(tab.id, tab);
    this.#tabIdsByPageKey.set(pageKey, tab.id);
    this.#routeKeysByTabId.set(tab.id, routeKey);
    this.#selectedTabIdsByRouteKey.set(routeKey, tab.id);
    return tab;
  }

  attachGuestWebContents(
    windowId: number,
    ownerWebContentsId: number,
    conversationId: string,
    webContents: WebContents
  ): BrowserTabRecord {
    const tab = this.registerPage(windowId, ownerWebContentsId, conversationId);
    this.updateTab(tab.id, {
      guestWebContentsId: webContents.id,
      webContents,
      title: webContents.getTitle(),
      url: webContents.getURL() || tab.url,
      attachedAt: Date.now()
    });
    return this.#tabsById.get(tab.id) ?? tab;
  }

  updateTab(tabId: number, patch: Partial<Omit<BrowserTabRecord, "id">>): void {
    const tab = this.#tabsById.get(tabId);
    if (!tab) {
      return;
    }
    this.#tabsById.set(tabId, {
      ...tab,
      ...patch,
      updatedAt: Date.now()
    });
  }

  detachGuestWebContents(guestWebContentsId: number): void {
    const tab = [...this.#tabsById.values()].find(
      (candidate) => candidate.guestWebContentsId === guestWebContentsId
    );
    if (!tab) {
      return;
    }
    this.updateTab(tab.id, {
      guestWebContentsId: null,
      webContents: null,
      attachedAt: null
    });
  }

  getTab(tabId: number): BrowserTabRecord | null {
    return this.#tabsById.get(tabId) ?? null;
  }

  getSelectedTab(windowId: number, conversationId: string): BrowserTabRecord | null {
    const tabId = this.#selectedTabIdsByRouteKey.get(this.routeKey(windowId, conversationId));
    return tabId ? this.getTab(tabId) : null;
  }

  listTabs(): BrowserTabRecord[] {
    return [...this.#tabsById.values()];
  }

  routeKey(windowId: number, conversationId: string): string {
    return `${windowId}:${conversationId}`;
  }

  pageKey(ownerWebContentsId: number, conversationId: string): string {
    return `${ownerWebContentsId}:${conversationId}`;
  }

  turnRouteKey(conversationId: string, turnId: string): string {
    return `${conversationId}:${turnId}`;
  }

  #removeTab(tabId: number): void {
    const tab = this.#tabsById.get(tabId);
    if (!tab) {
      return;
    }
    this.#tabsById.delete(tabId);
    this.#tabIdsByPageKey.delete(tab.pageKey);
    this.#routeKeysByTabId.delete(tabId);
    if (this.#selectedTabIdsByRouteKey.get(tab.routeKey) === tabId) {
      this.#selectedTabIdsByRouteKey.delete(tab.routeKey);
    }
  }
}
