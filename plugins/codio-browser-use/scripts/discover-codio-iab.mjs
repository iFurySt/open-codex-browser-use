#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const discoveryPath = process.env.CODIO_IAB_DISCOVERY_PATH ?? "/tmp/codex-browser-use/latest.json";
const raw = await readFile(discoveryPath, "utf8");
const discovery = JSON.parse(raw);

if (discovery?.name !== "Codio" || discovery?.type !== "iab" || typeof discovery?.socketPath !== "string") {
  throw new Error(`Invalid Codio IAB discovery file: ${discoveryPath}`);
}

console.log(JSON.stringify(discovery, null, 2));
