import { randomUUID } from "node:crypto";
import { chmod, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer, type Server } from "node:net";
import { platform } from "node:os";
import path from "node:path";

import { JsonRpcSocketConnection } from "@codio/browser-use-protocol";
import type { IabBackend } from "./iab-backend.js";

export class BrowserUseNativePipeServer {
  #server: Server | null = null;
  #socketPath: string | null = null;
  #discoveryPath: string | null = null;

  constructor(private readonly backend: IabBackend) {}

  get socketPath(): string | null {
    return this.#socketPath;
  }

  async start(): Promise<string> {
    if (this.#server && this.#socketPath) {
      return this.#socketPath;
    }
    const isWindows = platform() === "win32";
    const socketDir = "/tmp/codex-browser-use";
    const socketPath = isWindows
      ? `\\\\.\\pipe\\codio-browser-use-${randomUUID()}`
      : path.join(socketDir, `${randomUUID()}.sock`);
    const discoveryPath = isWindows ? null : path.join(socketDir, "latest.json");
    if (!isWindows) {
      await mkdir(socketDir, { recursive: true });
      await chmod(socketDir, 0o700);
    }
    if (!isWindows) {
      await rm(socketPath, { force: true });
    }

    this.#server = createServer((socket) => {
      console.info("Codio Browser Use IAB backend accepted local native pipe connection.");
      this.backend.registerConnection(new JsonRpcSocketConnection(socket));
    });

    await new Promise<void>((resolve, reject) => {
      this.#server?.once("error", reject);
      this.#server?.listen(socketPath, () => {
        this.#server?.off("error", reject);
        resolve();
      });
    });

    this.#socketPath = socketPath;
    if (discoveryPath) {
      await chmod(socketPath, 0o600);
      await writeFile(
        discoveryPath,
        JSON.stringify(
          {
            name: "Codio",
            type: "iab",
            socketPath,
            pid: process.pid
          },
          null,
          2
        )
      );
      await chmod(discoveryPath, 0o600);
      this.#discoveryPath = discoveryPath;
    }
    return socketPath;
  }

  async stop(): Promise<void> {
    const server = this.#server;
    const socketPath = this.#socketPath;
    const discoveryPath = this.#discoveryPath;
    this.#server = null;
    this.#socketPath = null;
    this.#discoveryPath = null;
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    if (socketPath && platform() !== "win32") {
      await rm(socketPath, { force: true });
    }
    if (discoveryPath) {
      await rm(discoveryPath, { force: true });
    }
    this.backend.dispose();
  }
}
