import assert from "node:assert/strict";
import { endianness } from "node:os";
import test from "node:test";

import { encodeFrame } from "../dist/index.js";

test("encodes native-endian length-prefixed JSON frames", () => {
  const frame = encodeFrame({ id: 1, method: "getInfo" });
  const length = endianness() === "LE" ? frame.readUInt32LE(0) : frame.readUInt32BE(0);
  assert.equal(length, frame.length - 4);
  assert.deepEqual(JSON.parse(frame.subarray(4).toString("utf8")), {
    id: 1,
    method: "getInfo"
  });
});
