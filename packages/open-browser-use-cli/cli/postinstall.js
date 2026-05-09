#!/usr/bin/env node

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const platformMap = {
  darwin: "darwin",
  linux: "linux",
  win32: "windows"
};

const archMap = {
  arm64: "arm64",
  x64: "amd64"
};

if (process.env.OPEN_BROWSER_USE_SKIP_POSTINSTALL === "1") {
  process.exit(0);
}

const platform = platformMap[process.platform];
const arch = archMap[process.arch];

if (!platform || !arch || platform === "windows") {
  console.warn(
    `open-browser-use setup is not fully automated for ${process.platform}/${process.arch}.`
  );
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const executable = process.platform === "win32" ? "open-browser-use.exe" : "open-browser-use";
const binaryPath = join(__dirname, "..", "native", `${platform}-${arch}`, executable);

if (!existsSync(binaryPath)) {
  console.warn(`open-browser-use native binary is missing: ${binaryPath}`);
  process.exit(0);
}

console.log("");
console.log("Open Browser Use CLI installed.");
console.log("Run `open-browser-use setup` to register Chrome integration.");
console.log("While the Chrome Web Store item is pending, run `open-browser-use setup release` to install the latest release CRX.");
