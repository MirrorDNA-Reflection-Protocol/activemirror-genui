import { type AIndiaContractId, type AIndiaDeviceRailId, type AIndiaGateId } from "./contracts";
import { getAIndiaGlyphMirrorGraph, type AIndiaGlyphId } from "./glyphs";
import { type AIndiaModelLayerId } from "./modelMatrix";

export type AIndiaReflectiveTurnStageId =
  | "capture"
  | "language"
  | "route"
  | "ground"
  | "gate"
  | "answer"
  | "receipt";

export type AIndiaReflectiveTurnStage = {
  id: AIndiaReflectiveTurnStageId;
  title: string;
  body: string;
  glyphIds: AIndiaGlyphId[];
  gateIds: AIndiaGateId[];
  modelLayerIds: AIndiaModelLayerId[];
};

export type AIndiaCombinedRail = {
  id: string;
  title: string;
  role: string;
  contractIds: AIndiaContractId[];
  modelLayerIds: AIndiaModelLayerId[];
  deviceRailIds: AIndiaDeviceRailId[];
  glyphIds: AIndiaGlyphId[];
};

export const aindiaReflectiveTurnVersion = "aindia-reflective-turn-2026-06-14";

export const aindiaOneAssistantThesis = [
  "One user surface: voice, photo, or message.",
  "One runtime object: the reflective turn.",
  "Many rails behind it: Sarvam/local language, OS-native models, source packs, safety, search, frontier fallback, and receipts.",
  "The rails are replaceable. The harness, gates, glyph grammar, and receipts are the owned layer.",
  "Prediction is allowed only inside reflection: language, source, risk, consent, action, and receipt are checked before the answer becomes advice.",
];

export const aindiaReflectionEngineFormula = {
  founderFormula: "polymath + ADHD + AI = reflection engine",
  humanAuthority: "Paul is the human authority; the Reflection Engine operationalizes the founder philosophy without impersonating him.",
  publicLine: "Nonlinear thinking in. Disciplined next step out.",
  productMeaning:
    "AIndia should accept scattered, emotional, multilingual, visual, or half-formed input and converge it into a sourced answer, a risk state, and one usable next step.",
  boundary:
    "ADHD is not a gimmick, diagnosis gate, or claim of medical treatment. The interface supports divergent attention and structured convergence for anyone who thinks nonlinearly.",
  cognitionLoop: [
    "capture many signals without punishing the user for messy input",
    "name the task, language, source need, risk, and missing context",
    "split prediction from proof",
    "return a short answer plus one next action",
    "save only consented receipts, not a silent profile",
  ],
};

export const aindiaCombinedRails: AIndiaCombinedRail[] = [
  {
    id: "language-rail",
    title: "Language rail",
    role: "Detect script, translate, transliterate, and keep the user in their language.",
    contractIds: ["sarvam-language-rail"],
    modelLayerIds: ["indic-language", "speech"],
    deviceRailIds: ["browser-sarvam-helper", "android-local-speech"],
    glyphIds: ["reflect", "language"],
  },
  {
    id: "local-device-rail",
    title: "Local device rail",
    role: "Use the strongest available local or OS-native model before cloud.",
    contractIds: ["device-model-router", "local-files"],
    modelLayerIds: ["local-supervisor", "os-native-llm", "embeddings-rag"],
    deviceRailIds: ["android-aicore-gemini-nano", "google-ai-edge-litert", "apple-foundation-models", "chrome-built-in-ai"],
    glyphIds: ["local", "memory"],
  },
  {
    id: "source-rail",
    title: "Source rail",
    role: "Ground answers in local files, source packs, government pages, or cited search.",
    contractIds: ["local-files", "receipts"],
    modelLayerIds: ["embeddings-rag", "search-citations", "ocr-vision"],
    deviceRailIds: ["browser-sarvam-helper", "consented-frontier-cloud"],
    glyphIds: ["source", "unknown"],
  },
  {
    id: "safety-rail",
    title: "Chetana/Kavach rail",
    role: "Slow down UPI, OTP, KYC, job, identity, document, and coercion risk before action.",
    contractIds: ["safety-rail", "approval-gates"],
    modelLayerIds: ["safety-fraud", "action-tools"],
    deviceRailIds: ["consented-frontier-cloud"],
    glyphIds: ["risk", "consent"],
  },
  {
    id: "answer-rail",
    title: "Answer rail",
    role: "Return one small answer, source, next step, and spoken/local-language output.",
    contractIds: ["wrapper", "approval-gates"],
    modelLayerIds: ["action-tools", "speech"],
    deviceRailIds: ["android-local-speech", "browser-sarvam-helper", "consented-frontier-cloud"],
    glyphIds: ["next", "reflect"],
  },
  {
    id: "receipt-rail",
    title: "Receipt rail",
    role: "Write consented local receipts and optional MirrorGraph/GlyphTrail proof edges.",
    contractIds: ["receipts", "smart-contract-adapter"],
    modelLayerIds: ["embeddings-rag", "action-tools"],
    deviceRailIds: ["browser-sarvam-helper"],
    glyphIds: ["memory", "source", "consent"],
  },
];

export const aindiaReflectiveTurnStages: AIndiaReflectiveTurnStage[] = [
  {
    id: "capture",
    title: "Capture the thing",
    body: "Voice, photo, screenshot, or message enters the same turn contract.",
    glyphIds: ["reflect"],
    gateIds: ["language_detected"],
    modelLayerIds: ["speech", "ocr-vision"],
  },
  {
    id: "language",
    title: "Find the language",
    body: "Script, browser language, and Sarvam/local language helpers establish the user's language before the answer.",
    glyphIds: ["language", "local"],
    gateIds: ["language_detected", "device_model_checked"],
    modelLayerIds: ["indic-language", "local-supervisor"],
  },
  {
    id: "route",
    title: "Choose the route",
    body: "Local files, local model, source pack, live search, or frontier fallback are selected by capability and consent.",
    glyphIds: ["local", "source"],
    gateIds: ["local_storage_ready", "device_model_checked", "cloud_route_allowed"],
    modelLayerIds: ["local-supervisor", "embeddings-rag", "search-citations"],
  },
  {
    id: "ground",
    title: "Ground the answer",
    body: "If the answer needs evidence, source packs or citations are attached; missing evidence becomes unknown, not guessed.",
    glyphIds: ["source", "unknown"],
    gateIds: ["safety_checked", "receipt_written"],
    modelLayerIds: ["search-citations", "embeddings-rag"],
  },
  {
    id: "gate",
    title: "Gate risky action",
    body: "Money, identity, account, upload, send, device, and coercion turns pause for Chetana/Kavach and approval.",
    glyphIds: ["risk", "consent"],
    gateIds: ["safety_checked", "human_approved"],
    modelLayerIds: ["safety-fraud", "action-tools"],
  },
  {
    id: "answer",
    title: "Answer small",
    body: "The output is one clear answer, visible source state, and one next step in the user's language.",
    glyphIds: ["next", "source"],
    gateIds: ["language_detected", "safety_checked"],
    modelLayerIds: ["action-tools", "speech"],
  },
  {
    id: "receipt",
    title: "Leave a receipt",
    body: "Important checks can write a local, human-readable receipt and optional MirrorGraph/GlyphTrail edge when consented.",
    glyphIds: ["memory", "consent", "source"],
    gateIds: ["receipt_written", "human_approved"],
    modelLayerIds: ["embeddings-rag", "action-tools"],
  },
];

export function getAIndiaReflectiveTurnContract() {
  return {
    id: "aindia-reflective-turn",
    version: aindiaReflectiveTurnVersion,
    stance: "reflection_over_prediction",
    productRule:
      "AIndia should look like one simple assistant. Internally, every turn passes through the same rails: language, local device, source, safety, answer, and receipt.",
    ownedLayer:
      "The owned layer is not a single model. It is the wrapper, harness, gates, glyph grammar, source contract, consent envelope, and receipt/MirrorGraph proof fabric.",
    userPromise: "Ask once. AIndia combines the rails and gives one useful next step in your language.",
    reflectionEngine: aindiaReflectionEngineFormula,
    thesis: aindiaOneAssistantThesis,
    rails: aindiaCombinedRails,
    stages: aindiaReflectiveTurnStages,
    mirrorGraph: getAIndiaGlyphMirrorGraph(),
  };
}
