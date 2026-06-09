export const ACTIVE_MIRROR_IDENTITY_CONTINUITY_MEASURE_VERSION =
  "2026.06.09-identity-continuity-measure-v1";

type RawIdentityDimension = {
  id?: unknown;
  label?: unknown;
  value?: unknown;
  weight?: unknown;
  source?: unknown;
};

export type IdentityContinuityMeasureDimension = {
  id: string;
  label: string;
  value: number;
  weight: number;
  source?: string;
};

export type IdentityVectorDelta = {
  id: string;
  label: string;
  before: number;
  after: number;
  delta: number;
  stability: number;
  weight: number;
};

export type IdentityContinuityMeasurement = {
  version: typeof ACTIVE_MIRROR_IDENTITY_CONTINUITY_MEASURE_VERSION;
  state: "computed_public_safe";
  receiptState: "unsigned_public_preview";
  beforeModel: string;
  afterModel: string;
  continuityScore: number;
  drift: number;
  vectorDelta: IdentityVectorDelta[];
  claimBoundary: string;
  requiredReceipt: "signed_model_swap_identity_receipt";
};

const PRIVATE_LEAK_PATTERN =
  /(\/Users\/|\/home\/|\/opt\/|\.env\b|sk-[A-Za-z0-9_-]{8,}|OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY|CLOUDFLARE_API_TOKEN|DATABASE_URL|ATLAS_URI)/i;
const MAX_IDENTITY_DIMENSIONS = 24;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPrivateLeak(value: unknown): boolean {
  if (typeof value === "string") return PRIVATE_LEAK_PATTERN.test(value);
  if (Array.isArray(value)) return value.some((item) => hasPrivateLeak(item));
  if (isRecord(value)) return Object.values(value).some((item) => hasPrivateLeak(item));
  return false;
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function roundScore(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normalizeDimension(input: RawIdentityDimension): IdentityContinuityMeasureDimension | null {
  if (typeof input.id !== "string" || !/^[a-z0-9_.:-]{3,80}$/i.test(input.id)) return null;
  if (typeof input.label !== "string" || !input.label.trim()) return null;
  if (typeof input.value !== "number" || !Number.isFinite(input.value)) return null;
  if (input.weight !== undefined && (typeof input.weight !== "number" || !Number.isFinite(input.weight))) return null;
  if (input.source !== undefined && typeof input.source !== "string") return null;

  return {
    id: input.id,
    label: input.label.slice(0, 80),
    value: clampUnit(input.value),
    weight: input.weight === undefined ? 1 : Math.max(0.1, Math.min(10, input.weight)),
    ...(typeof input.source === "string" ? { source: input.source.slice(0, 160) } : {}),
  };
}

function normalizeVector(input: unknown): IdentityContinuityMeasureDimension[] | string {
  if (!Array.isArray(input) || input.length < 2) return "vector_requires_at_least_two_dimensions";
  if (input.length > MAX_IDENTITY_DIMENSIONS) return "vector_exceeds_dimension_limit";
  const dimensions = input.map((item) => (isRecord(item) ? normalizeDimension(item) : null));
  if (dimensions.some((item) => item === null)) return "invalid_identity_dimension";

  const ids = new Set<string>();
  for (const dimension of dimensions) {
    if (!dimension) return "invalid_identity_dimension";
    if (ids.has(dimension.id)) return "duplicate_identity_dimension";
    ids.add(dimension.id);
  }

  return dimensions as IdentityContinuityMeasureDimension[];
}

export function identityContinuityMeasureContract() {
  return {
    version: ACTIVE_MIRROR_IDENTITY_CONTINUITY_MEASURE_VERSION,
    route: "/api/mirror/identity-continuity/measure",
    mode: "deterministic_public_safe_vector_diff",
    requiredReceipt: "signed_model_swap_identity_receipt",
    claimBoundary:
      "This route computes a public-safe continuity score from supplied vectors. It does not claim private user identity was measured unless a signed body receipt records that run.",
  };
}

export function measureIdentityContinuity(input: unknown): {
  ok: true;
  measurement: IdentityContinuityMeasurement;
} | {
  ok: false;
  error: string;
} {
  if (!isRecord(input)) return { ok: false, error: "measurement_must_be_object" };
  if (hasPrivateLeak(input)) return { ok: false, error: "measurement_contains_private_material" };

  const beforeModel = typeof input.beforeModel === "string" && input.beforeModel.trim()
    ? input.beforeModel.slice(0, 80)
    : "before_model";
  const afterModel = typeof input.afterModel === "string" && input.afterModel.trim()
    ? input.afterModel.slice(0, 80)
    : "after_model";
  const before = normalizeVector(input.before);
  if (typeof before === "string") return { ok: false, error: before };
  const after = normalizeVector(input.after);
  if (typeof after === "string") return { ok: false, error: after };

  const afterById = new Map(after.map((dimension) => [dimension.id, dimension]));
  const beforeIds = new Set(before.map((dimension) => dimension.id));
  for (const afterDimension of after) {
    if (!beforeIds.has(afterDimension.id)) {
      return { ok: false, error: `unexpected_after_dimension:${afterDimension.id}` };
    }
  }
  const vectorDelta: IdentityVectorDelta[] = [];

  for (const beforeDimension of before) {
    const afterDimension = afterById.get(beforeDimension.id);
    if (!afterDimension) return { ok: false, error: `missing_after_dimension:${beforeDimension.id}` };
    const delta = roundScore(afterDimension.value - beforeDimension.value);
    const stability = roundScore(1 - Math.min(1, Math.abs(delta)));
    vectorDelta.push({
      id: beforeDimension.id,
      label: beforeDimension.label,
      before: beforeDimension.value,
      after: afterDimension.value,
      delta,
      stability,
      weight: beforeDimension.weight,
    });
  }

  const totalWeight = vectorDelta.reduce((sum, item) => sum + item.weight, 0);
  const continuityScore = roundScore(
    vectorDelta.reduce((sum, item) => sum + item.stability * item.weight, 0) / totalWeight,
  );
  const drift = roundScore(1 - continuityScore);

  return {
    ok: true,
    measurement: {
      version: ACTIVE_MIRROR_IDENTITY_CONTINUITY_MEASURE_VERSION,
      state: "computed_public_safe",
      receiptState: "unsigned_public_preview",
      beforeModel,
      afterModel,
      continuityScore,
      drift,
      vectorDelta,
      claimBoundary:
        "Computed from public-safe supplied vectors only. Promotion to private user identity continuity requires a signed model-swap identity receipt.",
      requiredReceipt: "signed_model_swap_identity_receipt",
    },
  };
}
