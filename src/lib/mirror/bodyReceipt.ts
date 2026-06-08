import { createHash, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const ACTIVE_MIRROR_BODY_RECEIPT_SCHEMA_VERSION =
  "active_mirror.body_public_receipt.v1";

export const ACTIVE_MIRROR_BODY_RECEIPT_VERSION =
  "2026.06.08-body-receipt-bridge-v1";

export type PublicBodyReceiptCapabilityKernel = {
  status: "compiled" | "missing" | "body_unavailable";
  compiledAt?: string;
  skills?: string[];
  automationServices?: string[];
};

export type PublicBodyReceipt = {
  schemaVersion: typeof ACTIVE_MIRROR_BODY_RECEIPT_SCHEMA_VERSION;
  receiptId: string;
  issuedAt: string;
  expiresAt?: string;
  bodyState: "online" | "degraded" | "offline" | "body_unavailable";
  sourceState: "public_safe_sync" | "last_known" | "source_gap";
  capabilityKernel?: PublicBodyReceiptCapabilityKernel;
  continuity?: {
    status: "fresh" | "stale" | "withheld";
    snapshotAt?: string;
  };
  proof?: {
    didRun?: string[];
    didNotRun?: string[];
    sourceGaps?: string[];
    approvalsRequired?: string[];
  };
  signature?: {
    algorithm: "ed25519" | "hmac-sha256" | "unknown";
    keyId?: string;
    payloadHash?: string;
    chainHead?: string;
    signature?: string;
  };
};

export type PublicBodyReceiptSummary = {
  version: typeof ACTIVE_MIRROR_BODY_RECEIPT_VERSION;
  status: "available" | "expired" | "missing" | "invalid";
  receiptId?: string;
  issuedAt?: string;
  expiresAt?: string;
  ageSeconds?: number;
  bodyState?: PublicBodyReceipt["bodyState"];
  sourceState?: PublicBodyReceipt["sourceState"];
  signatureState:
    | "present_unverified"
    | "hash_only"
    | "missing"
    | "not_available";
  chainHead?: string;
  capabilityKernel?: PublicBodyReceiptCapabilityKernel;
  continuity?: PublicBodyReceipt["continuity"];
  proof?: PublicBodyReceipt["proof"];
  note: string;
};

const PRIVATE_LEAK_PATTERN =
  /(\/Users\/|\/home\/|\/opt\/|\.env\b|sk-[A-Za-z0-9_-]{8,}|OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY|CLOUDFLARE_API_TOKEN|DATABASE_URL|ATLAS_URI)/i;

const BODY_RECEIPT_PATH =
  process.env.MIRROR_PUBLIC_BODY_RECEIPT ||
  process.env.MIRROR_BODY_RECEIPT_PATH ||
  (process.env.HOME
    ? join(process.env.HOME, ".activemirror", "public", "mirror-body-receipt.json")
    : "");

function parseDate(value?: string) {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time) : null;
}

function safeStringArray(value: unknown, maxItems = 8) {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.slice(0, 160))
    .slice(0, maxItems);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPrivateLeak(value: unknown): boolean {
  if (typeof value === "string") return PRIVATE_LEAK_PATTERN.test(value);
  if (Array.isArray(value)) return value.some((item) => hasPrivateLeak(item));
  if (isRecord(value)) return Object.values(value).some((item) => hasPrivateLeak(item));
  return false;
}

function normalizeCapabilityKernel(value: unknown): PublicBodyReceiptCapabilityKernel | undefined {
  if (!isRecord(value)) return undefined;
  const rawStatus = value.status;
  const status =
    rawStatus === "compiled" || rawStatus === "missing" || rawStatus === "body_unavailable"
      ? rawStatus
      : undefined;
  if (!status) return undefined;

  const compiledAt = typeof value.compiledAt === "string"
    ? value.compiledAt
    : typeof value.compiled_at === "string"
      ? value.compiled_at
      : undefined;

  return {
    status,
    ...(compiledAt && parseDate(compiledAt) ? { compiledAt } : {}),
    ...(safeStringArray(value.skills) ? { skills: safeStringArray(value.skills) } : {}),
    ...(safeStringArray(value.automationServices || value.automation_services)
      ? { automationServices: safeStringArray(value.automationServices || value.automation_services) }
      : {}),
  };
}

function normalizeProof(value: unknown): PublicBodyReceipt["proof"] | undefined {
  if (!isRecord(value)) return undefined;
  const proof = {
    didRun: safeStringArray(value.didRun || value.did_run),
    didNotRun: safeStringArray(value.didNotRun || value.did_not_run),
    sourceGaps: safeStringArray(value.sourceGaps || value.source_gaps),
    approvalsRequired: safeStringArray(value.approvalsRequired || value.approvals_required),
  };
  return Object.values(proof).some(Boolean) ? proof : undefined;
}

function normalizeSignature(value: unknown): PublicBodyReceipt["signature"] | undefined {
  if (!isRecord(value)) return undefined;
  const algorithm =
    value.algorithm === "ed25519" || value.algorithm === "hmac-sha256" || value.algorithm === "unknown"
      ? value.algorithm
      : "unknown";
  const signature = typeof value.signature === "string" ? value.signature.slice(0, 512) : undefined;
  const payloadHash = typeof value.payloadHash === "string"
    ? value.payloadHash.slice(0, 160)
    : typeof value.payload_hash === "string"
      ? value.payload_hash.slice(0, 160)
      : undefined;
  const chainHead = typeof value.chainHead === "string"
    ? value.chainHead.slice(0, 160)
    : typeof value.chain_head === "string"
      ? value.chain_head.slice(0, 160)
      : undefined;
  const keyId = typeof value.keyId === "string"
    ? value.keyId.slice(0, 80)
    : typeof value.key_id === "string"
      ? value.key_id.slice(0, 80)
      : undefined;

  if (!signature && !payloadHash && !chainHead) return undefined;
  return {
    algorithm,
    ...(keyId ? { keyId } : {}),
    ...(payloadHash ? { payloadHash } : {}),
    ...(chainHead ? { chainHead } : {}),
    ...(signature ? { signature } : {}),
  };
}

function normalizeContinuity(value: unknown): PublicBodyReceipt["continuity"] | undefined {
  if (!isRecord(value)) return undefined;
  if (value.status !== "fresh" && value.status !== "stale" && value.status !== "withheld") {
    return undefined;
  }
  return {
    status: value.status,
    ...(typeof value.snapshotAt === "string" && parseDate(value.snapshotAt)
      ? { snapshotAt: value.snapshotAt }
      : {}),
  };
}

export function validatePublicBodyReceipt(input: unknown): {
  ok: true;
  receipt: PublicBodyReceipt;
} | {
  ok: false;
  error: string;
} {
  if (!isRecord(input)) return { ok: false, error: "receipt_must_be_object" };
  if (hasPrivateLeak(input)) return { ok: false, error: "receipt_contains_private_material" };

  if (input.schemaVersion !== ACTIVE_MIRROR_BODY_RECEIPT_SCHEMA_VERSION) {
    return { ok: false, error: "unsupported_schema_version" };
  }

  if (typeof input.receiptId !== "string" || !/^[A-Za-z0-9_.:-]{8,120}$/.test(input.receiptId)) {
    return { ok: false, error: "invalid_receipt_id" };
  }

  if (typeof input.issuedAt !== "string" || !parseDate(input.issuedAt)) {
    return { ok: false, error: "invalid_issued_at" };
  }

  if (input.expiresAt !== undefined && (typeof input.expiresAt !== "string" || !parseDate(input.expiresAt))) {
    return { ok: false, error: "invalid_expires_at" };
  }

  const bodyState = input.bodyState;
  if (
    bodyState !== "online" &&
    bodyState !== "degraded" &&
    bodyState !== "offline" &&
    bodyState !== "body_unavailable"
  ) {
    return { ok: false, error: "invalid_body_state" };
  }

  const sourceState = input.sourceState;
  if (sourceState !== "public_safe_sync" && sourceState !== "last_known" && sourceState !== "source_gap") {
    return { ok: false, error: "invalid_source_state" };
  }

  const normalizedContinuity = normalizeContinuity(input.continuity);

  return {
    ok: true,
    receipt: {
      schemaVersion: ACTIVE_MIRROR_BODY_RECEIPT_SCHEMA_VERSION,
      receiptId: input.receiptId,
      issuedAt: input.issuedAt,
      ...(typeof input.expiresAt === "string" ? { expiresAt: input.expiresAt } : {}),
      bodyState,
      sourceState,
      ...(normalizeCapabilityKernel(input.capabilityKernel || input.capability_kernel)
        ? { capabilityKernel: normalizeCapabilityKernel(input.capabilityKernel || input.capability_kernel) }
        : {}),
      ...(normalizedContinuity ? { continuity: normalizedContinuity } : {}),
      ...(normalizeProof(input.proof) ? { proof: normalizeProof(input.proof) } : {}),
      ...(normalizeSignature(input.signature) ? { signature: normalizeSignature(input.signature) } : {}),
    },
  };
}

function receiptExpired(receipt: PublicBodyReceipt, now = new Date()) {
  const expiresAt = parseDate(receipt.expiresAt);
  return Boolean(expiresAt && expiresAt.getTime() < now.getTime());
}

export function summarizePublicBodyReceipt(
  receipt: PublicBodyReceipt,
  now = new Date(),
): PublicBodyReceiptSummary {
  const issuedAt = parseDate(receipt.issuedAt);
  const ageSeconds = issuedAt
    ? Math.max(0, Math.floor((now.getTime() - issuedAt.getTime()) / 1000))
    : undefined;
  const signatureState = receipt.signature?.signature
    ? "present_unverified"
    : receipt.signature?.payloadHash || receipt.signature?.chainHead
      ? "hash_only"
      : "missing";

  return {
    version: ACTIVE_MIRROR_BODY_RECEIPT_VERSION,
    status: receiptExpired(receipt, now) ? "expired" : "available",
    receiptId: receipt.receiptId,
    issuedAt: receipt.issuedAt,
    ...(receipt.expiresAt ? { expiresAt: receipt.expiresAt } : {}),
    ...(ageSeconds !== undefined ? { ageSeconds } : {}),
    bodyState: receipt.bodyState,
    sourceState: receipt.sourceState,
    signatureState,
    ...(receipt.signature?.chainHead ? { chainHead: receipt.signature.chainHead } : {}),
    ...(receipt.capabilityKernel ? { capabilityKernel: receipt.capabilityKernel } : {}),
    ...(receipt.continuity ? { continuity: receipt.continuity } : {}),
    ...(receipt.proof ? { proof: receipt.proof } : {}),
    note:
      "Public-safe receipt only. It proves a sanitized sync packet was accepted; it does not expose raw body topology or grant private actions.",
  };
}

export async function readPublicBodyReceiptSummary(): Promise<PublicBodyReceiptSummary> {
  if (!BODY_RECEIPT_PATH) {
    return {
      version: ACTIVE_MIRROR_BODY_RECEIPT_VERSION,
      status: "missing",
      signatureState: "not_available",
      note: "No public body receipt path is configured.",
    };
  }

  try {
    const raw = await readFile(BODY_RECEIPT_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const validated = validatePublicBodyReceipt(parsed);
    if (!validated.ok) {
      return {
        version: ACTIVE_MIRROR_BODY_RECEIPT_VERSION,
        status: "invalid",
        signatureState: "not_available",
        note: `Stored public body receipt is invalid: ${validated.error}.`,
      };
    }
    return summarizePublicBodyReceipt(validated.receipt);
  } catch {
    return {
      version: ACTIVE_MIRROR_BODY_RECEIPT_VERSION,
      status: "missing",
      signatureState: "not_available",
      note: "No accepted public body receipt is currently available.",
    };
  }
}

export async function writePublicBodyReceipt(receipt: PublicBodyReceipt) {
  if (!BODY_RECEIPT_PATH) throw new Error("body_receipt_path_not_configured");
  await mkdir(dirname(BODY_RECEIPT_PATH), { recursive: true });
  const payload = JSON.stringify(receipt, null, 2) + "\n";
  const tempPath = `${BODY_RECEIPT_PATH}.${process.pid}.tmp`;
  await writeFile(tempPath, payload, { mode: 0o600 });
  await rename(tempPath, BODY_RECEIPT_PATH);
  return {
    summary: summarizePublicBodyReceipt(receipt),
    payloadHash: createHash("sha256").update(payload).digest("hex"),
  };
}

export function bodyReceiptTokenConfigured() {
  return Boolean(process.env.MIRROR_BODY_RECEIPT_TOKEN || process.env.MIRROR_BODY_SYNC_TOKEN);
}

export function isAuthorizedBodyReceiptRequest(request: Request) {
  const expected = process.env.MIRROR_BODY_RECEIPT_TOKEN || process.env.MIRROR_BODY_SYNC_TOKEN;
  if (!expected) return false;
  const rawAuth = request.headers.get("authorization") || "";
  const supplied = rawAuth.startsWith("Bearer ") ? rawAuth.slice("Bearer ".length) : "";
  if (!supplied) return false;

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, suppliedBuffer);
}
