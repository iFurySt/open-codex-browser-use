export type CodexAppServerTransport = "stdio" | "websocket" | "unix";

export type CodexConnectionStatus =
  | {
      state: "connecting";
      transport: CodexAppServerTransport;
      detail: string;
    }
  | {
      state: "disconnected";
      transport: CodexAppServerTransport;
      detail: string;
    }
  | {
      state: "connected";
      transport: CodexAppServerTransport;
      codexHome: string | null;
      platform: string | null;
    };

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export type CodexThread = {
  id: string;
  preview?: string;
  name?: string | null;
  ephemeral?: boolean;
  status?: JsonValue;
  createdAt?: number;
  updatedAt?: number;
  cwd?: string;
  turns?: CodexTurn[];
};

export type CodexTurn = {
  id: string;
  status?: JsonValue;
  error?: JsonValue;
  items?: JsonValue[];
  startedAt?: number | null;
  completedAt?: number | null;
  durationMs?: number | null;
};

export type CodexAppServerEvent =
  | {
      type: "status";
      status: CodexConnectionStatus;
    }
  | {
      type: "notification";
      method: string;
      params: JsonValue;
    };

export type CodexChatRequest = {
  threadId: string | null;
  text: string;
  cwd?: string | null;
  expectedTurnId?: string | null;
};

export type CodexChatResponse = {
  threadId: string;
  thread: CodexThread;
  turn: CodexTurn;
  steered?: boolean;
};

export type CodexThreadListResponse = {
  threads: CodexThread[];
  nextCursor: string | null;
};

export type CodexThreadReadResponse = {
  thread: CodexThread;
};

export type CodexInterruptTurnRequest = {
  threadId: string;
  turnId: string;
};

export type CodioAppInfo = {
  name: "Codio";
  version: string;
  platform: string;
  codex: CodexConnectionStatus;
};

export type BrowserRoute = {
  conversationId: string;
  url: string;
};

export type BrowserTurnRoute = BrowserRoute & {
  turnId: string;
};

export type CodioApi = {
  getAppInfo: () => Promise<CodioAppInfo>;
  connectCodex: () => Promise<CodexConnectionStatus>;
  listCodexThreads: () => Promise<CodexThreadListResponse>;
  readCodexThread: (threadId: string) => Promise<CodexThreadReadResponse>;
  sendChatMessage: (request: CodexChatRequest) => Promise<CodexChatResponse>;
  interruptCodexTurn: (request: CodexInterruptTurnRequest) => Promise<void>;
  onCodexEvent: (listener: (event: CodexAppServerEvent) => void) => () => void;
  captureBrowserRoute: (route: BrowserRoute) => Promise<void>;
  releaseBrowserRoute: (conversationId: string) => Promise<void>;
  captureBrowserTurnRoute: (route: BrowserTurnRoute) => Promise<void>;
  releaseBrowserTurnRoute: (conversationId: string, turnId: string) => Promise<void>;
};

declare global {
  interface Window {
    codio: CodioApi;
  }
}
