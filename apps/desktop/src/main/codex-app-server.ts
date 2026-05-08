import { EventEmitter } from "node:events";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

import type {
  CodexChatRequest,
  CodexChatResponse,
  CodexConnectionStatus,
  CodexInterruptTurnRequest,
  CodexThread,
  CodexThreadListResponse,
  CodexThreadReadResponse,
  CodexTurn,
  JsonValue
} from "../shared/contracts.js";

type JsonObject = {
  [key: string]: JsonValue;
};

type AppServerResponse = {
  id: number;
  result?: JsonValue;
  error?: {
    code?: number;
    message?: string;
    data?: JsonValue;
  };
};

type PendingRequest = {
  resolve: (value: JsonValue) => void;
  reject: (error: Error) => void;
};

type CodexAppServerEvents = {
  status: [CodexConnectionStatus];
  notification: [method: string, params: JsonValue];
};

export declare interface CodexAppServerClient {
  on<K extends keyof CodexAppServerEvents>(
    eventName: K,
    listener: (...args: CodexAppServerEvents[K]) => void
  ): this;
  emit<K extends keyof CodexAppServerEvents>(
    eventName: K,
    ...args: CodexAppServerEvents[K]
  ): boolean;
}

export class CodexAppServerClient extends EventEmitter {
  #process: ChildProcessWithoutNullStreams | null = null;
  #nextId = 1;
  #stdoutBuffer = "";
  #pending = new Map<number, PendingRequest>();
  #connectPromise: Promise<CodexConnectionStatus> | null = null;
  #thread: CodexThread | null = null;
  #status: CodexConnectionStatus = {
    state: "disconnected",
    transport: "stdio",
    detail: "Codex app-server is not connected."
  };

  getStatus(): CodexConnectionStatus {
    return this.#status;
  }

  async connect(): Promise<CodexConnectionStatus> {
    if (this.#status.state === "connected") {
      return this.#status;
    }
    if (this.#connectPromise) {
      return this.#connectPromise;
    }

    this.#connectPromise = this.#connect();
    try {
      return await this.#connectPromise;
    } finally {
      this.#connectPromise = null;
    }
  }

  async sendChatMessage(request: CodexChatRequest): Promise<CodexChatResponse> {
    await this.connect();

    if (request.threadId && request.expectedTurnId) {
      const result = await this.#request<JsonObject>("turn/steer", {
        threadId: request.threadId,
        input: [textInput(request.text)],
        expectedTurnId: request.expectedTurnId
      });
      return {
        threadId: request.threadId,
        thread: this.#thread?.id === request.threadId ? this.#thread : { id: request.threadId },
        turn: {
          id: readString(result.turnId, "turnId"),
          status: "inProgress"
        },
        steered: true
      };
    }

    const thread = request.threadId
      ? await this.#resumeThread(request.threadId)
      : await this.#startThread(request.cwd ?? null);

    const result = await this.#request<JsonObject>("turn/start", {
      threadId: thread.id,
      input: [textInput(request.text)],
      cwd: request.cwd ?? null
    });
    const turn = readObject(result.turn, "turn") as CodexTurn;

    return {
      threadId: thread.id,
      thread,
      turn
    };
  }

  async listThreads(): Promise<CodexThreadListResponse> {
    await this.connect();
    const result = await this.#request<JsonObject>("thread/list", {
      limit: 40,
      sortKey: "updated_at",
      sortDirection: "desc",
      archived: false
    });
    return {
      threads: Array.isArray(result.data) ? (result.data as CodexThread[]) : [],
      nextCursor: typeof result.nextCursor === "string" ? result.nextCursor : null
    };
  }

  async readThread(threadId: string): Promise<CodexThreadReadResponse> {
    await this.connect();
    const result = await this.#request<JsonObject>("thread/read", {
      threadId,
      includeTurns: true
    });
    const thread = readObject(result.thread, "thread") as CodexThread;
    this.#thread = thread;
    return { thread };
  }

  async interruptTurn(request: CodexInterruptTurnRequest): Promise<void> {
    await this.connect();
    await this.#request<JsonObject>("turn/interrupt", {
      threadId: request.threadId,
      turnId: request.turnId
    });
  }

  dispose(): void {
    for (const pending of this.#pending.values()) {
      pending.reject(new Error("Codex app-server client disposed."));
    }
    this.#pending.clear();

    if (this.#process && !this.#process.killed) {
      this.#process.kill();
    }
    this.#process = null;
    this.#setStatus({
      state: "disconnected",
      transport: "stdio",
      detail: "Codex app-server stopped."
    });
  }

  async #connect(): Promise<CodexConnectionStatus> {
    this.#setStatus({
      state: "connecting",
      transport: "stdio",
      detail: "Starting codex app-server."
    });

    const command = process.env.CODIO_CODEX_COMMAND ?? "codex";
    this.#process = spawn(command, ["app-server", "--listen", "stdio://"], {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"]
    });

    this.#process.stdout.setEncoding("utf8");
    this.#process.stderr.setEncoding("utf8");
    this.#process.stdout.on("data", (chunk: string) => this.#handleStdout(chunk));
    this.#process.stderr.on("data", (chunk: string) => this.#handleStderr(chunk));
    this.#process.on("error", (error) => this.#handleExit(error));
    this.#process.on("exit", (code, signal) => {
      this.#handleExit(new Error(`codex app-server exited: code=${code ?? "null"} signal=${signal ?? "null"}`));
    });

    const initialize = await this.#request<JsonObject>("initialize", {
      clientInfo: {
        name: "codio",
        title: "Codio",
        version: "0.1.2"
      },
      capabilities: {
        experimentalApi: true
      }
    });
    this.#notify("initialized", {});

    const codexHome = typeof initialize.codexHome === "string" ? initialize.codexHome : null;
    const platformFamily =
      typeof initialize.platformFamily === "string" ? initialize.platformFamily : null;
    const platformOs = typeof initialize.platformOs === "string" ? initialize.platformOs : null;
    const platform = [platformFamily, platformOs].filter(Boolean).join("/") || null;

    this.#setStatus({
      state: "connected",
      transport: "stdio",
      codexHome,
      platform
    });
    return this.#status;
  }

  async #ensureThread(cwd: string | null): Promise<CodexThread> {
    if (this.#thread) {
      return this.#thread;
    }

    return this.#startThread(cwd);
  }

  async #startThread(cwd: string | null): Promise<CodexThread> {
    const startResult = await this.#request<JsonObject>("thread/start", {
      cwd: cwd ?? this.#defaultCwd(),
      serviceName: "codio",
      personality: "pragmatic",
      ephemeral: false,
      sessionStartSource: "startup",
      experimentalRawEvents: false,
      persistExtendedHistory: false
    });
    const thread = readObject(startResult.thread, "thread") as CodexThread;
    this.#thread = thread;
    return thread;
  }

  async #resumeThread(threadId: string): Promise<CodexThread> {
    if (this.#thread?.id === threadId) {
      return this.#thread;
    }

    const resumeResult = await this.#request<JsonObject>("thread/resume", {
      threadId,
      personality: "pragmatic",
      persistExtendedHistory: false
    });
    const thread = readObject(resumeResult.thread, "thread") as CodexThread;
    this.#thread = thread;
    return thread;
  }

  #request<T extends JsonValue>(method: string, params?: JsonValue): Promise<T> {
    if (!this.#process || !this.#process.stdin.writable) {
      return Promise.reject(new Error("Codex app-server is not running."));
    }

    const id = this.#nextId++;
    const payload = params === undefined ? { id, method } : { id, method, params };

    return new Promise<T>((resolve, reject) => {
      this.#pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject
      });
      this.#process?.stdin.write(`${JSON.stringify(payload)}\n`, (error) => {
        if (!error) {
          return;
        }
        this.#pending.delete(id);
        reject(error);
      });
    });
  }

  #notify(method: string, params: JsonObject): void {
    this.#process?.stdin.write(`${JSON.stringify({ method, params })}\n`);
  }

  #handleStdout(chunk: string): void {
    this.#stdoutBuffer += chunk;
    let newlineIndex = this.#stdoutBuffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = this.#stdoutBuffer.slice(0, newlineIndex).trim();
      this.#stdoutBuffer = this.#stdoutBuffer.slice(newlineIndex + 1);
      if (line) {
        this.#handleMessageLine(line);
      }
      newlineIndex = this.#stdoutBuffer.indexOf("\n");
    }
  }

  #handleMessageLine(line: string): void {
    let parsed: JsonValue;
    try {
      parsed = JSON.parse(line) as JsonValue;
    } catch {
      return;
    }

    if (!isObject(parsed)) {
      return;
    }

    if (typeof parsed.id === "number") {
      this.#handleResponse(parsed as AppServerResponse);
      return;
    }

    if (typeof parsed.method === "string") {
      this.emit("notification", parsed.method, parsed.params ?? {});
    }
  }

  #handleResponse(response: AppServerResponse): void {
    const pending = this.#pending.get(response.id);
    if (!pending) {
      return;
    }
    this.#pending.delete(response.id);

    if (response.error) {
      pending.reject(new Error(response.error.message ?? `Codex app-server error ${response.id}`));
      return;
    }
    pending.resolve(response.result ?? {});
  }

  #handleStderr(chunk: string): void {
    const detail = chunk.trim();
    if (!detail || this.#status.state === "connected") {
      return;
    }
    this.#setStatus({
      state: "connecting",
      transport: "stdio",
      detail
    });
  }

  #handleExit(error: Error): void {
    for (const pending of this.#pending.values()) {
      pending.reject(error);
    }
    this.#pending.clear();
    this.#process = null;
    this.#thread = null;
    this.#setStatus({
      state: "disconnected",
      transport: "stdio",
      detail: error.message
    });
  }

  #setStatus(status: CodexConnectionStatus): void {
    this.#status = status;
    this.emit("status", status);
  }

  #defaultCwd(): string {
    return process.env.CODIO_WORKSPACE_CWD ?? process.env.INIT_CWD ?? process.cwd();
  }
}

function isObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readObject(value: JsonValue | undefined, label: string): JsonObject {
  if (!isObject(value)) {
    throw new Error(`Expected ${label} object from codex app-server.`);
  }
  return value;
}

function readString(value: JsonValue | undefined, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected ${label} string from codex app-server.`);
  }
  return value;
}

function textInput(text: string): JsonObject {
  return {
    type: "text",
    text,
    text_elements: []
  };
}
