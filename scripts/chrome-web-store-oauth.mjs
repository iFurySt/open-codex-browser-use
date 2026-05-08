#!/usr/bin/env node

import http from "node:http";
import { randomUUID } from "node:crypto";
import process from "node:process";

const authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const tokenUrl = "https://oauth2.googleapis.com/token";
const chromeWebStoreScope = "https://www.googleapis.com/auth/chromewebstore";

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

function readEnvOrFlag(envName, flagName) {
  return readFlag(flagName, process.env[envName] ?? "");
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
    const details = body.error_description ?? body.error?.message ?? body.raw ?? JSON.stringify(body);
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${details}`);
  }
  return body;
}

function listenForAuthorizationCode({ port, expectedState }) {
  let server;
  const codePromise = new Promise((resolve, reject) => {
    server = http.createServer((request, response) => {
      try {
        const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
        if (requestUrl.pathname !== "/oauth2callback") {
          response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("Not found\n");
          return;
        }
        const error = requestUrl.searchParams.get("error");
        if (error) {
          throw new Error(`OAuth authorization failed: ${error}`);
        }
        const state = requestUrl.searchParams.get("state");
        if (state !== expectedState) {
          throw new Error("OAuth state mismatch");
        }
        const code = requestUrl.searchParams.get("code");
        if (!code) {
          throw new Error("OAuth callback did not include a code");
        }
        response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Authorization received. You can close this tab and return to the terminal.\n");
        resolve(code);
      } catch (error) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(`${error instanceof Error ? error.message : String(error)}\n`);
        reject(error);
      } finally {
        server.close();
      }
    });
    server.once("error", reject);
    server.listen(port, "127.0.0.1");
  });
  return { codePromise, close: () => server?.close() };
}

async function main() {
  const clientId = readEnvOrFlag("CWS_CLIENT_ID", "client-id");
  const clientSecret = readEnvOrFlag("CWS_CLIENT_SECRET", "client-secret");
  const port = Number(readFlag("port", process.env.CWS_OAUTH_PORT ?? "53682"));
  if (!clientId) {
    throw new Error("Missing OAuth client id. Pass --client-id or set CWS_CLIENT_ID.");
  }
  if (!clientSecret) {
    throw new Error("Missing OAuth client secret. Pass --client-secret or set CWS_CLIENT_SECRET.");
  }
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("OAuth callback port must be a valid TCP port.");
  }

  const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
  const state = randomUUID();
  const listener = listenForAuthorizationCode({ port, expectedState: state });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: chromeWebStoreScope,
    access_type: "offline",
    prompt: "consent",
    state
  });

  console.error("Open this URL in a browser signed in as the Chrome Web Store publisher account:");
  console.error(`${authorizationUrl}?${params.toString()}`);
  console.error("");
  console.error(`Waiting for OAuth callback on ${redirectUri}`);

  try {
    const code = await listener.codePromise;
    const token = await requestJson(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
      })
    });
    if (!token.refresh_token) {
      throw new Error("OAuth response did not include refresh_token. Re-run with prompt=consent using the publisher account.");
    }

    console.log("CWS_REFRESH_TOKEN:");
    console.log(token.refresh_token);
    console.log("");
    console.log("Set it as a GitHub repository secret:");
    console.log("gh secret set CWS_REFRESH_TOKEN");
  } catch (error) {
    listener.close();
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
