import type { BrowserSessionRegistry, BrowserTabRecord } from "../browser-session-registry.js";
import type { JsonValue } from "@codio/browser-use-protocol";
import { isJsonObject, JsonRpcSocketConnection } from "@codio/browser-use-protocol";

type ExecuteCdpParams = {
  target: {
    tabId: number;
  };
  method: string;
  commandParams?: JsonValue;
  session_id: string;
  turn_id: string;
};

type TabInfo = {
  id: number;
  title: string;
  url: string;
  active: boolean;
};

export class IabBackend {
  readonly #connections = new Set<JsonRpcSocketConnection>();
  readonly #attachedTabIds = new Set<number>();

  constructor(private readonly browserSessions: BrowserSessionRegistry) {}

  registerConnection(connection: JsonRpcSocketConnection): void {
    this.#connections.add(connection);
    this.#registerHandler(connection, "getInfo", (params) => this.getInfo(params));
    this.#registerHandler(connection, "createTab", (params) => this.createTab(params));
    this.#registerHandler(connection, "getTabs", (params) => this.getTabs(params));
    this.#registerHandler(connection, "attach", (params) => this.attach(params));
    this.#registerHandler(connection, "detach", (params) => this.detach(params));
    this.#registerHandler(connection, "executeCdp", (params) => this.executeCdp(params));
    this.#registerHandler(connection, "getUserTabs", () => []);
    this.#registerHandler(connection, "claimUserTab", () => {
      throw new Error("browser.user.claimTab is only available with the Chrome backend.");
    });
    this.#registerHandler(connection, "finalizeTabs", () => {
      throw new Error("browser.tabs.finalize is only available with the Chrome backend.");
    });
  }

  getInfo(params: JsonValue | undefined): JsonValue {
    const sessionId = readOptionalString(params, "session_id");
    return {
      name: "Codio",
      version: "0.1.0",
      type: "iab",
      capabilities: {
        downloads: false,
        fileUploads: false,
        mediaDownloads: false
      },
      metadata: {
        codexSessionId: sessionId,
        codexWindowId: null,
        codexAppSessionId: "codio",
        codexAppBuildFlavor: "open"
      }
    };
  }

  async createTab(params: JsonValue | undefined): Promise<JsonValue> {
    const sessionId = readRequiredString(params, "session_id");
    const turnId = readRequiredString(params, "turn_id");
    const tab = this.#tabForSession(sessionId);
    this.browserSessions.assertTurnCanAccessTab(sessionId, turnId, tab.id);
    const url = readOptionalString(params, "url");
    if (url) {
      assertNavigableUrl(url);
      if (tab.webContents) {
        await tab.webContents.loadURL(url);
      }
      this.browserSessions.updateTab(tab.id, { url });
    }
    return this.#tabInfo(this.browserSessions.getTab(tab.id) ?? tab);
  }

  getTabs(params: JsonValue | undefined): JsonValue {
    const sessionId = readRequiredString(params, "session_id");
    return this.browserSessions
      .listTabs()
      .filter((tab) => tab.conversationId === sessionId)
      .map((tab) => this.#tabInfo(tab));
  }

  async attach(params: JsonValue | undefined): Promise<JsonValue> {
    const tab = this.#tabForId(readRequiredNumber(params, "tabId"));
    this.browserSessions.assertTurnCanAccessTab(
      readRequiredString(params, "session_id"),
      readRequiredString(params, "turn_id"),
      tab.id
    );
    if (!tab.webContents) {
      throw new Error(`Tab ${tab.id} does not have an attached webContents.`);
    }
    if (!tab.webContents.debugger.isAttached()) {
      tab.webContents.debugger.attach("1.3");
      tab.webContents.debugger.on("message", (_event, method, cdpParams) => {
        this.#emitCdpEvent(tab.id, method, cdpParams as JsonValue);
      });
    }
    this.#attachedTabIds.add(tab.id);
    return {};
  }

  detach(params: JsonValue | undefined): JsonValue {
    const tab = this.#tabForId(readRequiredNumber(params, "tabId"));
    this.browserSessions.assertTurnCanAccessTab(
      readRequiredString(params, "session_id"),
      readRequiredString(params, "turn_id"),
      tab.id
    );
    if (tab.webContents?.debugger.isAttached()) {
      tab.webContents.debugger.detach();
    }
    this.#attachedTabIds.delete(tab.id);
    return {};
  }

  async executeCdp(params: JsonValue | undefined): Promise<JsonValue> {
    if (!isJsonObject(params) || !isJsonObject(params.target)) {
      throw new Error("executeCdp requires a target object.");
    }
    const tab = this.#tabForId(readRequiredNumber(params.target, "tabId"));
    this.browserSessions.assertTurnCanAccessTab(
      readRequiredString(params, "session_id"),
      readRequiredString(params, "turn_id"),
      tab.id
    );
    const method = readRequiredString(params, "method");
    const commandParams = params.commandParams ?? {};
    if (!tab.webContents) {
      throw new Error(`Tab ${tab.id} does not have an attached webContents.`);
    }
    if (!tab.webContents.debugger.isAttached()) {
      await this.attach({ tabId: tab.id });
    }
    return (await tab.webContents.debugger.sendCommand(
      method,
      isJsonObject(commandParams) ? commandParams : {}
    )) as JsonValue;
  }

  dispose(): void {
    for (const tabId of this.#attachedTabIds) {
      const tab = this.browserSessions.getTab(tabId);
      if (tab?.webContents?.debugger.isAttached()) {
        tab.webContents.debugger.detach();
      }
    }
    this.#attachedTabIds.clear();
    for (const connection of this.#connections) {
      connection.close();
    }
    this.#connections.clear();
  }

  #tabForSession(sessionId: string): BrowserTabRecord {
    const tab = this.browserSessions
      .listTabs()
      .find((candidate) => candidate.conversationId === sessionId && candidate.active);
    if (!tab) {
      throw new Error(`No Codio browser tab is registered for session ${sessionId}.`);
    }
    return tab;
  }

  #tabForId(tabId: number): BrowserTabRecord {
    const tab = this.browserSessions.getTab(tabId);
    if (!tab) {
      throw new Error(`No Codio browser tab exists for tabId ${tabId}.`);
    }
    return tab;
  }

  #tabInfo(tab: BrowserTabRecord): TabInfo {
    return {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      active: tab.active
    };
  }

  #emitCdpEvent(tabId: number, method: string, params: JsonValue): void {
    for (const connection of this.#connections) {
      connection.sendNotification("onCDPEvent", {
        source: {
          tabId
        },
        method,
        params
      });
    }
  }

  #registerHandler(
    connection: JsonRpcSocketConnection,
    method: string,
    handler: (params: JsonValue | undefined) => JsonValue | Promise<JsonValue>
  ): void {
    connection.registerHandler(method, async (params) => {
      console.info("Codio Browser Use RPC request", {
        method,
        sessionId: readOptionalString(params, "session_id"),
        turnId: readOptionalString(params, "turn_id")
      });
      return handler(params);
    });
  }
}

function readRequiredString(params: JsonValue | undefined, key: string): string {
  const value = isJsonObject(params) ? params[key] : undefined;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected string field: ${key}`);
  }
  return value;
}

function readOptionalString(params: JsonValue | undefined, key: string): string | null {
  const value = isJsonObject(params) ? params[key] : undefined;
  return typeof value === "string" ? value : null;
}

function readRequiredNumber(params: JsonValue | undefined, key: string): number {
  const value = isJsonObject(params) ? params[key] : undefined;
  if (!Number.isFinite(value)) {
    throw new Error(`Expected numeric field: ${key}`);
  }
  return Number(value);
}

function assertNavigableUrl(url: string): void {
  if (url === "about:blank") {
    return;
  }
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported navigation protocol: ${parsed.protocol}`);
  }
}
