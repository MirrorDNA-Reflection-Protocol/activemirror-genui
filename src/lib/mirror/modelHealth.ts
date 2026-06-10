import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type ModelProviderId = "gemini" | "openai" | "anthropic";

export type ModelRouteCandidate = {
  provider: "gemini" | "openai";
  label: string;
  modelId: string;
  model: LanguageModel;
  reason: string;
};

type ObservedProviderState = {
  status: "healthy" | "degraded";
  modelId: string;
  observedAt: string;
  errorClass?: string;
};

type ObservedState = Partial<Record<ModelProviderId, ObservedProviderState>>;

export type ModelProviderHealth = {
  id: ModelProviderId | "local";
  label: string;
  role: string;
  modelId: string | null;
  status: "healthy" | "degraded" | "configured_unchecked" | "configured_not_wired" | "unconfigured" | "gated";
  secretState: "present" | "missing" | "not_required";
  routeUse: string;
  lastObservedAt: string | null;
  lastErrorClass: string | null;
  publicMessage: string;
};

export type ModelHealthSnapshot = {
  schemaVersion: "active_mirror.model_health.v1";
  generatedAt: string;
  claimBoundary: string;
  activePublicOrder: string[];
  sensitiveRoute: string;
  providers: ModelProviderHealth[];
};

const STATE_PATH =
  process.env.ACTIVE_MIRROR_MODEL_HEALTH_PATH ||
  join(
    tmpdir(),
    `active-mirror-model-health-${createHash("sha1").update(process.cwd()).digest("hex").slice(0, 12)}.json`,
  );

function readState(): ObservedState {
  try {
    if (!existsSync(STATE_PATH)) return {};
    return JSON.parse(readFileSync(STATE_PATH, "utf8")) as ObservedState;
  } catch {
    return {};
  }
}

function writeState(state: ObservedState) {
  try {
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), { mode: 0o600 });
  } catch {
    // Health recording must never break the public route.
  }
}

export function classifyModelError(error: unknown) {
  const value = error instanceof Error ? error.message : String(error || "");
  const lower = value.toLowerCase();
  if (lower.includes("leaked") || lower.includes("permission_denied") || lower.includes("api key") || lower.includes("401") || lower.includes("403")) {
    return "credential_rejected";
  }
  if (lower.includes("schema") || lower.includes("response_format")) return "schema_rejected";
  if (lower.includes("timeout") || lower.includes("timed out")) return "timeout";
  if (lower.includes("rate") || lower.includes("429")) return "rate_limited";
  return "provider_error";
}

export function isSensitiveModelPrompt(prompt: string) {
  return /\b(private|secret|credential|password|vault|local only|sovereign|sarvam|hindi|tamil|telugu|kannada|malayalam|marathi|bengali|pan|aadhaar|account|bank|device|files?|email inbox|calendar)\b/i.test(prompt);
}

export function configuredWorkOsModelRoutes() {
  const routes: ModelRouteCandidate[] = [];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const modelId = process.env.ACTIVE_MIRROR_GEMINI_MODEL || "gemini-2.5-flash";
    routes.push({
      provider: "gemini",
      label: `gemini · ${modelId.replace(/^gemini-/, "")}`,
      modelId,
      model: google(modelId),
      reason: "workhorse fast route",
    });
  }

  if (process.env.OPENAI_API_KEY) {
    const modelId = process.env.ACTIVE_MIRROR_OPENAI_MODEL || process.env.MIRROR_OPENAI_MODEL || "gpt-4.1-mini";
    routes.push({
      provider: "openai",
      label: `openai · ${modelId}`,
      modelId,
      model: openai(modelId),
      reason: routes.length ? "fallback workhorse route" : "workhorse fast route",
    });
  }

  return routes;
}

export function recordModelRouteSuccess(provider: ModelProviderId, modelId: string) {
  const state = readState();
  state[provider] = {
    status: "healthy",
    modelId,
    observedAt: new Date().toISOString(),
  };
  writeState(state);
}

export function recordModelRouteFailure(provider: ModelProviderId, modelId: string, error: unknown) {
  const state = readState();
  state[provider] = {
    status: "degraded",
    modelId,
    observedAt: new Date().toISOString(),
    errorClass: classifyModelError(error),
  };
  writeState(state);
}

function configuredProviderStatus(input: {
  id: ModelProviderId;
  label: string;
  role: string;
  modelId: string | null;
  hasKey: boolean;
  wired: boolean;
  routeUse: string;
  observed?: ObservedProviderState;
}): ModelProviderHealth {
  if (!input.hasKey) {
    return {
      id: input.id,
      label: input.label,
      role: input.role,
      modelId: input.modelId,
      status: "unconfigured",
      secretState: "missing",
      routeUse: input.routeUse,
      lastObservedAt: null,
      lastErrorClass: null,
      publicMessage: "No provider key is configured for this lane.",
    };
  }

  if (!input.wired) {
    return {
      id: input.id,
      label: input.label,
      role: input.role,
      modelId: input.modelId,
      status: "configured_not_wired",
      secretState: "present",
      routeUse: input.routeUse,
      lastObservedAt: null,
      lastErrorClass: null,
      publicMessage: "Credentials exist, but this Work OS route does not call that provider yet.",
    };
  }

  if (input.observed) {
    return {
      id: input.id,
      label: input.label,
      role: input.role,
      modelId: input.observed.modelId || input.modelId,
      status: input.observed.status,
      secretState: "present",
      routeUse: input.routeUse,
      lastObservedAt: input.observed.observedAt,
      lastErrorClass: input.observed.errorClass || null,
      publicMessage:
        input.observed.status === "healthy"
          ? "A recent Work OS turn completed through this provider."
          : "A recent Work OS turn attempted this provider and failed before fallback.",
    };
  }

  return {
    id: input.id,
    label: input.label,
    role: input.role,
    modelId: input.modelId,
    status: "configured_unchecked",
    secretState: "present",
    routeUse: input.routeUse,
    lastObservedAt: null,
    lastErrorClass: null,
    publicMessage: "Credentials are present, but no route success or failure has been observed in this process yet.",
  };
}

export function getModelHealthSnapshot(): ModelHealthSnapshot {
  const observed = readState();
  const geminiModel = process.env.ACTIVE_MIRROR_GEMINI_MODEL || "gemini-2.5-flash";
  const openaiModel = process.env.ACTIVE_MIRROR_OPENAI_MODEL || process.env.MIRROR_OPENAI_MODEL || "gpt-4.1-mini";
  const anthropicModel = process.env.ANTHROPIC_MODEL || process.env.ACTIVE_MIRROR_ANTHROPIC_MODEL || "not_wired";

  const providers: ModelProviderHealth[] = [
    configuredProviderStatus({
      id: "gemini",
      label: "Gemini",
      role: "primary fast workhorse",
      modelId: geminiModel,
      hasKey: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
      wired: true,
      routeUse: "first hosted route for public Work OS turns",
      observed: observed.gemini,
    }),
    configuredProviderStatus({
      id: "openai",
      label: "OpenAI",
      role: "fallback workhorse",
      modelId: openaiModel,
      hasKey: Boolean(process.env.OPENAI_API_KEY),
      wired: true,
      routeUse: "fallback hosted route for public Work OS turns",
      observed: observed.openai,
    }),
    configuredProviderStatus({
      id: "anthropic",
      label: "Anthropic",
      role: "reserved quality lane",
      modelId: process.env.ANTHROPIC_API_KEY ? anthropicModel : null,
      hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
      wired: false,
      routeUse: "not used by /api/mirror/work-os yet",
      observed: observed.anthropic,
    }),
    {
      id: "local",
      label: "Local gated route",
      role: "sensitive/private boundary",
      modelId: null,
      status: "gated",
      secretState: "not_required",
      routeUse: "selected when the prompt asks for private, device, vault, account, or local-only work",
      lastObservedAt: null,
      lastErrorClass: null,
      publicMessage: "The public site can hold the route and explain the approval boundary; private body execution is separate.",
    },
  ];

  return {
    schemaVersion: "active_mirror.model_health.v1",
    generatedAt: new Date().toISOString(),
    claimBoundary: "Public-safe route health only. No secrets, prompt text, private files, account data, or raw provider responses are exposed.",
    activePublicOrder: configuredWorkOsModelRoutes().map((route) => route.label),
    sensitiveRoute: "local · gated",
    providers,
  };
}
