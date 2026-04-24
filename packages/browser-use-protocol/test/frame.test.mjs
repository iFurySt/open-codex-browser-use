import assert from "node:assert/strict";
import test from "node:test";

import { decodeFrames, encodeFrame } from "../dist/index.js";

test("encodes and decodes one native pipe frame", () => {
  const message = {
    jsonrpc: "2.0",
    id: 1,
    method: "getInfo",
    params: {
      session_id: "thread-1",
      turn_id: "turn-1"
    }
  };

  const frame = encodeFrame(message);
  const decoded = decodeFrames(frame);

  assert.deepEqual(decoded.messages, [message]);
  assert.equal(decoded.remainingData.length, 0);
});

test("keeps incomplete frame data for the next socket chunk", () => {
  const first = encodeFrame({ id: 1, result: "ok" });
  const second = encodeFrame({ id: 2, result: "later" });
  const partial = Buffer.concat([first, second.subarray(0, 5)]);

  const decoded = decodeFrames(partial);

  assert.deepEqual(decoded.messages, [{ id: 1, result: "ok" }]);
  assert.deepEqual(decoded.remainingData, second.subarray(0, 5));

  const resumed = decodeFrames(Buffer.concat([decoded.remainingData, second.subarray(5)]));
  assert.deepEqual(resumed.messages, [{ id: 2, result: "later" }]);
  assert.equal(resumed.remainingData.length, 0);
});
