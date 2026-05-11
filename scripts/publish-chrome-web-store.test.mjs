import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "publish-chrome-web-store.mjs"
);

function runScript(args, env) {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [scriptPath, ...args],
      {
        env: {
          ...process.env,
          ...env
        }
      },
      (error, stdout, stderr) => {
        resolve({
          code: error?.code ?? 0,
          stdout,
          stderr
        });
      }
    );
  });
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function withMockApi(handler, callback) {
  const requests = [];
  const server = createServer(async (request, response) => {
    const body = await readRequestBody(request);
    requests.push({
      method: request.method,
      url: request.url,
      body
    });
    const result = await handler(request, body, requests);
    response.statusCode = result.status ?? 200;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(result.body ?? {}));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    const apiRoot = `http://127.0.0.1:${address.port}`;
    await callback(apiRoot, requests);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

async function withTempZip(callback) {
  const dir = await mkdtemp(path.join(tmpdir(), "obu-cws-test-"));
  try {
    const zipPath = path.join(dir, "extension.zip");
    const outputPath = path.join(dir, "result.json");
    await writeFile(zipPath, "zip");
    await callback({ zipPath, outputPath });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function baseEnv(apiRoot, outputPath) {
  return {
    CWS_API_ROOT: apiRoot,
    CWS_ACCESS_TOKEN: "token",
    CWS_PUBLISHER_ID: "publisher",
    CWS_EXTENSION_ID: "extension",
    CWS_RESULT_PATH: outputPath
  };
}

test("skips upload when Chrome Web Store already has an active submission", async () => {
  await withTempZip(async ({ zipPath, outputPath }) => {
    await withMockApi(
      () => ({
        body: {
          submittedItemRevisionStatus: {
            state: "PENDING_REVIEW",
            distributionChannels: [{ crxVersion: "0.1.34" }]
          }
        }
      }),
      async (apiRoot, requests) => {
        const result = await runScript(["--zip", zipPath, "--submit"], baseEnv(apiRoot, outputPath));

        assert.equal(result.code, 0, result.stderr);
        const output = JSON.parse(await readFile(outputPath, "utf8"));
        assert.equal(output.skipped.reason, "ACTIVE_SUBMISSION");
        assert.equal(output.preflightStatus.submittedState, "PENDING_REVIEW");
        assert.deepEqual(
          requests.map((request) => `${request.method} ${request.url}`),
          ["GET /v2/publishers/publisher/items/extension:fetchStatus"]
        );
      }
    );
  });
});

test("cancels active submission before uploading and publishing when requested", async () => {
  await withTempZip(async ({ zipPath, outputPath }) => {
    await withMockApi(
      (request) => {
        if (request.method === "GET") {
          return {
            body: {
              submittedItemRevisionStatus: {
                state: "PENDING_REVIEW",
                distributionChannels: [{ crxVersion: "0.1.34" }]
              }
            }
          };
        }
        if (request.url?.endsWith(":cancelSubmission")) {
          return { body: {} };
        }
        if (request.url?.startsWith("/upload/")) {
          return { body: { uploadState: "SUCCEEDED" } };
        }
        if (request.url?.endsWith(":publish")) {
          return { body: { state: "PENDING_REVIEW" } };
        }
        return { status: 404, body: { error: { message: "not found" } } };
      },
      async (apiRoot, requests) => {
        const result = await runScript(
          ["--zip", zipPath, "--submit", "--cancel-pending"],
          baseEnv(apiRoot, outputPath)
        );

        assert.equal(result.code, 0, result.stderr);
        const output = JSON.parse(await readFile(outputPath, "utf8"));
        assert.equal(output.skipped, null);
        assert.deepEqual(output.cancelledSubmission, {});
        assert.equal(output.uploaded.uploadState, "SUCCEEDED");
        assert.equal(output.published.state, "PENDING_REVIEW");
        assert.deepEqual(
          requests.map((request) => `${request.method} ${request.url}`),
          [
            "GET /v2/publishers/publisher/items/extension:fetchStatus",
            "POST /v2/publishers/publisher/items/extension:cancelSubmission",
            "POST /upload/v2/publishers/publisher/items/extension:upload",
            "POST /v2/publishers/publisher/items/extension:publish"
          ]
        );
      }
    );
  });
});
