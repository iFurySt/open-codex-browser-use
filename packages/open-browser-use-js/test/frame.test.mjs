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
