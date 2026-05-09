import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { endianness, tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { OpenBrowserUseClient, encodeFrame } from "../dist/index.js";

test("encodes native-endian length-prefixed JSON frames", () => {
  const frame = encodeFrame({ id: 1, method: "getInfo" });
  const length = endianness() === "LE" ? frame.readUInt32LE(0) : frame.readUInt32BE(0);
  assert.equal(length, frame.length - 4);
  assert.deepEqual(JSON.parse(frame.subarray(4).toString("utf8")), {
    id: 1,
    method: "getInfo"
  });
});

test("dispatches JSON-RPC notifications from the native socket", async () => {
  const directory = await mkdtemp(join(tmpdir(), "obu-sdk-js-"));
  const socketPath = join(directory, "obu.sock");
  const server = createServer((socket) => {
    socket.write(
      encodeFrame({
        jsonrpc: "2.0",
        method: "onDownloadChange",
        params: { id: "1", status: "started" }
      })
    );
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(socketPath, resolve);
  });

  const client = new OpenBrowserUseClient({ socketPath });
  try {
    const notification = await new Promise((resolve) => {
      client.onNotification(resolve);
      void client.connect();
    });
    assert.deepEqual(notification, {
      method: "onDownloadChange",
      params: { id: "1", status: "started" }
    });
  } finally {
    client.close();
    server.close();
    await new Promise((resolve) => server.once("close", resolve));
    await rm(directory, { recursive: true, force: true });
  }
});

test("sends file chooser wrapper requests", async () => {
  const directory = await mkdtemp(join(tmpdir(), "obu-sdk-js-"));
  const socketPath = join(directory, "obu.sock");
  const server = createServer((socket) => {
    socket.once("data", (chunk) => {
      const length = endianness() === "LE" ? chunk.readUInt32LE(0) : chunk.readUInt32BE(0);
      const request = JSON.parse(chunk.subarray(4, 4 + length).toString("utf8"));
      assert.equal(request.method, "waitForFileChooser");
      assert.equal(request.params.tabId, 123);
      socket.write(
        encodeFrame({
          jsonrpc: "2.0",
          id: request.id,
          result: { fileChooserId: "chooser-1", isMultiple: false }
        })
      );
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(socketPath, resolve);
  });

  const client = new OpenBrowserUseClient({ socketPath });
  try {
    assert.deepEqual(await client.waitForFileChooser(123), {
      fileChooserId: "chooser-1",
      isMultiple: false
    });
  } finally {
    client.close();
    server.close();
    await new Promise((resolve) => server.once("close", resolve));
    await rm(directory, { recursive: true, force: true });
  }
});

test("sends download and clipboard wrapper requests", async () => {
  const directory = await mkdtemp(join(tmpdir(), "obu-sdk-js-"));
  const socketPath = join(directory, "obu.sock");
  const expected = [
    ["waitForDownload", { tabId: 123, timeoutMs: 5000 }],
    ["downloadPath", { downloadId: "download-1" }],
    ["readClipboardText", { tabId: 123 }],
    ["writeClipboardText", { tabId: 123, text: "hello" }]
  ];
  const server = createServer((socket) => {
    let index = 0;
    socket.on("data", (chunk) => {
      const length = endianness() === "LE" ? chunk.readUInt32LE(0) : chunk.readUInt32BE(0);
      const request = JSON.parse(chunk.subarray(4, 4 + length).toString("utf8"));
      const [method, params] = expected[index++];
      assert.equal(request.method, method);
      assert.deepEqual(
        Object.fromEntries(Object.entries(params).map(([key, value]) => [key, request.params[key]])),
        params
      );
      socket.write(encodeFrame({ jsonrpc: "2.0", id: request.id, result: {} }));
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(socketPath, resolve);
  });

  const client = new OpenBrowserUseClient({ socketPath });
  try {
    await client.waitForDownload(123, 5000);
    await client.downloadPath("download-1");
    await client.readClipboardText(123);
    await client.writeClipboardText(123, "hello");
    assert.equal(expected.length, 4);
  } finally {
    client.close();
    server.close();
    await new Promise((resolve) => server.once("close", resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
