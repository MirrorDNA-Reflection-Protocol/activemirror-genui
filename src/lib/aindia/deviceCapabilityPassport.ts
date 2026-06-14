import type { TrustReceipt } from "@/lib/trust/receipts";

export type AIndiaCapabilityLane =
  | "pwa"
  | "native-android"
  | "native-ios"
  | "browser-ai"
  | "server-fallback"
  | "share-rail";

export type AIndiaSupportStatus =
  | "mvp-ready"
  | "capability-check-required"
  | "native-wrapper-required"
  | "limited-browser-support"
  | "consented-fallback"
  | "roadmap";

export type AIndiaCapabilityId =
  | "pwa-offline-shell"
  | "android-mlkit-aicore"
  | "ios-foundation-models"
  | "browser-webgpu-webnn"
  | "sarvam-bhashini-server-fallback"
  | "whatsapp-share-intent";

export type AIndiaDeviceCapability = {
  id: AIndiaCapabilityId;
  lane: AIndiaCapabilityLane;
  label: string;
  shortLabel: string;
  supportStatus: AIndiaSupportStatus;
  copySafeStatus: string;
  userBenefit: string;
  whatCanRun: string[];
  mustCheck: string[];
  cannotPromise: string[];
  fallbackRoute: string;
  sourceUrls: string[];
};

export type AIndiaRoadmapPhase = "now" | "next" | "native-wrapper" | "future";

export type AIndiaShareTargetRoadmapItem = {
  id: AIndiaCapabilityId;
  phase: AIndiaRoadmapPhase;
  label: string;
  copySafeLabel: string;
  buildNote: string;
  consentBoundary: string;
};

export type AIndiaDeviceCapabilityPassport = {
  schema: "aindia-device-capability-passport-v1";
  updated: string;
  copyBoundary: string;
  capabilities: AIndiaDeviceCapability[];
  shareTargetRoadmap: AIndiaShareTargetRoadmapItem[];
};

export const aindiaDeviceCapabilities: AIndiaDeviceCapability[] = [
  {
    id: "pwa-offline-shell",
    lane: "pwa",
    label: "PWA offline shell",
    shortLabel: "Offline shell",
    supportStatus: "mvp-ready",
    copySafeStatus: "Works as an installed shell; helper packs still need checks.",
    userBenefit: "The first screen, language choice, local receipts, and saved source packs can stay useful when the network drops.",
    whatCanRun: [
      "Installed app shell",
      "Deterministic language and risk checks",
      "Local receipts",
      "Cached source packs after opt-in download",
    ],
    mustCheck: ["Service worker registration", "Cache availability", "Storage headroom", "Network cost before helper downloads"],
    cannotPromise: ["Full offline LLM on every phone", "Unlimited local storage", "Fresh web citations while offline"],
    fallbackRoute: "Stay in no-model mode and show last-known local guidance until connectivity returns.",
    sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps"],
  },
  {
    id: "android-mlkit-aicore",
    lane: "native-android",
    label: "Android ML Kit and AICore",
    shortLabel: "Android native AI",
    supportStatus: "native-wrapper-required",
    copySafeStatus: "Supported Android devices only; run the capability check first.",
    userBenefit: "A native Android wrapper can use on-device speech, rewriting, summarization, image description, and Gemini Nano prompt features when the device supports them.",
    whatCanRun: ["ML Kit GenAI APIs", "AICore-backed Gemini Nano where available", "ML Kit OCR and speech rails", "LiteRT-LM small-model experiments"],
    mustCheck: ["Device model allowlist", "Android API level", "AICore readiness", "Bootloader state", "Downloaded model availability", "Language support"],
    cannotPromise: ["All Android phones", "GrapheneOS AICore availability", "Unlocked bootloader support", "Full Indian-language coverage in every GenAI API"],
    fallbackRoute: "Use Android speech/OCR plus AIndia deterministic routing, then Sarvam/Bhashini or cloud only with consent.",
    sourceUrls: [
      "https://developers.google.com/ml-kit/genai",
      "https://developers.google.com/ml-kit/genai/prompt/android/get-started",
      "https://developers.google.com/edge/litert-lm",
    ],
  },
  {
    id: "ios-foundation-models",
    lane: "native-ios",
    label: "iOS Foundation Models",
    shortLabel: "iOS native AI",
    supportStatus: "native-wrapper-required",
    copySafeStatus: "Apple Intelligence devices only; not callable from the PWA.",
    userBenefit: "A Swift wrapper can call Apple's on-device model, speech, vision, translation, and app-intent rails behind the same AIndia gates.",
    whatCanRun: ["Foundation Models framework", "Speech", "Vision OCR", "Translation", "App Intents"],
    mustCheck: ["Apple Intelligence support", "Apple Intelligence enabled in Settings", "OS version", "Language availability", "Native app entitlement path"],
    cannotPromise: ["PWA access to Foundation Models", "Support on older iPhones", "Identical output across OS versions", "Complete Indic language coverage"],
    fallbackRoute: "Keep the PWA/local route active, then use Sarvam/Bhashini or consented provider fallback for unsupported languages or devices.",
    sourceUrls: [
      "https://developer.apple.com/documentation/FoundationModels",
      "https://developer.apple.com/apple-intelligence/",
      "https://developer.apple.com/documentation/FoundationModels/generating-content-and-performing-tasks-with-foundation-models",
    ],
  },
  {
    id: "browser-webgpu-webnn",
    lane: "browser-ai",
    label: "Browser WebGPU and WebNN",
    shortLabel: "Browser local AI",
    supportStatus: "limited-browser-support",
    copySafeStatus: "Experimental local acceleration; always feature-detect.",
    userBenefit: "Where available, the browser can accelerate small OCR, embedding, or helper-model workloads without installing a native app.",
    whatCanRun: ["WebGPU-backed small models", "WebNN experiments", "Transformers.js style helper packs", "Chrome desktop built-in AI where available"],
    mustCheck: ["HTTPS secure context", "navigator.gpu", "WebNN availability", "Model size", "Free storage", "Device thermals and battery"],
    cannotPromise: ["Baseline support across browsers", "Chrome Android or iOS Gemini Nano web APIs", "NPU acceleration in every browser", "Large Indic models on low-end phones"],
    fallbackRoute: "Use the PWA no-model route, cached source packs, or a consented server fallback.",
    sourceUrls: [
      "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API",
      "https://webmachinelearning.github.io/webnn-intro/",
      "https://developer.chrome.com/docs/ai/prompt-api",
    ],
  },
  {
    id: "sarvam-bhashini-server-fallback",
    lane: "server-fallback",
    label: "Sarvam and Bhashini fallback",
    shortLabel: "Indic server fallback",
    supportStatus: "consented-fallback",
    copySafeStatus: "Use only when local rails cannot solve the language task and the user approves upload.",
    userBenefit: "Indian-language translation, transliteration, speech, and helper reasoning can stay first-class even when the device cannot run the model locally.",
    whatCanRun: ["Translation", "Transliteration", "ASR/TTS", "Language normalization", "Server-side Indic model calls"],
    mustCheck: ["User consent", "Data class", "Purpose", "Provider availability", "Retention rule", "Receipt path"],
    cannotPromise: ["No-network operation", "Silent upload", "One provider covering every dialect/task", "High-stakes advice without source checks"],
    fallbackRoute: "Ask for consent, send the minimum text needed, write a receipt, and keep photos/files local unless explicitly approved.",
    sourceUrls: [
      "https://www.sarvam.ai/blogs/sarvam-translate",
      "https://huggingface.co/sarvamai/sarvam-translate",
      "https://bhashini.gov.in/",
    ],
  },
  {
    id: "whatsapp-share-intent",
    lane: "share-rail",
    label: "WhatsApp and share-intent rail",
    shortLabel: "Share to AIndia",
    supportStatus: "roadmap",
    copySafeStatus: "Future user-initiated share target; no background reading.",
    userBenefit: "A user can send a suspicious message, link, screenshot, or voice note into AIndia for a risk check without copying everything manually.",
    whatCanRun: ["PWA share target", "Android share intent", "iOS share extension", "Paste-message fallback"],
    mustCheck: ["User-initiated share event", "File type and size", "Sender context provided by user", "Fraud-risk classification", "Receipt policy"],
    cannotPromise: ["Reading WhatsApp in the background", "Bypassing app permissions", "Auto-sending replies", "Monitoring private chats"],
    fallbackRoute: "Keep paste-message and upload-photo actions as explicit manual inputs until native share targets are implemented.",
    sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API"],
  },
];

export const aindiaShareTargetRoadmap: AIndiaShareTargetRoadmapItem[] = [
  {
    id: "pwa-offline-shell",
    phase: "now",
    label: "Installable PWA shell",
    copySafeLabel: "Install AIndia for offline first screen and receipts.",
    buildNote: "Keep the offline promise limited to shell, cached packs, deterministic checks, and receipts.",
    consentBoundary: "No upload needed for shell use.",
  },
  {
    id: "sarvam-bhashini-server-fallback",
    phase: "next",
    label: "Consented Indic fallback",
    copySafeLabel: "Use server language help only after approval.",
    buildNote: "Attach Sarvam/Bhashini as provider adapters behind cloud_route_allowed and receipt_written gates.",
    consentBoundary: "Send minimum text only after purpose and retention are shown.",
  },
  {
    id: "android-mlkit-aicore",
    phase: "native-wrapper",
    label: "Android capability passport",
    copySafeLabel: "Use Android native AI where this phone supports it.",
    buildNote: "Kotlin wrapper should publish a capability JSON rather than letting the PWA guess.",
    consentBoundary: "Local native calls can run without upload; provider fallback still asks.",
  },
  {
    id: "ios-foundation-models",
    phase: "native-wrapper",
    label: "iOS capability passport",
    copySafeLabel: "Use Apple native AI where this iPhone supports it.",
    buildNote: "Swift wrapper should expose Foundation Models, Speech, Vision, and Translation support through the same passport shape.",
    consentBoundary: "Local native calls can run without upload; cloud handoff still asks.",
  },
  {
    id: "whatsapp-share-intent",
    phase: "future",
    label: "Share to AIndia",
    copySafeLabel: "Share a message or screenshot into AIndia when you choose.",
    buildNote: "Implement PWA Share Target first, then Android share intent and iOS share extension.",
    consentBoundary: "Only process user-shared content; never claim background WhatsApp access.",
  },
];

export const aindiaDeviceCapabilityPassport: AIndiaDeviceCapabilityPassport = {
  schema: "aindia-device-capability-passport-v1",
  updated: "2026-06-14",
  copyBoundary:
    "AIndia can promise a governed route and honest capability checks; it cannot promise every phone, browser, model, language, or share surface supports the same features.",
  capabilities: aindiaDeviceCapabilities,
  shareTargetRoadmap: aindiaShareTargetRoadmap,
};

export function getAIndiaCapability(id: AIndiaCapabilityId): AIndiaDeviceCapability {
  const capability = aindiaDeviceCapabilities.find((item) => item.id === id);
  if (!capability) {
    throw new Error(`Unknown AIndia capability: ${id}`);
  }
  return capability;
}

export function aindiaSupportStatusLabel(status: AIndiaSupportStatus) {
  switch (status) {
    case "mvp-ready":
      return "ready";
    case "capability-check-required":
      return "check first";
    case "native-wrapper-required":
      return "native wrapper";
    case "limited-browser-support":
      return "limited";
    case "consented-fallback":
      return "ask first";
    case "roadmap":
      return "roadmap";
  }
}

export function createAIndiaTrustReceipt({
  inputKind,
  source,
  riskState,
  nextStep,
}: {
  inputKind: "voice" | "photo" | "message";
  source: string;
  riskState: "safe" | "verify" | "risky";
  nextStep: string;
}): TrustReceipt {
  return {
    id: `aindia-demo-${inputKind}-${riskState}`,
    title: "What AIndia checked",
    summary: "Route, source, risk, consent, and next step are shown before the answer becomes advice.",
    local: {
      state: "local",
      label: "Local demo route",
      detail: "UI state, proof drawer, and receipt are generated in the browser.",
    },
    cloud: {
      state: "blocked",
      label: "No cloud call in this demo",
      detail: "Production cloud fallback must ask first.",
    },
    source: {
      state: source.toLowerCase().includes("demo") ? "source_pack" : "live_source",
      label: source,
      detail: source.toLowerCase().includes("demo") ? "Demo source pack, not a production citation." : undefined,
    },
    risk: {
      state: riskState,
      label: riskState === "risky" ? "Risk found" : riskState === "verify" ? "Needs verification" : "No risk rail fired",
      detail: riskState === "risky" ? "Verify before clicking, paying, replying, or submitting." : undefined,
    },
    consent: {
      state: "not_required",
      label: "No external processing",
      detail: "No account action, durable memory, or private file read is implied.",
    },
    receipt: {
      id: `ain-rec-${inputKind}-${riskState}`,
      issuedAt: "2026-06-14T00:00:00.000Z",
      hash: `demo-${inputKind}-${riskState}-route-source-risk-consent`,
      route: "browser demo -> local supervisor contract -> source pack -> safety rail -> next step",
    },
    fields: [
      {
        label: "Next step",
        value: nextStep,
        tone: riskState === "risky" ? "verify" : "safe",
      },
      {
        label: "Boundary",
        value: "Public-safe demo receipt. Does not prove phone mesh, full offline AI, or all-language parity.",
        tone: "neutral",
      },
    ],
  };
}
