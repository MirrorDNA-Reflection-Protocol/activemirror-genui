#!/usr/bin/env node
import { createHash, createPrivateKey, sign } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const inputPath = process.argv[2] || process.env.MIRROR_BODY_RECEIPT_UNSIGNED_FILE || "";
const outputPath = process.argv[3] || process.env.MIRROR_BODY_RECEIPT_SIGNED_FILE || "";
const privateKeyRaw = process.env.MIRROR_BODY_RECEIPT_PRIVATE_KEY || "";
const keyId = process.env.MIRROR_BODY_RECEIPT_PUBLIC_KEY_ID || process.env.MIRROR_BODY_RECEIPT_KEY_ID || "active-mirror-public-body-key";

const SCHEMA_VERSION = "active_mirror.body_public_receipt.v1";
const privateLeakPattern =
  /(\/Users\/|\/home\/|\/opt\/|\.env\b|sk-[A-Za-z0-9_-]{8,}|OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY|CLOUDFLARE_API_TOKEN|DATABASE_URL|ATLAS_URI)/i;

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPrivateLeak(value) {
  if (typeof value === "string") return privateLeakPattern.test(value);
  if (Array.isArray(value)) return value.some((item) => hasPrivateLeak(item));
  if (isRecord(value)) return Object.values(value).some((item) => hasPrivateLeak(item));
  return false;
}

function stableForSigning(value) {
  if (Array.isArray(value)) return value.map((item) => stableForSigning(item));
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, stableForSigning(item)]),
  );
}

function signingPayload(receipt) {
  const unsignedReceipt = { ...receipt };
  delete unsignedReceipt.signature;
  return JSON.stringify(stableForSigning(unsignedReceipt));
}

function privateKeyFromEnv() {
  if (!privateKeyRaw.trim()) fail("MIRROR_BODY_RECEIPT_PRIVATE_KEY is required");
  const normalized = privateKeyRaw.trim().replace(/\\n/g, "\n");
  if (normalized.includes("BEGIN PRIVATE KEY")) return createPrivateKey(normalized);
  return createPrivateKey({
    key: Buffer.from(normalized, "base64"),
    format: "der",
    type: "pkcs8",
  });
}

function validateUnsignedReceipt(receipt) {
  if (!isRecord(receipt)) fail("receipt must be a JSON object");
  if (hasPrivateLeak(receipt)) fail("receipt contains private material");
  if (receipt.schemaVersion !== SCHEMA_VERSION) fail("unsupported schemaVersion");
  if (typeof receipt.receiptId !== "string" || !/^[A-Za-z0-9_.:-]{8,120}$/.test(receipt.receiptId)) {
    fail("invalid receiptId");
  }
  if (typeof receipt.issuedAt !== "string" || Number.isNaN(Date.parse(receipt.issuedAt))) {
    fail("invalid issuedAt");
  }
  if (receipt.expiresAt !== undefined && (typeof receipt.expiresAt !== "string" || Number.isNaN(Date.parse(receipt.expiresAt)))) {
    fail("invalid expiresAt");
  }
}

if (!inputPath) fail("usage: MIRROR_BODY_RECEIPT_PRIVATE_KEY=... sign-body-receipt.mjs unsigned.json [signed.json]");

const raw = await readFile(inputPath, "utf8");
const receipt = JSON.parse(raw);
validateUnsignedReceipt(receipt);

const payload = signingPayload(receipt);
const payloadHash = `sha256:${createHash("sha256").update(payload).digest("hex")}`;
const signature = sign(null, Buffer.from(payload), privateKeyFromEnv()).toString("base64");
const signedReceipt = {
  ...receipt,
  signature: {
    algorithm: "ed25519",
    keyId,
    payloadHash,
    chainHead: receipt.signature?.chainHead || payloadHash,
    signature,
  },
};

const output = JSON.stringify(signedReceipt, null, 2) + "\n";
if (outputPath) {
  await writeFile(outputPath, output, { mode: 0o600 });
} else {
  process.stdout.write(output);
}

console.error(JSON.stringify({
  status: "signed",
  receiptId: signedReceipt.receiptId,
  keyId,
  payloadHash,
  outputPath: outputPath || "stdout",
}));
