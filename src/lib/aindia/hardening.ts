import { aindiaContracts, type AIndiaGateId } from "./contracts";
import { aindiaHooks } from "./runtime";
import {
  makeAIndiaEnvelope,
  type AIndiaConsentEnvelope,
  type AIndiaInputKind,
  type AIndiaRiskClass,
  type AIndiaRuntimeEnvelope,
  type AIndiaWrapperTarget,
} from "./wrapperProtocol";

export type AIndiaValidationSeverity = "pass" | "warn" | "block";

export type AIndiaHardeningControl = {
  id: string;
  title: string;
  invariant: string;
  enforcement: string;
};

export type AIndiaEnvelopeValidation = {
  ok: boolean;
  severity: AIndiaValidationSeverity;
  blocks: string[];
  warnings: string[];
  requiredGates: string[];
};

type PayloadRef = AIndiaRuntimeEnvelope["payloadRef"];

const validTargets = new Set<AIndiaWrapperTarget>(["pwa", "android", "ios", "provider", "enterprise"]);
const validInputKinds = new Set<AIndiaInputKind>(["voice", "photo", "message", "document", "source-query", "action"]);
const validRiskClasses = new Set<AIndiaRiskClass>([
  "normal",
  "money",
  "identity",
  "document",
  "device",
  "account",
  "child",
  "unknown",
]);
const validStorage = new Set<PayloadRef["storage"]>(["memory", "indexeddb", "opfs", "native-sandbox", "provider"]);
const validRetention = new Set<AIndiaConsentEnvelope["retention"]>([
  "session",
  "local-receipt",
  "user-export",
  "provider-policy",
]);
const knownHookIds = new Set(aindiaHooks.map((hook) => hook.id));
const knownGateIds = new Set<AIndiaGateId>(aindiaContracts.flatMap((contract) => contract.gateIds));
const safeUriPattern = /^(aindia|memory|indexeddb|opfs|native|provider):\/\//;

export const aindiaHardeningControls: AIndiaHardeningControl[] = [
  {
    id: "fail-closed-capability",
    title: "Fail-closed capability",
    invariant: "Unknown device/model capability cannot be advertised as available.",
    enforcement: "Wrappers must emit capability reports before the harness can route to OS-native or provider rails.",
  },
  {
    id: "consent-envelope",
    title: "Consent envelope",
    invariant: "Every upload-capable route carries purpose, data classes, retention, and explicit approval.",
    enforcement: "Cloud/provider envelopes block when consent is missing, contradictory, or too broad.",
  },
  {
    id: "local-file-boundary",
    title: "Local file boundary",
    invariant: "Local-only files cannot be addressed through provider storage or uploaded routes.",
    enforcement: "The validator blocks localOnly plus mayUpload, provider target plus localOnly, and unsafe payload URI schemes.",
  },
  {
    id: "sensitive-action-gate",
    title: "Sensitive action gate",
    invariant: "Money, identity, document, account, device, child, and action flows require human approval.",
    enforcement: "The harness requires human_approved before execution and leaves the route in a blocked state otherwise.",
  },
  {
    id: "known-hook-only",
    title: "Known hook only",
    invariant: "Wrappers can call only registered hooks.",
    enforcement: "Unknown hook ids and unknown gate ids block the envelope before any model/provider route.",
  },
  {
    id: "receipt-required",
    title: "Receipt required",
    invariant: "High-risk checks should be auditable locally.",
    enforcement: "Non-normal risk classes warn unless the route includes receipt_written or local-receipt retention.",
  },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isShortString(value: unknown, max = 240): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validateConsent(value: unknown, blocks: string[], warnings: string[]): value is AIndiaConsentEnvelope {
  const initialBlockCount = blocks.length;
  if (!isObject(value)) {
    blocks.push("consent must be an object");
    return false;
  }

  if (!isShortString(value.purpose, 240) || String(value.purpose).trim().length < 5) {
    blocks.push("consent.purpose must be specific");
  }

  if (!Array.isArray(value.dataClasses) || value.dataClasses.length === 0 || value.dataClasses.length > 12) {
    blocks.push("consent.dataClasses must list 1-12 data classes");
  } else if (!value.dataClasses.every((item) => isShortString(item, 80))) {
    blocks.push("consent.dataClasses contains an invalid entry");
  }

  if (typeof value.localOnly !== "boolean") blocks.push("consent.localOnly must be boolean");
  if (typeof value.mayUpload !== "boolean") blocks.push("consent.mayUpload must be boolean");
  if (typeof value.userApproved !== "boolean") blocks.push("consent.userApproved must be boolean");
  if (!validRetention.has(value.retention as AIndiaConsentEnvelope["retention"])) {
    blocks.push("consent.retention is not allowed");
  }

  if (value.localOnly === true && value.mayUpload === true) {
    blocks.push("consent cannot be both localOnly and mayUpload");
  }

  if (value.mayUpload === true && value.userApproved !== true) {
    blocks.push("upload-capable routes require explicit user approval");
  }

  if (value.mayUpload === true && value.retention === "session") {
    warnings.push("upload route with session retention needs provider retention review");
  }

  return blocks.length === initialBlockCount;
}

function validatePayloadRef(value: unknown, blocks: string[]): value is PayloadRef {
  const initialBlockCount = blocks.length;
  if (!isObject(value)) {
    blocks.push("payloadRef must be an object");
    return false;
  }

  if (!validStorage.has(value.storage as PayloadRef["storage"])) {
    blocks.push("payloadRef.storage is not allowed");
  }

  if (!isShortString(value.uri, 512)) {
    blocks.push("payloadRef.uri is required");
  } else {
    const uri = String(value.uri);
    if (/^(javascript|data|http|https):/i.test(uri)) {
      blocks.push("payloadRef.uri cannot use javascript, data, http, or https schemes");
    }
    if (!safeUriPattern.test(uri)) {
      blocks.push("payloadRef.uri must use an AIndia-local or provider scheme");
    }
  }

  if (value.sha256 !== undefined && (typeof value.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(value.sha256))) {
    blocks.push("payloadRef.sha256 must be a 64-character hex digest");
  }

  return blocks.length === initialBlockCount;
}

export function validateAIndiaRuntimeEnvelope(candidate: unknown): AIndiaEnvelopeValidation {
  const blocks: string[] = [];
  const warnings: string[] = [];

  if (!isObject(candidate)) {
    return {
      ok: false,
      severity: "block",
      blocks: ["envelope must be an object"],
      warnings,
      requiredGates: [],
    };
  }

  if (candidate.envelopeVersion !== "aindia-runtime-v1") blocks.push("unsupported envelopeVersion");
  if (!isShortString(candidate.requestId, 128) || !/^[a-zA-Z0-9._:-]+$/.test(String(candidate.requestId))) {
    blocks.push("requestId contains unsupported characters");
  }
  if (!validTargets.has(candidate.target as AIndiaWrapperTarget)) blocks.push("target is not allowed");
  if (!validInputKinds.has(candidate.inputKind as AIndiaInputKind)) blocks.push("inputKind is not allowed");
  if (!knownHookIds.has(String(candidate.hookId))) blocks.push("hookId is not registered");
  if (!isShortString(candidate.languageCode, 16) || !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(String(candidate.languageCode))) {
    blocks.push("languageCode must be a compact BCP-47-like tag");
  }
  if (!validRiskClasses.has(candidate.riskClass as AIndiaRiskClass)) blocks.push("riskClass is not allowed");

  const consentOk = validateConsent(candidate.consent, blocks, warnings);
  const payloadOk = validatePayloadRef(candidate.payloadRef, blocks);
  const requiredGates = Array.isArray(candidate.requiredGates)
    ? candidate.requiredGates.filter((gate): gate is string => typeof gate === "string")
    : [];

  if (!Array.isArray(candidate.requiredGates)) blocks.push("requiredGates must be an array");
  for (const gate of requiredGates) {
    if (!knownGateIds.has(gate as AIndiaGateId)) blocks.push(`unknown gate: ${gate}`);
  }

  if (consentOk && payloadOk) {
    const envelope = candidate as AIndiaRuntimeEnvelope;
    const expected = makeAIndiaEnvelope(envelope).requiredGates;
    for (const gate of expected) {
      if (!requiredGates.includes(gate)) blocks.push(`missing required gate: ${gate}`);
    }

    if ((envelope.target === "provider" || envelope.payloadRef.storage === "provider") && envelope.consent.localOnly) {
      blocks.push("provider routes cannot be marked localOnly");
    }

    if ((envelope.target === "provider" || envelope.payloadRef.storage === "provider") && !envelope.consent.mayUpload) {
      blocks.push("provider routes must declare mayUpload");
    }

    if (envelope.riskClass !== "normal" && envelope.consent.retention !== "local-receipt" && !requiredGates.includes("receipt_written")) {
      warnings.push("high-risk envelope should retain a local receipt or include receipt_written");
    }
  }

  return {
    ok: blocks.length === 0,
    severity: blocks.length > 0 ? "block" : warnings.length > 0 ? "warn" : "pass",
    blocks,
    warnings,
    requiredGates,
  };
}
