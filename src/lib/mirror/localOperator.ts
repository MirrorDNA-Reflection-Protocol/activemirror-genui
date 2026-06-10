import { createHash } from "node:crypto";

export const ACTIVE_MIRROR_LOCAL_OPERATOR_VERSION = "2026.06.10-local-operator-compiler-v1";
export const ACTIVE_MIRROR_LOCAL_OPERATOR_SCHEMA_VERSION =
  "active_mirror.local_operator_packet.v1";

export type LocalOperatorRecordKind =
  | "fact"
  | "preference"
  | "pattern"
  | "project"
  | "mistake"
  | "rule"
  | "source"
  | "revocation";

export type LocalOperatorPrivacyClass =
  | "public_safe"
  | "private"
  | "secret"
  | "regulated";

export type LocalOperatorCanonicalStatus =
  | "canonical"
  | "active"
  | "draft"
  | "contradicted"
  | "stale";

export type LocalOperatorTrainEligibility =
  | "train_yes"
  | "runtime_only"
  | "eval_only"
  | "never_train";

export type LocalOperatorRecordInput = {
  id?: unknown;
  kind?: unknown;
  title?: unknown;
  text?: unknown;
  source?: unknown;
  sourceHash?: unknown;
  privacyClass?: unknown;
  canonicalStatus?: unknown;
  trainEligibility?: unknown;
  approved?: unknown;
  lastVerified?: unknown;
  tags?: unknown;
};

export type LocalOperatorSourceRecord = {
  id: string;
  kind: LocalOperatorRecordKind;
  title: string;
  excerpt: string;
  sourceHash: string;
  contentHash: string;
  privacyClass: LocalOperatorPrivacyClass;
  canonicalStatus: LocalOperatorCanonicalStatus;
  trainEligibility: LocalOperatorTrainEligibility;
  approved: boolean;
  lastVerified?: string;
  tags: string[];
};

export type LocalOperatorRejectedRecord = {
  id: string;
  title: string;
  reason:
    | "invalid_record"
    | "approval_required"
    | "private_material"
    | "secret_or_regulated"
    | "not_canonical"
    | "stale_or_contradicted";
};

export type LocalOperatorSelectedRecord = {
  id: string;
  kind: LocalOperatorRecordKind;
  title: string;
  sourceHash: string;
  relevance: number;
  use: "route" | "reflect" | "answer_boundary" | "memory_boundary";
};

export type LocalOperatorPacket = {
  schemaVersion: typeof ACTIVE_MIRROR_LOCAL_OPERATOR_SCHEMA_VERSION;
  version: typeof ACTIVE_MIRROR_LOCAL_OPERATOR_VERSION;
  state: "compiled_public_safe";
  receiptState: "unsigned_public_preview";
  operator: {
    name: "LocalOperator";
    role: "governed_context_operator";
    authority: "deterministic_policy";
    localModelRole: "optional_classifier_only";
    frontierModelRole: "scoped_proposer_only";
  };
  claimBoundary: string;
  privateVaultIngest: {
    state: "private_body_required";
    rule: string;
  };
  skillRails: Array<{
    id: string;
    role: string;
    state: "available_private_body" | "public_contract";
  }>;
  inputPolicy: {
    allowedKinds: LocalOperatorRecordKind[];
    allowedPrivacyClasses: LocalOperatorPrivacyClass[];
    requiredMetadata: string[];
    exclusionRules: string[];
  };
  task: {
    prompt: string;
    intentHash: string;
    sourceGaps: string[];
  };
  records: {
    supplied: number;
    eligible: number;
    selected: LocalOperatorSelectedRecord[];
    rejected: LocalOperatorRejectedRecord[];
  };
  taskPacket: {
    contextEnvelope: "selected_record_ids_only";
    modelVisibility: "scoped_public_safe_records";
    selectedRecordIds: string[];
    didNotRun: string[];
    nextGate: string;
  };
  receipt: {
    compilerVersion: typeof ACTIVE_MIRROR_LOCAL_OPERATOR_VERSION;
    packetHash: string;
    selectedRecordHashes: string[];
    rejectedCount: number;
    deterministic: true;
  };
};

const KIND_VALUES: LocalOperatorRecordKind[] = [
  "fact",
  "preference",
  "pattern",
  "project",
  "mistake",
  "rule",
  "source",
  "revocation",
];

const PRIVACY_VALUES: LocalOperatorPrivacyClass[] = [
  "public_safe",
  "private",
  "secret",
  "regulated",
];

const CANONICAL_VALUES: LocalOperatorCanonicalStatus[] = [
  "canonical",
  "active",
  "draft",
  "contradicted",
  "stale",
];

const TRAIN_VALUES: LocalOperatorTrainEligibility[] = [
  "train_yes",
  "runtime_only",
  "eval_only",
  "never_train",
];

const PRIVATE_LEAK_PATTERN =
  /(\/Users\/|\/home\/|\/opt\/|\.env\b|sk-[A-Za-z0-9_-]{8,}|OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY|CLOUDFLARE_API_TOKEN|DATABASE_URL|ATLAS_URI|password|secret|token)/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stable(item));
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, stable(item)]),
  );
}

function sha256(value: string) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function asEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;
}

function safeId(value: unknown, fallback: string) {
  if (typeof value === "string" && /^[A-Za-z0-9_.:-]{3,96}$/.test(value)) return value;
  return fallback;
}

function safeText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : fallback;
}

function safeTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.toLowerCase().replace(/[^a-z0-9_.:-]+/g, "-").slice(0, 48))
    .filter(Boolean)
    .slice(0, 12);
}

function hasPrivateLeak(value: unknown): boolean {
  if (typeof value === "string") return PRIVATE_LEAK_PATTERN.test(value);
  if (Array.isArray(value)) return value.some((item) => hasPrivateLeak(item));
  if (isRecord(value)) return Object.values(value).some((item) => hasPrivateLeak(item));
  return false;
}

function normalizeRecord(input: LocalOperatorRecordInput, index: number): LocalOperatorSourceRecord | null {
  if (!isRecord(input)) return null;
  const title = safeText(input.title || input.id, `Record ${index + 1}`).slice(0, 120);
  const text = safeText(input.text || input.title);
  if (!title || !text) return null;

  const id = safeId(input.id, `record_${createHash("sha1").update(`${title}:${index}`).digest("hex").slice(0, 10)}`);
  const kind = asEnum(input.kind, KIND_VALUES, "fact");
  const privacyClass = asEnum(input.privacyClass, PRIVACY_VALUES, "private");
  const canonicalStatus = asEnum(input.canonicalStatus, CANONICAL_VALUES, "draft");
  const trainEligibility = asEnum(input.trainEligibility, TRAIN_VALUES, "runtime_only");
  const source = safeText(input.source || id, id);
  const sourceHash = typeof input.sourceHash === "string" && /^sha256:[a-f0-9]{64}$/i.test(input.sourceHash)
    ? input.sourceHash
    : sha256(source);

  return {
    id,
    kind,
    title,
    excerpt: text.slice(0, 220),
    sourceHash,
    contentHash: sha256(text),
    privacyClass,
    canonicalStatus,
    trainEligibility,
    approved: input.approved === true,
    ...(typeof input.lastVerified === "string" && !Number.isNaN(Date.parse(input.lastVerified))
      ? { lastVerified: input.lastVerified }
      : {}),
    tags: safeTags(input.tags),
  };
}

function rejectionFor(record: LocalOperatorSourceRecord): LocalOperatorRejectedRecord["reason"] | null {
  if (hasPrivateLeak(record)) return "private_material";
  if (!record.approved) return "approval_required";
  if (record.privacyClass === "secret" || record.privacyClass === "regulated") return "secret_or_regulated";
  if (record.canonicalStatus === "stale" || record.canonicalStatus === "contradicted") return "stale_or_contradicted";
  if (record.canonicalStatus !== "canonical" && record.canonicalStatus !== "active") return "not_canonical";
  return null;
}

function terms(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .slice(0, 80),
  );
}

function relevance(promptTerms: Set<string>, record: LocalOperatorSourceRecord) {
  const recordTerms = terms(`${record.title} ${record.excerpt} ${record.tags.join(" ")}`);
  let score = 0;
  for (const term of promptTerms) {
    if (recordTerms.has(term)) score += 1;
  }
  if (record.kind === "rule") score += 0.5;
  if (record.kind === "mistake") score += 0.35;
  if (record.kind === "revocation") score += 0.25;
  return Math.round(score * 100) / 100;
}

function selectedUse(record: LocalOperatorSourceRecord): LocalOperatorSelectedRecord["use"] {
  if (record.kind === "rule" || record.kind === "revocation") return "memory_boundary";
  if (record.kind === "source" || record.kind === "fact") return "answer_boundary";
  if (record.kind === "preference" || record.kind === "pattern") return "reflect";
  return "route";
}

function buildPacketHash(packet: Omit<LocalOperatorPacket, "receipt">) {
  return sha256(JSON.stringify(stable(packet)));
}

export function localOperatorContract() {
  return {
    version: ACTIVE_MIRROR_LOCAL_OPERATOR_VERSION,
    responseSchemaVersion: ACTIVE_MIRROR_LOCAL_OPERATOR_SCHEMA_VERSION,
    responseSchemaPath: "schemas/active-mirror-local-operator-packet.schema.json",
    route: "/api/mirror/local-operator",
    mode: "deterministic_public_safe_context_compiler",
    claimBoundary:
      "This public route proves the local operator contract using supplied public-safe records. Real vault ingestion stays on the private body and requires approval, provenance, and receipts.",
    privateVaultIngest: "private_body_required",
  };
}

export function compileLocalOperatorPacket(input: unknown): {
  ok: true;
  packet: LocalOperatorPacket;
} | {
  ok: false;
  error: string;
} {
  if (!isRecord(input)) return { ok: false, error: "operator_payload_must_be_object" };
  if (hasPrivateLeak(input)) return { ok: false, error: "operator_payload_contains_private_material" };

  const prompt = safeText(input.prompt, "").slice(0, 600);
  if (!prompt) return { ok: false, error: "prompt_required" };

  const rawRecords = Array.isArray(input.records) ? input.records.slice(0, 48) : [];
  const normalized = rawRecords.map((item, index) => normalizeRecord(item as LocalOperatorRecordInput, index));
  const invalidRejected = normalized
    .map((record, index): LocalOperatorRejectedRecord | null => record ? null : ({
      id: `invalid_${index}`,
      title: `Invalid record ${index + 1}`,
      reason: "invalid_record",
    }))
    .filter((record): record is LocalOperatorRejectedRecord => Boolean(record));
  const records = normalized.filter((record): record is LocalOperatorSourceRecord => Boolean(record));

  const rejected: LocalOperatorRejectedRecord[] = [
    ...invalidRejected,
    ...records
      .map((record) => {
        const reason = rejectionFor(record);
        return reason ? { id: record.id, title: record.title, reason } : null;
      })
      .filter((record): record is LocalOperatorRejectedRecord => Boolean(record)),
  ];
  const rejectedIds = new Set(rejected.map((record) => record.id));
  const eligible = records.filter((record) => !rejectedIds.has(record.id));
  const promptTerms = terms(prompt);
  const selected = eligible
    .map((record) => ({
      id: record.id,
      kind: record.kind,
      title: record.title,
      sourceHash: record.sourceHash,
      relevance: relevance(promptTerms, record),
      use: selectedUse(record),
    }))
    .filter((record) => record.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance || left.id.localeCompare(right.id))
    .slice(0, 8);

  const sourceGaps = [
    ...(selected.length ? [] : ["no_eligible_matching_record"]),
    "live_vault_ingest_not_run",
    "frontier_model_not_authorized_by_this_packet",
  ];

  const packetWithoutReceipt: Omit<LocalOperatorPacket, "receipt"> = {
    schemaVersion: ACTIVE_MIRROR_LOCAL_OPERATOR_SCHEMA_VERSION,
    version: ACTIVE_MIRROR_LOCAL_OPERATOR_VERSION,
    state: "compiled_public_safe",
    receiptState: "unsigned_public_preview",
    operator: {
      name: "LocalOperator",
      role: "governed_context_operator",
      authority: "deterministic_policy",
      localModelRole: "optional_classifier_only",
      frontierModelRole: "scoped_proposer_only",
    },
    claimBoundary:
      "This is a deterministic public-safe operator packet. It compiles approved records into a scoped context envelope; it does not train a model, read the private vault, or grant action authority.",
    privateVaultIngest: {
      state: "private_body_required",
      rule: "The public website may receive sanitized records or signed body receipts only. Raw vault reads stay on the private body.",
    },
    skillRails: [
      { id: "find", role: "vault search and source discovery", state: "available_private_body" },
      { id: "build-cycle", role: "simulate, spec, build, QA, receipt", state: "available_private_body" },
      { id: "receipt-ledger", role: "durable build and proof receipts", state: "available_private_body" },
      { id: "public-canary", role: "public HTTP/API/browser verification", state: "available_private_body" },
      { id: "local-operator-contract", role: "public-safe packet compiler", state: "public_contract" },
    ],
    inputPolicy: {
      allowedKinds: KIND_VALUES,
      allowedPrivacyClasses: ["public_safe", "private"],
      requiredMetadata: [
        "id",
        "kind",
        "title",
        "sourceHash",
        "privacyClass",
        "canonicalStatus",
        "trainEligibility",
        "approved",
      ],
      exclusionRules: [
        "raw secrets and raw private paths rejected",
        "secret or regulated records rejected on public route",
        "stale and contradicted records rejected as truth",
        "draft records cannot become context",
        "unapproved records cannot become model context",
      ],
    },
    task: {
      prompt,
      intentHash: sha256(prompt),
      sourceGaps,
    },
    records: {
      supplied: rawRecords.length,
      eligible: eligible.length,
      selected,
      rejected,
    },
    taskPacket: {
      contextEnvelope: "selected_record_ids_only",
      modelVisibility: "scoped_public_safe_records",
      selectedRecordIds: selected.map((record) => record.id),
      didNotRun: [
        "raw_vault_read",
        "model_training",
        "memory_writeback",
        "private_file_access",
        "external_send",
      ],
      nextGate: selected.length
        ? "approved_private_body_run_required_for_real_vault_operator"
        : "approve_or_attach_eligible_records",
    },
  };

  const packetHash = buildPacketHash(packetWithoutReceipt);
  return {
    ok: true,
    packet: {
      ...packetWithoutReceipt,
      receipt: {
        compilerVersion: ACTIVE_MIRROR_LOCAL_OPERATOR_VERSION,
        packetHash,
        selectedRecordHashes: selected
          .map((selectedRecord) => records.find((record) => record.id === selectedRecord.id)?.contentHash)
          .filter((hash): hash is string => Boolean(hash)),
        rejectedCount: rejected.length,
        deterministic: true,
      },
    },
  };
}

export function sampleLocalOperatorPayload() {
  return {
    prompt: "Build a vendor evidence workspace with proof before recommendation.",
    records: [
      {
        id: "doctrine.no_source_no_fact",
        kind: "rule",
        title: "No source, no fact",
        text: "Unsupported claims stay as assumptions or source gaps until verified.",
        source: "ACTIVE_MIRROR_BOOTLOADER_CONTRACT",
        privacyClass: "public_safe",
        canonicalStatus: "canonical",
        trainEligibility: "runtime_only",
        approved: true,
        tags: ["proof", "source", "hallucination-boundary"],
      },
      {
        id: "pattern.vendor_evidence",
        kind: "pattern",
        title: "Vendor evidence workspace",
        text: "For vendor review, create a source route, evidence table, approval gates, and deploy or reject recommendation.",
        source: "Active Mirror public workflow pattern",
        privacyClass: "public_safe",
        canonicalStatus: "active",
        trainEligibility: "runtime_only",
        approved: true,
        tags: ["vendor", "evidence", "workspace"],
      },
      {
        id: "draft.private_note",
        kind: "preference",
        title: "Unapproved private note",
        text: "This note is withheld because it is not approved for context.",
        source: "withheld",
        privacyClass: "private",
        canonicalStatus: "draft",
        trainEligibility: "never_train",
        approved: false,
        tags: ["private"],
      },
    ],
  };
}
