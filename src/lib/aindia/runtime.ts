export type AIndiaRuntimeLayerId = "bootloader" | "hooks" | "harness" | "wrappers";

export type AIndiaRuntimeLayer = {
  id: AIndiaRuntimeLayerId;
  title: string;
  job: string;
  owns: string[];
  failClosedRule: string;
};

export type AIndiaHook = {
  id: string;
  group: "input" | "device" | "model" | "source" | "safety" | "output" | "action";
  title: string;
  contract: string;
  examples: string[];
};

export type AIndiaWrapper = {
  id: string;
  title: string;
  target: "pwa" | "android" | "ios" | "provider" | "enterprise";
  exposes: string[];
  cannotDo: string;
};

export const aindiaRuntimeLayers: AIndiaRuntimeLayer[] = [
  {
    id: "bootloader",
    title: "Bootloader",
    job: "Start every session by detecting language, device, storage, network, model availability, source packs, and risk class.",
    owns: [
      "first-run consent",
      "language/script detection",
      "device capability probe",
      "offline pack manifest",
      "safe default route",
    ],
    failClosedRule: "If capability is unknown, promise only the PWA shell and deterministic checks.",
  },
  {
    id: "hooks",
    title: "Hooks",
    job: "Attach inputs, device-native models, source packs, safety rails, and output channels through typed contracts.",
    owns: [
      "voice/photo/message/share hooks",
      "capability-checked Android ML Kit/AICore/LiteRT hooks",
      "iOS Foundation Models/Speech/Vision hooks",
      "Sarvam/Bhashini/source hooks",
      "receipt and speech output hooks",
    ],
    failClosedRule: "A hook cannot read, upload, pay, send, or mutate state outside its declared contract.",
  },
  {
    id: "harness",
    title: "Harness",
    job: "Run policy, routing, prompts, grounding, approvals, evals, and receipts before and after model calls.",
    owns: [
      "contract gates",
      "model routing",
      "source grounding",
      "fraud/safety checks",
      "DPDP consent ledger",
      "local receipt writer",
    ],
    failClosedRule: "Sensitive actions block until approval and a receipt path exist.",
  },
  {
    id: "wrappers",
    title: "Wrappers",
    job: "Ship the same sovereign runtime through PWA, Android, iOS, provider adapters, and enterprise/OEM shells.",
    owns: [
      "PWA install shell",
      "Android Kotlin wrapper",
      "iOS Swift wrapper",
      "Sarvam/Perplexity/frontier provider adapters",
      "SME/institution deployment skins",
    ],
    failClosedRule: "Wrappers expose capability; they do not bypass the harness.",
  },
];

export const aindiaHooks: AIndiaHook[] = [
  {
    id: "voice-hook",
    group: "input",
    title: "Voice hook",
    contract: "Capture speech, detect language, transcribe locally when possible, and hand text plus confidence to the harness.",
    examples: ["Android speech", "Apple SpeechAnalyzer", "Sarvam ASR", "AI4Bharat IndicConformer"],
  },
  {
    id: "photo-hook",
    group: "input",
    title: "Photo and screenshot hook",
    contract: "Extract text/layout/risk markers before any reasoning model receives the image.",
    examples: ["ML Kit OCR", "Apple Vision", "Sarvam Vision/Akshar", "payment screenshot classifier"],
  },
  {
    id: "share-hook",
    group: "input",
    title: "Share hook",
    contract: "Accept WhatsApp/SMS/web/share-sheet content as user-provided input, not background surveillance.",
    examples: ["Android share intent", "iOS share extension", "PWA share target", "paste message"],
  },
  {
    id: "device-model-hook",
    group: "device",
    title: "Device model hook",
    contract: "Expose only local model capabilities the current device can actually run.",
    examples: ["AICore/Gemini Nano when supported", "LiteRT-LM", "Apple Foundation Models", "Chrome Prompt API"],
  },
  {
    id: "indic-model-hook",
    group: "model",
    title: "Indic model hook",
    contract: "Normalize, translate, transliterate, speak, and reason in Indian languages before generic model routing.",
    examples: ["Sarvam Edge", "Sarvam Translate", "Sarvam-M", "IndicTrans2"],
  },
  {
    id: "source-pack-hook",
    group: "source",
    title: "Source pack hook",
    contract: "Provide grounded local or live sources with freshness, language, and source receipts.",
    examples: ["scheme packs", "fraud packs", "SME/GST packs", "local PDFs"],
  },
  {
    id: "safety-hook",
    group: "safety",
    title: "Chetana/Kavach hook",
    contract: "Classify risk, slow the user down, and route suspected fraud to warning/reporting flows.",
    examples: ["UPI check", "OTP warning", "Chakshu report path", "RBI Sachet path"],
  },
  {
    id: "action-hook",
    group: "action",
    title: "Action hook",
    contract: "Draft and preview actions, but require approval before sending, uploading, paying, changing accounts, or changing device settings.",
    examples: ["message draft", "form fill", "DigiLocker request", "ONDC seller task"],
  },
  {
    id: "receipt-hook",
    group: "output",
    title: "Receipt hook",
    contract: "Write a local, human-readable receipt for important decisions and optional hash/notary anchors.",
    examples: ["local receipt", "exportable PDF", "hash anchor", "smart-contract adapter"],
  },
];

export const aindiaWrappers: AIndiaWrapper[] = [
  {
    id: "pwa-wrapper",
    title: "PWA wrapper",
    target: "pwa",
    exposes: ["install shell", "offline first screen", "local files", "source packs", "browser helper packs"],
    cannotDo: "Cannot directly call Android AICore or Apple Foundation Models.",
  },
  {
    id: "android-wrapper",
    title: "Android wrapper",
    target: "android",
    exposes: ["ML Kit GenAI", "AICore/Gemini Nano where supported", "LiteRT-LM", "ML Kit OCR", "share intents"],
    cannotDo: "Cannot assume every Android phone has the same model or NPU.",
  },
  {
    id: "ios-wrapper",
    title: "iOS wrapper",
    target: "ios",
    exposes: ["Foundation Models", "Speech", "Vision", "Translation", "App Intents"],
    cannotDo: "Cannot run Foundation Models on devices without Apple Intelligence support.",
  },
  {
    id: "provider-wrapper",
    title: "Provider wrapper",
    target: "provider",
    exposes: ["Sarvam", "Bhashini", "Perplexity/Sonar", "OpenAI", "Gemini", "Anthropic"],
    cannotDo: "Cannot upload user data without purpose, consent, and receipt.",
  },
  {
    id: "enterprise-wrapper",
    title: "Enterprise/OEM wrapper",
    target: "enterprise",
    exposes: ["MDM policy", "private source packs", "fleet model packs", "admin receipts", "data residency controls"],
    cannotDo: "Cannot weaken user-facing approval gates for sensitive actions.",
  },
];
