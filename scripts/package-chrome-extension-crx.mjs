#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function usage() {
  console.error(
    "usage: package-chrome-extension-crx.mjs --zip <zip> --output <crx> --metadata <json>"
  );
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      usage();
      process.exit(2);
    }
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      usage();
      process.exit(2);
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

function encodeVarint(value) {
  const bytes = [];
  let remaining = value;
  while (remaining > 0x7f) {
    bytes.push((remaining & 0x7f) | 0x80);
    remaining = Math.floor(remaining / 128);
  }
  bytes.push(remaining);
  return Buffer.from(bytes);
}

function encodeBytes(fieldNumber, value) {
  return Buffer.concat([
    encodeVarint((fieldNumber << 3) | 2),
    encodeVarint(value.length),
    value
  ]);
}

function encodeSignedData(crxId) {
  return encodeBytes(1, crxId);
}

function encodeAsymmetricKeyProof(publicKey, signature) {
  return Buffer.concat([encodeBytes(1, publicKey), encodeBytes(2, signature)]);
}

function encodeCrxFileHeader(proof, signedHeaderData) {
  return Buffer.concat([encodeBytes(2, proof), encodeBytes(10000, signedHeaderData)]);
}

function uint32LE(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);
  return buffer;
}

function extensionIdFromCrxId(crxId) {
  const alphabet = "abcdefghijklmnop";
  let id = "";
  for (const byte of crxId) {
    id += alphabet[(byte >> 4) & 0x0f];
    id += alphabet[byte & 0x0f];
  }
  return id;
}

function readPrivateKey() {
  const raw = process.env.CHROME_EXTENSION_PRIVATE_KEY;
  if (!raw) {
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048
    });
    return {
      key: privateKey,
      source: "ephemeral"
    };
  }

  const trimmed = raw.trim();
  const pem = trimmed.includes("-----BEGIN")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");
  return {
    key: crypto.createPrivateKey(pem),
    source: "CHROME_EXTENSION_PRIVATE_KEY"
  };
}

const args = parseArgs(process.argv.slice(2));
const zipPath = args.zip;
const outputPath = args.output;
const metadataPath = args.metadata;

if (!zipPath || !outputPath || !metadataPath) {
  usage();
  process.exit(2);
}

const zip = fs.readFileSync(zipPath);
const { key: privateKey, source: keySource } = readPrivateKey();
const publicKey = crypto.createPublicKey(privateKey).export({
  type: "spki",
  format: "der"
});
const crxId = crypto.createHash("sha256").update(publicKey).digest().subarray(0, 16);
const signedHeaderData = encodeSignedData(crxId);
const signedPayload = Buffer.concat([
  Buffer.from("CRX3 SignedData\0", "utf8"),
  uint32LE(signedHeaderData.length),
  signedHeaderData,
  zip
]);
const signature = crypto.sign("sha256", signedPayload, privateKey);

if (!crypto.verify("sha256", signedPayload, crypto.createPublicKey(privateKey), signature)) {
  throw new Error("generated CRX signature did not verify");
}

const proof = encodeAsymmetricKeyProof(publicKey, signature);
const header = encodeCrxFileHeader(proof, signedHeaderData);
const crx = Buffer.concat([Buffer.from("Cr24"), uint32LE(3), uint32LE(header.length), header, zip]);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, crx);

const metadata = {
  artifact: outputPath,
  crxVersion: 3,
  extensionId: extensionIdFromCrxId(crxId),
  keySource,
  sha256: crypto.createHash("sha256").update(crx).digest("hex"),
  generatedAtUtc: new Date().toISOString()
};
fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
