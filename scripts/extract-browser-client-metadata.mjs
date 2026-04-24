#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

const input =
  process.argv[2] ??
  `${process.env.HOME}/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha1/scripts/browser-client.mjs`;
const output =
  process.argv[3] ?? "docs/generated/browser-client-metadata.json";

const source = await readFile(input, "utf8");

const unique = (values) => Array.from(new Set(values)).sort();

const imports = unique(
  [
    ...Array.from(
      source.matchAll(
        /import(?:\*as\s+\w+|\{[^}]+\}|\s+\w+(?:,\{[^}]+\})?)from["']([^"']+)["']/g,
      ),
      (m) => m[1],
    ),
    ...Array.from(source.matchAll(/import\(["']([^"']+)["']\)/g), (m) => m[1]),
  ].filter((value) => value.startsWith("node:") || value === "worker_threads"),
);

const exports = Array.from(source.matchAll(/export\{([^}]+)\}/g), (m) =>
  m[1].split(",").map((part) => part.trim()),
).flat();

const commandHandlers = Array.from(
  source.matchAll(/var\s+([A-Za-z0-9_$]+)\s*=\s*L\("([^"]+)"/g),
  (m) => ({ symbol: m[1], type: m[2] }),
);

const commandStrings = unique(
  Array.from(source.matchAll(/"([a-z][a-z0-9_]+(?:_[a-z0-9]+)+)"/g), (m) => m[1]).filter(
    (value) =>
      value.startsWith("browser_user_") ||
      value.startsWith("cua_") ||
      value.startsWith("dom_cua_") ||
      value.startsWith("navigate_tab_") ||
      value.startsWith("playwright_") ||
      value.startsWith("tab_") ||
      [
        "close_tab",
        "create_tab",
        "finalize_tabs",
        "list_tabs",
        "name_session",
        "selected_tab",
        "tabs_content",
      ].includes(value),
  ),
);

const constants = {
  exportName: exports,
  defaultBackend: /return"chrome"/.test(source) ? "chrome" : null,
  responseMetaKey: /"codex\/browserUse"/.test(source) ? "codex/browserUse" : null,
  siteStatusEndpoint: /https:\/\/chatgpt\.com\/backend-api/.test(source) && /aura\/site_status/.test(source)
    ? "https://chatgpt.com/backend-api/aura/site_status"
    : null,
  nativePipeBase: /codex-browser-use/.test(source) ? "codex-browser-use" : null,
  iabPipe: /codex-browser-use-iab/.test(source) ? "codex-browser-use-iab" : null,
  turnMetadataHeader: /x-codex-turn-metadata/.test(source) ? "x-codex-turn-metadata" : null,
  playwrightInjectedGlobal: /__codexPlaywrightInjected/.test(source)
    ? "__codexPlaywrightInjected"
    : null,
  iabInputToken: /__codexIabInputTargetToken/.test(source)
    ? "__codexIabInputTargetToken"
    : null,
};

const metadata = {
  generatedBy: basename(import.meta.url),
  generatedAt: new Date().toISOString(),
  input,
  bytes: Buffer.byteLength(source),
  lines: source.split("\n").length,
  sha256: createHash("sha256").update(source).digest("hex"),
  imports,
  exports,
  constants,
  commandHandlers,
  commandStrings,
};

await writeFile(output, `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`wrote ${output}`);
