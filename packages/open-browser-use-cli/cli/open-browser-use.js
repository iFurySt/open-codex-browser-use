#!/usr/bin/env node

import { spawn } from "node:child_process";
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

const platform = platformMap[process.platform];
const arch = archMap[process.arch];

if (!platform || !arch) {
  console.error(`open-browser-use does not ship a binary for ${process.platform}/${process.arch}`);
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const executable = process.platform === "win32" ? "open-browser-use.exe" : "open-browser-use";
const binaryPath = join(__dirname, "..", "native", `${platform}-${arch}`, executable);

if (!existsSync(binaryPath)) {
  console.error(`open-browser-use binary is missing for ${process.platform}/${process.arch}: ${binaryPath}`);
  process.exit(1);
}

const child = spawn(binaryPath, process.argv.slice(2), {
  stdio: "inherit"
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
