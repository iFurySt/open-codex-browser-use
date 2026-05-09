#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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
    `open-browser-use native host auto-registration is not available for ${process.platform}/${process.arch}.`
  );
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const executable = process.platform === "win32" ? "open-browser-use.exe" : "open-browser-use";
const binaryPath = join(__dirname, "..", "native", `${platform}-${arch}`, executable);

if (!existsSync(binaryPath)) {
  console.warn(`open-browser-use native binary is missing, skipping native host registration: ${binaryPath}`);
  process.exit(0);
}

const result = spawnSync(binaryPath, ["install-manifest", "--path", binaryPath], {
  stdio: "inherit"
});

if (result.error || result.status !== 0) {
  const detail = result.error ? `: ${result.error.message}` : "";
  console.warn(`open-browser-use native host auto-registration skipped${detail}`);
  console.warn("Run `open-browser-use install-manifest` after installation to repair the Chrome native host manifest.");
}
