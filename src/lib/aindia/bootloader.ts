import {
  BriefcaseBusiness,
  Camera,
  GraduationCap,
  HeartHandshake,
  Languages,
  Mic,
  ShieldCheck,
  Store,
  type LucideIcon,
} from "lucide-react";

export type AIndiaModeId = "home" | "shop" | "field" | "learn";

export type AIndiaInputId = "voice" | "photo" | "message";
export type AIndiaDetectedLanguage = {
  code: string;
  label: string;
  native: string;
  confidence: "high" | "medium" | "low";
  source: "script" | "browser" | "default";
};

export type AIndiaMode = {
  id: AIndiaModeId;
  title: string;
  short: string;
  icon: LucideIcon;
  example: string;
  nextStep: string;
};

export type AIndiaInput = {
  id: AIndiaInputId;
  title: string;
  body: string;
  icon: LucideIcon;
};

export const aindiaLanguages = [
  { code: "hi", label: "Hindi", native: "हिंदी", glyph: "अ" },
  { code: "ta", label: "Tamil", native: "தமிழ்", glyph: "அ" },
  { code: "te", label: "Telugu", native: "తెలుగు", glyph: "తె" },
  { code: "mr", label: "Marathi", native: "मराठी", glyph: "म" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", glyph: "ಕ" },
  { code: "bn", label: "Bengali", native: "বাংলা", glyph: "আ" },
  { code: "en", label: "English", native: "English", glyph: "A" },
];

export const aindiaInputs: AIndiaInput[] = [
  {
    id: "voice",
    title: "Ask by voice",
    body: "Press one button and speak in your language.",
    icon: Mic,
  },
  {
    id: "photo",
    title: "Send a photo",
    body: "Share a screenshot, paper, sign, bill, or payment link.",
    icon: Camera,
  },
  {
    id: "message",
    title: "Scan a message",
    body: "Paste or forward a message before acting on it.",
    icon: ShieldCheck,
  },
];

export const aindiaModes: AIndiaMode[] = [
  {
    id: "home",
    title: "Home help",
    short: "Family safety, forms, messages, and daily decisions.",
    icon: HeartHandshake,
    example: "A family gets a payment link on WhatsApp.",
    nextStep: "Wait. Check the sender before paying.",
  },
  {
    id: "shop",
    title: "Shop and SME",
    short: "Small business work: invoices, vendors, customers, payments.",
    icon: Store,
    example: "A shopkeeper receives a QR payment screenshot.",
    nextStep: "Check your bank app before handing over goods.",
  },
  {
    id: "field",
    title: "Field work",
    short: "Public service, NGO, health, finance, and local support work.",
    icon: BriefcaseBusiness,
    example: "A field worker needs to explain a document.",
    nextStep: "Summarise it in the local language and mark what needs human review.",
  },
  {
    id: "learn",
    title: "Learn and do",
    short: "Learning, job help, forms, repair steps, and skill practice.",
    icon: GraduationCap,
    example: "A learner asks how to fill a form.",
    nextStep: "Show the next two steps, then ask before continuing.",
  },
];

export const aindiaBootloader = {
  name: "AIndia",
  promise: "Speak. Show. Get the next step.",
  localLanguageRail: {
    label: "Sarvam OSS/local language rail",
    installedModel: "sarvamai/sarvam-translate plus smaller or quantized helper packs when the device can support them",
    role: "translate and bridge Indian-language input before specialist checks run",
    icon: Languages,
  },
  wrapper: [
    "voice first",
    "photo and screenshot input",
    "WhatsApp-style messages",
    "large tap targets",
    "few words on screen",
  ],
  harness: [
    "translate locally when possible",
    "classify the task",
    "run safety checks before action",
    "return one next step",
    "ask before payment, send, account, file, or device action",
  ],
  bootSequence: [
    "listen or read the photo",
    "detect language",
    "check device model rail",
    "decide mode",
    "check risk",
    "speak the next step",
    "save a simple receipt only when useful",
  ],
  nativeWrappers: [
    "Android wrapper: ML Kit GenAI, AICore/Gemini Nano where supported, LiteRT-LM for custom small models",
    "iOS wrapper: Apple Foundation Models on Apple Intelligence devices, Speech, Vision, Translation, and app sandbox storage",
    "Web/PWA wrapper: install shell, script detection, local receipts, IndexedDB/OPFS helper packs, consented cloud fallback",
  ],
  browserHelper: {
    goal: "download a local Indian-language helper when the device, browser, storage, and network can support it",
    defaultMode: "install the app shell first; then cache local files and a Sarvam helper pack in the background when safe",
    storageTargets: [
      "Cache Storage for the installable PWA shell and static helper files",
      "IndexedDB or Origin Private File System for model shards and language packs",
      "Service worker background refresh for small updates",
    ],
    constraints: [
      "full Sarvam-Translate class models are too large for many low-end phones",
      "browser storage and WebGPU support vary by Android browser",
      "helper download must be opt-in on Wi-Fi with a clear size warning",
      "frontier models stay optional and routed only after the local safety harness",
    ],
  },
};

export const aindiaOfflineHelperPlan = [
  {
    title: "Install shell",
    body: "AIndia opens like an app and keeps the first screen available offline.",
  },
  {
    title: "Cache user files locally",
    body: "Photos, messages, and receipts stay in browser storage unless the user chooses to send them.",
  },
  {
    title: "Download language helper",
    body: "On Wi-Fi and enough storage, download a Sarvam-compatible helper pack in the background.",
  },
  {
    title: "Route when needed",
    body: "If the local helper cannot answer, ask before using cloud or frontier models.",
  },
];

const scriptDetectors: Array<{
  code: string;
  label: string;
  native: string;
  pattern: RegExp;
}> = [
  { code: "hi", label: "Hindi", native: "हिंदी", pattern: /[\u0900-\u097f]/ },
  { code: "bn", label: "Bengali", native: "বাংলা", pattern: /[\u0980-\u09ff]/ },
  { code: "ta", label: "Tamil", native: "தமிழ்", pattern: /[\u0b80-\u0bff]/ },
  { code: "te", label: "Telugu", native: "తెలుగు", pattern: /[\u0c00-\u0c7f]/ },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", pattern: /[\u0c80-\u0cff]/ },
  { code: "ml", label: "Malayalam", native: "മലയാളം", pattern: /[\u0d00-\u0d7f]/ },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", pattern: /[\u0a80-\u0aff]/ },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", pattern: /[\u0a00-\u0a7f]/ },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", pattern: /[\u0b00-\u0b7f]/ },
];

const aliases: Record<string, AIndiaDetectedLanguage> = Object.fromEntries(
  aindiaLanguages.map((language) => [
    language.code,
    {
      code: language.code,
      label: language.label,
      native: language.native,
      confidence: "medium" as const,
      source: "browser" as const,
    },
  ])
);

export function detectAIndiaLanguage(text: string, browserLanguages: readonly string[] = []): AIndiaDetectedLanguage {
  const fromScript = scriptDetectors.find((detector) => detector.pattern.test(text));
  if (fromScript) {
    return {
      code: fromScript.code,
      label: fromScript.label,
      native: fromScript.native,
      confidence: "high",
      source: "script",
    };
  }

  for (const browserLanguage of browserLanguages) {
    const code = browserLanguage.toLowerCase().split("-")[0];
    const match = aliases[code];
    if (match) return match;
  }

  return {
    code: "hi",
    label: "Hindi",
    native: "हिंदी",
    confidence: "low",
    source: "default",
  };
}
