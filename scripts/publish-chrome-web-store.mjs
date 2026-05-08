#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const apiRoot = "https://chromewebstore.googleapis.com";
const oauthTokenUrl = "https://oauth2.googleapis.com/token";

function readFlag(name, fallback = null) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length);
  }
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) {
    return process.argv[index + 1] ?? "";
  }
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function env(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await readJsonResponse(response);
  if (!response.ok) {
    const details = body.error?.message ?? body.raw ?? JSON.stringify(body);
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${details}`);
  }
  return body;
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: env("CWS_CLIENT_ID"),
    client_secret: env("CWS_CLIENT_SECRET"),
    refresh_token: env("CWS_REFRESH_TOKEN"),
    grant_type: "refresh_token"
  });
  const token = await requestJson(oauthTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  if (!token.access_token) {
    throw new Error("OAuth token response did not include access_token");
  }
  return token.access_token;
}

function itemName() {
  return `publishers/${env("CWS_PUBLISHER_ID")}/items/${env("CWS_EXTENSION_ID")}`;
}

async function uploadPackage(accessToken, zipPath) {
  const archive = await readFile(zipPath);
  return requestJson(`${apiRoot}/upload/v2/${itemName()}:upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/zip"
    },
    body: archive
  });
}

async function fetchStatus(accessToken) {
  return requestJson(`${apiRoot}/v2/${itemName()}:fetchStatus`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

async function waitForUpload(accessToken, uploadResponse) {
  let state = uploadResponse.uploadState;
  if (state === "SUCCEEDED") {
    return uploadResponse;
  }
  if (state === "FAILED") {
    throw new Error(`Chrome Web Store upload failed: ${JSON.stringify(uploadResponse)}`);
  }
  const deadline = Date.now() + Number(process.env.CWS_UPLOAD_TIMEOUT_MS ?? 120000);
  while (state === "IN_PROGRESS" && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const status = await fetchStatus(accessToken);
    state = status.lastAsyncUploadState;
    if (state === "SUCCEEDED") {
      return status;
    }
    if (state === "FAILED") {
      throw new Error(`Chrome Web Store upload failed: ${JSON.stringify(status)}`);
    }
  }
  if (state === "IN_PROGRESS") {
    throw new Error("Chrome Web Store upload did not finish before timeout");
  }
  return uploadResponse;
}

async function publish(accessToken) {
  const deployPercentage = readFlag("deploy-percentage", process.env.CWS_DEPLOY_PERCENTAGE ?? "");
  const body = {
    publishType: readFlag("publish-type", process.env.CWS_PUBLISH_TYPE ?? "DEFAULT_PUBLISH")
  };
  if (deployPercentage !== "") {
    body.deployInfos = [{ deployPercentage: Number(deployPercentage) }];
  }
  if (hasFlag("skip-review") || process.env.CWS_SKIP_REVIEW === "true") {
    body.skipReview = true;
  }
  return requestJson(`${apiRoot}/v2/${itemName()}:publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

async function main() {
  const zipPath = readFlag("zip", process.env.CWS_ZIP_PATH);
  if (!zipPath) {
    throw new Error("Missing extension package path. Pass --zip or set CWS_ZIP_PATH.");
  }
  const absoluteZipPath = path.resolve(zipPath);
  const accessToken = await getAccessToken();
  const uploadResponse = await uploadPackage(accessToken, absoluteZipPath);
  const finalUploadState = await waitForUpload(accessToken, uploadResponse);
  const result = {
    uploaded: finalUploadState,
    published: null
  };
  if (hasFlag("submit") || process.env.CWS_SUBMIT_FOR_REVIEW === "true") {
    result.published = await publish(accessToken);
  }
  const outputPath = readFlag("output", process.env.CWS_RESULT_PATH ?? "");
  if (outputPath) {
    await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
