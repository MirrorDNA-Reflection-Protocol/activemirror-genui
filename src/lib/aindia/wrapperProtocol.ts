export type AIndiaWrapperTarget = "pwa" | "android" | "ios" | "provider" | "enterprise";

export type AIndiaInputKind = "voice" | "photo" | "message" | "document" | "source-query" | "action";

export type AIndiaRiskClass = "normal" | "money" | "identity" | "document" | "device" | "account" | "child" | "unknown";

export type AIndiaCapabilityStatus = "available" | "unavailable" | "needs-download" | "needs-consent" | "unknown";

export type AIndiaNativeCapability = {
  id: string;
  target: AIndiaWrapperTarget;
  title: string;
  hookId: string;
  task: string;
  local: boolean;
  defaultStatus: AIndiaCapabilityStatus;
  gate: string;
};

export type AIndiaConsentEnvelope = {
  purpose: string;
  dataClasses: string[];
  localOnly: boolean;
  mayUpload: boolean;
  retention: "session" | "local-receipt" | "user-export" | "provider-policy";
  userApproved: boolean;
};

export type AIndiaRuntimeEnvelope = {
  envelopeVersion: "aindia-runtime-v1";
  requestId: string;
  target: AIndiaWrapperTarget;
  inputKind: AIndiaInputKind;
  hookId: string;
  languageCode: string;
  riskClass: AIndiaRiskClass;
  consent: AIndiaConsentEnvelope;
  payloadRef: {
    storage: "memory" | "indexeddb" | "opfs" | "native-sandbox" | "provider";
    uri: string;
    sha256?: string;
  };
  requiredGates: string[];
};

export type AIndiaWrapperMilestone = {
  title: string;
  owner: AIndiaWrapperTarget;
  ship: string;
  acceptance: string[];
};

export const aindiaNativeCapabilities: AIndiaNativeCapability[] = [
  {
    id: "pwa.serviceWorker",
    target: "pwa",
    title: "Installable shell",
    hookId: "source-pack-hook",
    task: "Cache app shell, manifest, contracts API, and offline first screen.",
    local: true,
    defaultStatus: "available",
    gate: "local_storage_ready",
  },
  {
    id: "pwa.localStoragePack",
    target: "pwa",
    title: "Local source packs",
    hookId: "source-pack-hook",
    task: "Store source packs, receipts, and small helper indexes in IndexedDB or OPFS.",
    local: true,
    defaultStatus: "needs-download",
    gate: "offline_download_allowed",
  },
  {
    id: "pwa.shareTarget",
    target: "pwa",
    title: "Share target",
    hookId: "share-hook",
    task: "Receive pasted/shared messages and screenshots as explicit user input.",
    local: true,
    defaultStatus: "unknown",
    gate: "human_approved",
  },
  {
    id: "android.mlkitGenAi",
    target: "android",
    title: "ML Kit GenAI",
    hookId: "device-model-hook",
    task: "Use Gemini Nano-backed summarization, rewriting, proofreading, image description, and prompt APIs when supported.",
    local: true,
    defaultStatus: "unknown",
    gate: "device_model_checked",
  },
  {
    id: "android.litertLm",
    target: "android",
    title: "LiteRT-LM",
    hookId: "device-model-hook",
    task: "Run custom Gemma-class or small local models with explicit model-pack manifests.",
    local: true,
    defaultStatus: "unknown",
    gate: "device_model_checked",
  },
  {
    id: "android.mlkitOcr",
    target: "android",
    title: "ML Kit OCR",
    hookId: "photo-hook",
    task: "Extract text from screenshots, forms, bills, notices, and QR/payment proofs before model routing.",
    local: true,
    defaultStatus: "unknown",
    gate: "safety_checked",
  },
  {
    id: "android.shareIntent",
    target: "android",
    title: "Android share intent",
    hookId: "share-hook",
    task: "Accept WhatsApp/SMS/browser shares only when the user explicitly invokes AIndia.",
    local: true,
    defaultStatus: "unknown",
    gate: "human_approved",
  },
  {
    id: "ios.foundationModels",
    target: "ios",
    title: "Foundation Models",
    hookId: "device-model-hook",
    task: "Use Apple Intelligence on-device language model for guided generation and tool-like local tasks.",
    local: true,
    defaultStatus: "unknown",
    gate: "device_model_checked",
  },
  {
    id: "ios.speechVisionTranslation",
    target: "ios",
    title: "Speech, Vision, Translation",
    hookId: "voice-hook",
    task: "Transcribe, read documents, and translate with native Apple frameworks where available.",
    local: true,
    defaultStatus: "unknown",
    gate: "language_detected",
  },
  {
    id: "ios.appIntents",
    target: "ios",
    title: "App Intents",
    hookId: "action-hook",
    task: "Expose approved AIndia actions to Siri, Shortcuts, Spotlight, and Apple Intelligence.",
    local: true,
    defaultStatus: "unknown",
    gate: "human_approved",
  },
  {
    id: "provider.sarvam",
    target: "provider",
    title: "Sarvam provider adapter",
    hookId: "indic-model-hook",
    task: "Route speech, translation, TTS, document, and LLM work to Sarvam only after the harness approves the purpose.",
    local: false,
    defaultStatus: "needs-consent",
    gate: "cloud_route_allowed",
  },
  {
    id: "provider.perplexity",
    target: "provider",
    title: "Perplexity/Sonar adapter",
    hookId: "source-pack-hook",
    task: "Run live web search and citation answers when local source packs cannot answer.",
    local: false,
    defaultStatus: "needs-consent",
    gate: "cloud_route_allowed",
  },
];

export const aindiaWrapperMilestones: AIndiaWrapperMilestone[] = [
  {
    title: "PWA bootloader",
    owner: "pwa",
    ship: "Today",
    acceptance: [
      "Installable AIndia route",
      "Contracts API exposes runtime protocol",
      "Offline first screen cached",
      "No cloud route without consent",
    ],
  },
  {
    title: "Android sovereign wrapper",
    owner: "android",
    ship: "Next",
    acceptance: [
      "Kotlin bridge emits AIndia runtime envelopes",
      "Capability probe reports ML Kit GenAI, OCR, speech, share intents, and LiteRT-LM availability",
      "Sensitive actions require harness approval",
      "Native results write local receipts",
    ],
  },
  {
    title: "iOS sovereign wrapper",
    owner: "ios",
    ship: "Next",
    acceptance: [
      "Swift bridge emits AIndia runtime envelopes",
      "Capability probe reports Foundation Models, Speech, Vision, Translation, and App Intents",
      "Apple Intelligence limitations are visible to the harness",
      "No App Intent can bypass approval gates",
    ],
  },
  {
    title: "Provider switchboard",
    owner: "provider",
    ship: "Next",
    acceptance: [
      "Sarvam, Bhashini, Perplexity, OpenAI, Gemini, and Anthropic are adapter contracts",
      "Every upload has purpose, consent, data classes, and receipt",
      "Citations and source freshness are mandatory for answer-engine routes",
    ],
  },
];

export function makeAIndiaEnvelope(
  input: Omit<AIndiaRuntimeEnvelope, "envelopeVersion" | "requiredGates"> & { requiredGates?: string[] },
): AIndiaRuntimeEnvelope {
  const gates = new Set(input.requiredGates ?? ["language_detected", "safety_checked"]);
  if (input.consent.mayUpload) gates.add("cloud_route_allowed");
  if (input.riskClass !== "normal") gates.add("human_approved");
  if (input.inputKind === "action") gates.add("human_approved");
  return {
    ...input,
    envelopeVersion: "aindia-runtime-v1",
    requiredGates: Array.from(gates),
  };
}

export function summarizeWrapperReadiness(target: AIndiaWrapperTarget) {
  const capabilities = aindiaNativeCapabilities.filter((capability) => capability.target === target);
  const local = capabilities.filter((capability) => capability.local).length;
  const needsConsent = capabilities.filter((capability) => capability.defaultStatus === "needs-consent").length;
  return {
    target,
    capabilities: capabilities.length,
    local,
    needsConsent,
    gates: Array.from(new Set(capabilities.map((capability) => capability.gate))),
  };
}

