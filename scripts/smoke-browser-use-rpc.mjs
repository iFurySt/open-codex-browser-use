#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const protocolUrl = pathToFileURL(
  path.join(repoRoot, "packages/browser-use-protocol/dist/index.js")
);
const { decodeFrames, encodeFrame } = await import(protocolUrl.href);

const socketDir = "/tmp/codex-browser-use";
const sessionId = process.env.CODIO_SMOKE_SESSION_ID ?? "default";
const turnId = process.env.CODIO_SMOKE_TURN_ID ?? "smoke-turn";
const navigateUrl = process.env.CODIO_SMOKE_NAVIGATE_URL ?? "https://example.com";
const requestTimeoutMs = Number(process.env.CODIO_SMOKE_TIMEOUT_MS ?? 10000);

class RpcClient {
  nextId = 1;
  pending = new Map();
  buffer = Buffer.alloc(0);

  constructor(socket) {
    this.socket = socket;
    socket.on("data", (chunk) => this.handleData(chunk));
    socket.on("error", (error) => {
      for (const pending of this.pending.values()) {
        pending.reject(error);
      }
      this.pending.clear();
    });
  }

  request(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.write(encodeFrame({ jsonrpc: "2.0", id, method, params }));
      setTimeout(() => {
        if (!this.pending.has(id)) {
          return;
        }
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, requestTimeoutMs);
    });
  }

  handleData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    const { messages, remainingData } = decodeFrames(this.buffer);
    this.buffer = remainingData;
    for (const message of messages) {
      const pending = this.pending.get(message.id);
      if (!pending) {
        continue;
      }
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    }
  }
}

function once(emitter, eventName) {
  return new Promise((resolve, reject) => {
    emitter.once(eventName, resolve);
    emitter.once("error", reject);
  });
}

async function inspectSocket(socketPath) {
  const client = net.createConnection(socketPath);
  const rpc = new RpcClient(client);
  await once(client, "connect");
  try {
    const info = await rpc.request("getInfo", {
      session_id: sessionId,
      turn_id: turnId
    });
    const tabs =
      info?.name === "Codio"
        ? await rpc.request("getTabs", {
            session_id: sessionId,
            turn_id: turnId
          })
        : [];
    const cdp =
      info?.name === "Codio" && Array.isArray(tabs) && tabs[0]?.id
        ? await smokeCdp(rpc, tabs[0].id)
        : null;
    return {
      socketPath,
      info,
      tabs,
      cdp
    };
  } finally {
    client.end();
  }
}

async function smokeCdp(rpc, tabId) {
  await rpc.request("attach", {
    session_id: sessionId,
    turn_id: turnId,
    tabId
  });
  try {
    await rpc.request("executeCdp", {
      session_id: sessionId,
      turn_id: turnId,
      target: {
        tabId
      },
      method: "Page.navigate",
      commandParams: {
        url: navigateUrl
      }
    });
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const href = await rpc.request("executeCdp", {
      session_id: sessionId,
      turn_id: turnId,
      target: {
        tabId
      },
      method: "Runtime.evaluate",
      commandParams: {
        expression: "document.location.href",
        returnByValue: true
      }
    });
    const title = await rpc.request("executeCdp", {
      session_id: sessionId,
      turn_id: turnId,
      target: {
        tabId
      },
      method: "Runtime.evaluate",
      commandParams: {
        expression: "document.title",
        returnByValue: true
      }
    });
    const screenshot = await rpc.request("executeCdp", {
      session_id: sessionId,
      turn_id: turnId,
      target: {
        tabId
      },
      method: "Page.captureScreenshot",
      commandParams: {
        format: "png"
      }
    });
    return {
      href: href?.result?.value ?? null,
      title: title?.result?.value ?? null,
      screenshotBytes:
        typeof screenshot?.data === "string" ? Buffer.byteLength(screenshot.data, "base64") : 0
    };
  } finally {
    await rpc.request("detach", {
      session_id: sessionId,
      turn_id: turnId,
      tabId
    });
  }
}

async function main() {
  const entries = await readdir(socketDir).catch(() => []);
  const sockets = entries
    .filter((entry) => entry.endsWith(".sock"))
    .map((entry) => path.join(socketDir, entry));

  if (sockets.length === 0) {
    throw new Error(`No Browser Use sockets found under ${socketDir}`);
  }

  const inspected = [];
  for (const socketPath of sockets) {
    try {
      inspected.push(await inspectSocket(socketPath));
    } catch (error) {
      inspected.push({
        socketPath,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const codio = inspected.find((result) => result.info?.name === "Codio" && result.info?.type === "iab");

  if (!codio) {
    throw new Error(
      `No Codio IAB backend found. Checked ${sockets.length} socket(s): ${JSON.stringify(inspected)}`
    );
  }

  console.log(
    JSON.stringify(
      {
        socketPath: codio.socketPath,
        info: codio.info,
        tabs: codio.tabs,
        cdp: codio.cdp
      },
      null,
      2
    )
  );
}

await main();
