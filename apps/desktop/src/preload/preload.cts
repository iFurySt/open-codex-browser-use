import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import type {
  BrowserRoute,
  BrowserTurnRoute,
  CodexAppServerEvent,
  CodexChatRequest,
  CodexChatResponse,
  CodexConnectionStatus,
  CodexInterruptTurnRequest,
  CodexThreadListResponse,
  CodexThreadReadResponse,
  CodioApi,
  CodioAppInfo
} from "../shared/contracts.js";

const api: CodioApi = {
  getAppInfo: () => ipcRenderer.invoke("codio:get-app-info") as Promise<CodioAppInfo>,
  connectCodex: () => ipcRenderer.invoke("codio:connect-codex") as Promise<CodexConnectionStatus>,
  listCodexThreads: () =>
    ipcRenderer.invoke("codio:list-codex-threads") as Promise<CodexThreadListResponse>,
  readCodexThread: (threadId: string) =>
    ipcRenderer.invoke("codio:read-codex-thread", threadId) as Promise<CodexThreadReadResponse>,
  sendChatMessage: (request: CodexChatRequest) =>
    ipcRenderer.invoke("codio:send-chat-message", request) as Promise<CodexChatResponse>,
  interruptCodexTurn: (request: CodexInterruptTurnRequest) =>
    ipcRenderer.invoke("codio:interrupt-codex-turn", request) as Promise<void>,
  onCodexEvent: (listener: (event: CodexAppServerEvent) => void) => {
    const handler = (_event: IpcRendererEvent, payload: CodexAppServerEvent): void => {
      listener(payload);
    };
    ipcRenderer.on("codio:codex-event", handler);
    return () => ipcRenderer.removeListener("codio:codex-event", handler);
  },
  captureBrowserRoute: (route: BrowserRoute) =>
    ipcRenderer.invoke("codio:capture-browser-route", route) as Promise<void>,
  releaseBrowserRoute: (conversationId: string) =>
    ipcRenderer.invoke("codio:release-browser-route", conversationId) as Promise<void>,
  captureBrowserTurnRoute: (route: BrowserTurnRoute) =>
    ipcRenderer.invoke("codio:capture-browser-turn-route", route) as Promise<void>,
  releaseBrowserTurnRoute: (conversationId: string, turnId: string) =>
    ipcRenderer.invoke("codio:release-browser-turn-route", conversationId, turnId) as Promise<void>
};

contextBridge.exposeInMainWorld("codio", api);
