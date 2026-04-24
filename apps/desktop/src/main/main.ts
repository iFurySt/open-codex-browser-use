import { app, BrowserWindow, ipcMain, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { BrowserSessionRegistry } from "./browser-session-registry.js";
import { IabBackend } from "./browser-use/iab-backend.js";
import { BrowserUseNativePipeServer } from "./browser-use/native-pipe-server.js";
import { CodexAppServerClient } from "./codex-app-server.js";
import type {
  BrowserRoute,
  BrowserTurnRoute,
  CodexInterruptTurnRequest,
  CodexChatRequest,
  CodioAppInfo
} from "../shared/contracts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const codexAppServer = new CodexAppServerClient();
const browserSessions = new BrowserSessionRegistry();
const iabBackend = new IabBackend(browserSessions);
const browserUsePipeServer = new BrowserUseNativePipeServer(iabBackend);

const rendererUrl = process.env.CODIO_RENDERER_URL;

app.setName("Codio");

codexAppServer.on("status", (status) => {
  broadcastToWindows("codio:codex-event", {
    type: "status",
    status
  });
});

codexAppServer.on("notification", (method, params) => {
  broadcastToWindows("codio:codex-event", {
    type: "notification",
    method,
    params
  });
});

function broadcastToWindows(channel: string, payload: unknown): void {
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, payload);
    }
  }
}

function createMainWindow(): BrowserWindow {
  const pendingWebviewAttachConversationIds: string[] = [];
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 980,
    minHeight: 680,
    title: "Codio",
    backgroundColor: "#f6f7f9",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  });

  mainWindow.webContents.on("will-attach-webview", (event, webPreferences, params) => {
    const partition = params.partition ?? "";
    const routePrefix = "persist:open-codex-browser-route:";

    if (!partition.startsWith(routePrefix)) {
      event.preventDefault();
      return;
    }

    const conversationId = decodeURIComponent(partition.slice(routePrefix.length));
    if (!browserSessions.hasRoute(mainWindow.id, conversationId)) {
      event.preventDefault();
      return;
    }

    browserSessions.registerPage(mainWindow.id, mainWindow.webContents.id, conversationId);
    pendingWebviewAttachConversationIds.push(conversationId);
    webPreferences.partition = "persist:open-codex-browser";
    webPreferences.preload = undefined;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    webPreferences.devTools = true;
  });

  mainWindow.webContents.on("did-attach-webview", (_event, guestWebContents) => {
    const conversationId = pendingWebviewAttachConversationIds.shift();
    if (!conversationId) {
      guestWebContents.close();
      return;
    }

    const tab = browserSessions.attachGuestWebContents(
      mainWindow.id,
      mainWindow.webContents.id,
      conversationId,
      guestWebContents
    );

    guestWebContents.on("page-title-updated", (_event, title) => {
      browserSessions.updateTab(tab.id, { title });
    });
    guestWebContents.on("did-navigate", (_event, url) => {
      browserSessions.updateTab(tab.id, { url });
    });
    guestWebContents.on("did-navigate-in-page", (_event, url) => {
      browserSessions.updateTab(tab.id, { url });
    });
    guestWebContents.on("destroyed", () => {
      browserSessions.detachGuestWebContents(guestWebContents.id);
    });
  });

  mainWindow.on("closed", () => {
    browserSessions.releaseWindow(mainWindow.id);
  });

  if (rendererUrl) {
    void mainWindow.loadURL(rendererUrl);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../../dist-renderer/index.html"));
  }

  return mainWindow;
}

function registerIpc(): void {
  ipcMain.handle("codio:get-app-info", (): CodioAppInfo => ({
    name: "Codio",
    version: app.getVersion(),
    platform: process.platform,
    codex: codexAppServer.getStatus()
  }));

  ipcMain.handle("codio:connect-codex", () => codexAppServer.connect());

  ipcMain.handle("codio:list-codex-threads", () => codexAppServer.listThreads());

  ipcMain.handle("codio:read-codex-thread", (_event, threadId: string) =>
    codexAppServer.readThread(threadId)
  );

  ipcMain.handle("codio:send-chat-message", (_event, request: CodexChatRequest) =>
    codexAppServer.sendChatMessage(request)
  );

  ipcMain.handle("codio:interrupt-codex-turn", (_event, request: CodexInterruptTurnRequest) =>
    codexAppServer.interruptTurn(request)
  );

  ipcMain.handle("codio:capture-browser-route", (event, route: BrowserRoute): void => {
    const ownerWindow = BrowserWindow.fromWebContents(event.sender);
    if (!ownerWindow) {
      throw new Error("Unable to resolve BrowserWindow for route capture.");
    }
    browserSessions.captureRoute(ownerWindow.id, route);
  });

  ipcMain.handle("codio:release-browser-route", (event, conversationId: string): void => {
    const ownerWindow = BrowserWindow.fromWebContents(event.sender);
    if (!ownerWindow) {
      return;
    }
    browserSessions.releaseRoute(ownerWindow.id, conversationId);
  });

  ipcMain.handle("codio:capture-browser-turn-route", (event, route: BrowserTurnRoute): void => {
    const ownerWindow = BrowserWindow.fromWebContents(event.sender);
    if (!ownerWindow) {
      throw new Error("Unable to resolve BrowserWindow for turn route capture.");
    }
    browserSessions.captureTurnRoute(ownerWindow.id, route);
  });

  ipcMain.handle(
    "codio:release-browser-turn-route",
    (_event, conversationId: string, turnId: string): void => {
      browserSessions.releaseTurnRoute(conversationId, turnId);
    }
  );
}

function configureBrowserPartition(): void {
  const browserSession = session.fromPartition("persist:open-codex-browser");
  browserSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
}

app.whenReady().then(() => {
  registerIpc();
  configureBrowserPartition();
  void browserUsePipeServer.start().then((socketPath) => {
    console.info(`Codio Browser Use IAB backend listening at ${socketPath}`);
  });
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  codexAppServer.dispose();
  void browserUsePipeServer.stop();
});
