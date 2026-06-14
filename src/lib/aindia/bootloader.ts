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
  { code: "en", label: "English", native: "English", glyph: "A" },
  { code: "hi-latn", label: "Hinglish", native: "Hinglish", glyph: "Aa" },
  { code: "as", label: "Assamese", native: "অসমীয়া", glyph: "অ" },
  { code: "bn", label: "Bengali", native: "বাংলা", glyph: "আ" },
  { code: "brx", label: "Bodo", native: "बड़ो", glyph: "ब" },
  { code: "doi", label: "Dogri", native: "डोगरी", glyph: "ड" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", glyph: "ગ" },
  { code: "hi", label: "Hindi", native: "हिंदी", glyph: "अ" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", glyph: "ಕ" },
  { code: "ks", label: "Kashmiri", native: "کٲشُر", glyph: "ک" },
  { code: "kok", label: "Konkani", native: "कोंकणी", glyph: "क" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", glyph: "മ" },
  { code: "mni", label: "Manipuri", native: "মৈতৈলোন্", glyph: "ম" },
  { code: "mr", label: "Marathi", native: "मराठी", glyph: "म" },
  { code: "mai", label: "Maithili", native: "मैथिली", glyph: "मै" },
  { code: "ne", label: "Nepali", native: "नेपाली", glyph: "ने" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", glyph: "ଓ" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", glyph: "ਪ" },
  { code: "sa", label: "Sanskrit", native: "संस्कृत", glyph: "स" },
  { code: "sat", label: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ", glyph: "ᱥ" },
  { code: "sd", label: "Sindhi", native: "سنڌي", glyph: "س" },
  { code: "ta", label: "Tamil", native: "தமிழ்", glyph: "அ" },
  { code: "te", label: "Telugu", native: "తెలుగు", glyph: "తె" },
  { code: "ur", label: "Urdu", native: "اردو", glyph: "ا" },
];

export const aindiaInputs: AIndiaInput[] = [
  {
    id: "voice",
    title: "Poocho by voice",
    body: "Press one button and ask in your language.",
    icon: Mic,
  },
  {
    id: "photo",
    title: "Send a photo",
    body: "Share a form, bill, notice, sign, prescription, or screenshot.",
    icon: Camera,
  },
  {
    id: "message",
    title: "Ask about a message",
    body: "Paste or forward a message when you need meaning, source, or risk.",
    icon: ShieldCheck,
  },
];

export const aindiaModes: AIndiaMode[] = [
  {
    id: "home",
    title: "Home help",
    short: "Health, school, forms, messages, family decisions.",
    icon: HeartHandshake,
    example: "A parent asks what a school circular means.",
    nextStep: "Explain it in one line, show the source, then say what to do next.",
  },
  {
    id: "shop",
    title: "Shop and SME",
    short: "Customer replies, GST, invoices, catalog, payments.",
    icon: Store,
    example: "A shopkeeper asks how to reply to a customer return message.",
    nextStep: "Draft one reply in the customer's language and flag payment risk if needed.",
  },
  {
    id: "field",
    title: "Field work",
    short: "Schemes, health, finance, agriculture, local support.",
    icon: BriefcaseBusiness,
    example: "A field worker asks which government scheme a family may qualify for.",
    nextStep: "Answer from the source pack and mark unknowns clearly.",
  },
  {
    id: "learn",
    title: "Learn and do",
    short: "Job help, learning, repair steps, skill practice.",
    icon: GraduationCap,
    example: "A learner asks how to fill a form or prepare for an interview.",
    nextStep: "Give the next two steps in simple language, then ask before continuing.",
  },
];

export const aindiaBootloader = {
  name: "AIndia",
  promise: "Poocho. Samjho. Agla kadam lo.",
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
    "let a small local supervisor choose the route",
    "translate locally when possible",
    "classify the task and source need",
    "run safety checks before action",
    "return one short answer, source, and next step",
    "ask before payment, send, account, file, or device action",
  ],
  bootSequence: [
    "listen or read the photo",
    "detect language",
    "let local supervisor classify intent, risk, and source need",
    "answer from local files or source packs when possible",
    "route to web or frontier only with consent",
    "speak the answer and next step",
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
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", pattern: /[\u0a80-\u0aff]/ },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", pattern: /[\u0a00-\u0a7f]/ },
  { code: "ta", label: "Tamil", native: "தமிழ்", pattern: /[\u0b80-\u0bff]/ },
  { code: "te", label: "Telugu", native: "తెలుగు", pattern: /[\u0c00-\u0c7f]/ },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", pattern: /[\u0c80-\u0cff]/ },
  { code: "ml", label: "Malayalam", native: "മലയാളം", pattern: /[\u0d00-\u0d7f]/ },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", pattern: /[\u0b00-\u0b7f]/ },
  { code: "sat", label: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ", pattern: /[\u1c50-\u1c7f]/ },
  { code: "ur", label: "Urdu", native: "اردو", pattern: /[\u0600-\u06ff]/ },
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
