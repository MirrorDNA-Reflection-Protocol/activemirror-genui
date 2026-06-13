export type AIndiaGateId =
  | "language_detected"
  | "local_storage_ready"
  | "device_model_checked"
  | "offline_download_allowed"
  | "safety_checked"
  | "cloud_route_allowed"
  | "human_approved"
  | "receipt_written";

export type AIndiaGateStatus = "pass" | "ask" | "block";

export type AIndiaContractId =
  | "wrapper"
  | "local-files"
  | "device-model-router"
  | "sarvam-language-rail"
  | "safety-rail"
  | "approval-gates"
  | "receipts"
  | "smart-contract-adapter";

export type AIndiaDeviceRailId =
  | "android-local-speech"
  | "android-aicore-gemini-nano"
  | "google-ai-edge-litert"
  | "apple-foundation-models"
  | "chrome-built-in-ai"
  | "browser-sarvam-helper"
  | "consented-frontier-cloud";

export type AIndiaContract = {
  id: AIndiaContractId;
  title: string;
  userText: string;
  enforcement: string;
  defaultState: AIndiaGateStatus;
  gateIds: AIndiaGateId[];
};

export type AIndiaDeviceRail = {
  id: AIndiaDeviceRailId;
  title: string;
  route: "mass-market" | "native-android" | "native-ios" | "desktop-web" | "pwa-web" | "cloud";
  mvpUse: string;
  strongestUse: string;
  constraint: string;
  sourceUrls: string[];
};

export type AIndiaGateResult = {
  gateId: AIndiaGateId;
  status: AIndiaGateStatus;
  reason: string;
  nextAction: string;
};

export type AIndiaGateInput = {
  languageKnown?: boolean;
  localStorageReady?: boolean;
  deviceModelChecked?: boolean;
  wantsOfflineDownload?: boolean;
  onWifiOrUnmetered?: boolean;
  hasStorageHeadroom?: boolean;
  safetyRiskDetected?: boolean;
  wantsCloudRoute?: boolean;
  userApproved?: boolean;
  sensitiveAction?: boolean;
  receiptWritten?: boolean;
};

export const aindiaContracts: AIndiaContract[] = [
  {
    id: "wrapper",
    title: "Wrapper contract",
    userText: "Speak, show a photo, or paste a message. AIndia replies with one next step.",
    enforcement: "The UI keeps voice/photo/message as the only primary inputs and keeps long-form chat secondary.",
    defaultState: "pass",
    gateIds: ["language_detected", "safety_checked"],
  },
  {
    id: "local-files",
    title: "Local file contract",
    userText: "Photos, screenshots, messages, and receipts stay on the device unless the user chooses to send them.",
    enforcement: "Browser storage, native app sandbox storage, and local receipts are default; upload requires an approval gate.",
    defaultState: "ask",
    gateIds: ["local_storage_ready", "cloud_route_allowed", "human_approved"],
  },
  {
    id: "device-model-router",
    title: "Device model contract",
    userText: "Use the best local model the phone can actually run.",
    enforcement: "Android AICore/Gemini Nano where supported, Google AI Edge LiteRT, Apple Foundation Models, Chrome built-in AI, or Sarvam helper are selected by capability, not branding.",
    defaultState: "ask",
    gateIds: ["device_model_checked", "offline_download_allowed"],
  },
  {
    id: "sarvam-language-rail",
    title: "Indian-language rail",
    userText: "Indian-language detection, translation, speech, and script handling stay first-class.",
    enforcement: "Sarvam/open Indic models and deterministic script detection run before any general-purpose model route.",
    defaultState: "pass",
    gateIds: ["language_detected", "offline_download_allowed"],
  },
  {
    id: "safety-rail",
    title: "Chetana safety contract",
    userText: "Suspicious links, UPI requests, bank messages, OTPs, and documents are checked before action.",
    enforcement: "Risk classifiers run before reply/action, and suspicious flows route to Chetana/Kavach.",
    defaultState: "pass",
    gateIds: ["safety_checked", "human_approved"],
  },
  {
    id: "approval-gates",
    title: "Human approval gates",
    userText: "AIndia cannot pay, send, upload, open an account, or change device settings without approval.",
    enforcement: "Sensitive actions are blocked until explicit user confirmation is present in the current session.",
    defaultState: "block",
    gateIds: ["human_approved"],
  },
  {
    id: "receipts",
    title: "Receipt contract",
    userText: "Important checks leave a simple local receipt: what was checked, what route ran, and what was recommended.",
    enforcement: "Receipts are local-first hashes with optional export or later external notarization.",
    defaultState: "ask",
    gateIds: ["receipt_written"],
  },
  {
    id: "smart-contract-adapter",
    title: "Smart contract adapter",
    userText: "The contract is policy first; blockchain notarization is optional.",
    enforcement: "Rules execute deterministically inside the app. A chain adapter can anchor receipts later, but the MVP does not depend on a chain.",
    defaultState: "ask",
    gateIds: ["receipt_written", "human_approved"],
  },
];

export const aindiaDeviceRails: AIndiaDeviceRail[] = [
  {
    id: "android-local-speech",
    title: "Android local speech",
    route: "mass-market",
    mvpUse: "Broad voice-first entry point for low-literacy users.",
    strongestUse: "On-device speech recognition, then local language routing.",
    constraint: "This is not a general LLM; it is the mass-market input rail.",
    sourceUrls: ["https://developers.google.com/ml-kit/genai"],
  },
  {
    id: "android-aicore-gemini-nano",
    title: "Android native model rail",
    route: "native-android",
    mvpUse: "Native Android wrapper for supported phones.",
    strongestUse: "Summarization, proofreading, rewriting, image description, speech recognition, and Prompt API through ML Kit GenAI.",
    constraint: "Prompt API support is still a supported-device list, not all Android phones; validated Prompt API languages are limited.",
    sourceUrls: [
      "https://developers.google.com/ml-kit/genai",
      "https://developers.google.com/ml-kit/genai/prompt/android/get-started",
    ],
  },
  {
    id: "google-ai-edge-litert",
    title: "Google AI Edge LiteRT-LM",
    route: "native-android",
    mvpUse: "Custom small-model rail for Android first, then iOS and web as the runtime stabilizes.",
    strongestUse: "Gemma-class edge models, function calling, and offline local inference where hardware allows.",
    constraint: "Model size, RAM, WebGPU, and battery decide whether the phone gets a full helper or a smaller language pack.",
    sourceUrls: [
      "https://developers.google.com/edge/litert-lm",
      "https://developers.google.com/edge/litert-lm/models/gemma-4",
      "https://developers.googleblog.com/gemma-3-on-mobile-and-web-with-google-ai-edge/",
    ],
  },
  {
    id: "apple-foundation-models",
    title: "Apple Foundation Models",
    route: "native-ios",
    mvpUse: "Native iOS wrapper for Apple Intelligence-enabled iPhones.",
    strongestUse: "On-device Foundation Models, vision, Private Cloud Compute handoff, and Apple model abstractions in a Swift shell.",
    constraint: "A PWA cannot directly call Foundation Models; Indian-language support still needs the AIndia/Sarvam rail.",
    sourceUrls: [
      "https://developer.apple.com/documentation/FoundationModels",
      "https://developer.apple.com/videos/play/wwdc2026/241/",
      "https://support.apple.com/en-us/121115",
    ],
  },
  {
    id: "chrome-built-in-ai",
    title: "Chrome built-in AI",
    route: "desktop-web",
    mvpUse: "Use in desktop Chrome/Chromebook Plus demos when available.",
    strongestUse: "Gemini Nano Prompt API in browser after model availability check and user activation.",
    constraint: "Chrome for Android and iOS are not yet supported for Gemini Nano web APIs.",
    sourceUrls: ["https://developer.chrome.com/docs/ai/prompt-api"],
  },
  {
    id: "browser-sarvam-helper",
    title: "Browser Sarvam helper",
    route: "pwa-web",
    mvpUse: "AIndia PWA downloads only the shell first, then optional Indian-language helper packs.",
    strongestUse: "Script detection, translation, local receipts, and small helper models in browser storage.",
    constraint: "Full Indic models may be too large for low-end phones; downloads must be opt-in on Wi-Fi/unmetered connections.",
    sourceUrls: [
      "https://huggingface.co/sarvamai/sarvam-translate",
      "https://www.sarvam.ai/blogs/sarvam-translate",
      "https://huggingface.co/sarvamai/sarvam-1",
    ],
  },
  {
    id: "consented-frontier-cloud",
    title: "Consented frontier fallback",
    route: "cloud",
    mvpUse: "Use frontier models only when the local route cannot do the job.",
    strongestUse: "OpenAI, Anthropic, Gemini, Sarvam API, or another provider behind task-specific gates.",
    constraint: "Cloud is a fallback, not the sovereign core; upload requires consent and a receipt.",
    sourceUrls: [],
  },
];

export function evaluateAIndiaGates(input: AIndiaGateInput): AIndiaGateResult[] {
  const results: AIndiaGateResult[] = [];

  results.push({
    gateId: "language_detected",
    status: input.languageKnown ? "pass" : "ask",
    reason: input.languageKnown ? "Language is known for this turn." : "Language has not been established.",
    nextAction: input.languageKnown ? "Continue in the detected language." : "Detect script, browser language, or ask the user once.",
  });

  results.push({
    gateId: "local_storage_ready",
    status: input.localStorageReady ? "pass" : "ask",
    reason: input.localStorageReady ? "Local storage is available." : "Local storage has not been confirmed.",
    nextAction: input.localStorageReady ? "Keep files local by default." : "Check browser/native storage before saving files.",
  });

  results.push({
    gateId: "device_model_checked",
    status: input.deviceModelChecked ? "pass" : "ask",
    reason: input.deviceModelChecked ? "The runtime capability check has run." : "The app does not yet know which local model rail is available.",
    nextAction: input.deviceModelChecked ? "Use the strongest available local rail." : "Run native/browser capability checks before promising offline AI.",
  });

  const offlineAllowed = !input.wantsOfflineDownload || Boolean(input.onWifiOrUnmetered && input.hasStorageHeadroom);
  results.push({
    gateId: "offline_download_allowed",
    status: offlineAllowed ? "pass" : "ask",
    reason: offlineAllowed ? "Offline helper download is safe for this session." : "A model/helper download needs Wi-Fi or storage confirmation.",
    nextAction: offlineAllowed ? "Download or refresh helper packs in the background." : "Show size and network warning before download.",
  });

  results.push({
    gateId: "safety_checked",
    status: input.safetyRiskDetected ? "ask" : "pass",
    reason: input.safetyRiskDetected ? "The input may involve fraud, payment, identity, or document risk." : "No sensitive risk marker was detected.",
    nextAction: input.safetyRiskDetected ? "Route through Chetana/Kavach and slow the user down." : "Continue with the normal helper response.",
  });

  results.push({
    gateId: "cloud_route_allowed",
    status: input.wantsCloudRoute ? (input.userApproved ? "pass" : "ask") : "pass",
    reason: input.wantsCloudRoute ? "The requested route may send data outside the device." : "No cloud route requested.",
    nextAction: input.wantsCloudRoute && !input.userApproved ? "Ask for explicit approval before upload." : "Prefer local execution.",
  });

  results.push({
    gateId: "human_approved",
    status: input.sensitiveAction ? (input.userApproved ? "pass" : "block") : "pass",
    reason: input.sensitiveAction ? "This is a sensitive action." : "No sensitive action is requested.",
    nextAction: input.sensitiveAction && !input.userApproved ? "Block payment, send, file, account, or device action until confirmed." : "Proceed without privileged action.",
  });

  results.push({
    gateId: "receipt_written",
    status: input.receiptWritten ? "pass" : "ask",
    reason: input.receiptWritten ? "A local receipt exists." : "Important decisions should leave a local receipt.",
    nextAction: input.receiptWritten ? "Offer export or notarization only if needed." : "Write a local hash receipt for high-risk checks.",
  });

  return results;
}
