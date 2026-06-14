export type AIndiaModelLayerId =
  | "local-supervisor"
  | "os-native-llm"
  | "indic-language"
  | "speech"
  | "ocr-vision"
  | "embeddings-rag"
  | "search-citations"
  | "safety-fraud"
  | "action-tools";

export type AIndiaModelLayer = {
  id: AIndiaModelLayerId;
  title: string;
  job: string;
  candidates: string[];
  localFirstPath: string;
  gate: string;
};

export type AIndiaAnswerEngineStep = {
  title: string;
  body: string;
};

export const aindiaModelLayers: AIndiaModelLayer[] = [
  {
    id: "local-supervisor",
    title: "Local supervisor model",
    job: "A small local model or rules engine manages the route before any frontier model is allowed to help.",
    candidates: [
      "Tiny local classifier for language, intent, risk, and source need",
      "Sarvam/Indic helper model when the device can support it",
      "Rules plus embeddings when an LLM is too heavy",
      "Frontier model only as a gated proposal engine",
    ],
    localFirstPath:
      "Run the supervisor locally first. If it can answer from source packs or local files, no frontier route is needed. If it cannot, it prepares a consent envelope and sends only the minimum needed context.",
    gate: "safety_checked",
  },
  {
    id: "os-native-llm",
    title: "OS-native small LLMs",
    job: "Use the model already distributed through the phone OS when available.",
    candidates: [
      "Android ML Kit GenAI / AICore / Gemini Nano where supported",
      "Google AI Edge LiteRT-LM with Gemma-class models",
      "Apple Foundation Models on Apple Intelligence devices",
      "Chrome built-in AI on supported desktop Chrome",
    ],
    localFirstPath: "Native Android and native iOS wrappers call these APIs only after capability checks; the PWA exposes the same contract but cannot assume access.",
    gate: "device_model_checked",
  },
  {
    id: "indic-language",
    title: "Indic language rail",
    job: "Detect script, translate, transliterate, normalize, and preserve the user's language.",
    candidates: [
      "Sarvam Translate / Sarvam-M family",
      "AI4Bharat IndicTrans2",
      "AI4Bharat IndicBERT / Indic Sentence embeddings",
      "Deterministic Unicode script detection",
    ],
    localFirstPath: "Ship script detection in the shell; download language helper packs only after storage and network gates pass.",
    gate: "language_detected",
  },
  {
    id: "speech",
    title: "Speech in and speech out",
    job: "Make the interface usable for people who do not want to type or read long answers.",
    candidates: [
      "Android speech recognition and ML Kit speech rails",
      "Apple Speech framework and AVSpeechSynthesizer",
      "Sarvam speech APIs where cloud is approved",
      "AI4Bharat IndicConformer-style ASR where local runtime allows",
    ],
    localFirstPath: "Use OS speech first, then Indic ASR/TTS helpers, then cloud speech only after approval.",
    gate: "human_approved",
  },
  {
    id: "ocr-vision",
    title: "OCR and document vision",
    job: "Read screenshots, bills, notices, QR/payment proof, forms, and local-language documents.",
    candidates: [
      "Google ML Kit Text Recognition",
      "Apple Vision text recognition",
      "Gemini Nano image description on supported Android devices",
      "Cloud vision only when local OCR cannot solve it",
    ],
    localFirstPath: "Run OCR before LLM reasoning so the model receives extracted text plus the image risk class.",
    gate: "safety_checked",
  },
  {
    id: "embeddings-rag",
    title: "Embeddings and local RAG",
    job: "Answer from saved files, scheme documents, shop records, PDFs, receipts, and local help packs.",
    candidates: [
      "Multilingual sentence embeddings",
      "Indic Sentence-BERT style embeddings",
      "Small vector indexes in IndexedDB or native SQLite",
      "Domain packs for schemes, fraud, SME, health, and field work",
    ],
    localFirstPath: "Keep the user's files and vector index local by default; cloud search is a separate approval.",
    gate: "local_storage_ready",
  },
  {
    id: "search-citations",
    title: "Search with citations",
    job: "Make a Perplexity-style answer engine for India: short answer, sources, spoken summary, local-language output, and one useful next step.",
    candidates: [
      "Web retrieval with source citation",
      "Government/scheme source packs",
      "Local document retrieval",
      "Perplexity/OpenAI/Gemini search only when the route is approved",
    ],
    localFirstPath: "Prefer installed source packs and user files; live web search becomes a consented route.",
    gate: "cloud_route_allowed",
  },
  {
    id: "safety-fraud",
    title: "Safety and fraud classifiers",
    job: "Catch payment scams, OTP traps, fake jobs, account takeovers, risky forms, and coercive messages.",
    candidates: [
      "Deterministic risk rules",
      "Chetana/Kavach safety rail",
      "Small local classifiers",
      "Frontier model review for ambiguous high-risk cases",
    ],
    localFirstPath: "Risk rules run before any answer or action; suspicious flows slow down and explain one next step.",
    gate: "safety_checked",
  },
  {
    id: "action-tools",
    title: "Action tools and contracts",
    job: "Help users do work without letting the model act silently.",
    candidates: [
      "Message drafting",
      "Form filling assistance",
      "Receipt/notary hashes",
      "UPI/payment/account/device actions behind explicit approval",
    ],
    localFirstPath: "Draft locally, preview clearly, require approval, then write a receipt.",
    gate: "human_approved",
  },
];

export const aindiaAnswerEngineSteps: AIndiaAnswerEngineStep[] = [
  {
    title: "Ask like a person",
    body: "Voice, photo, message, or one-line question in the user's script.",
  },
  {
    title: "Let local judge first",
    body: "A local supervisor detects language, intent, risk, and whether source packs can answer before any frontier route.",
  },
  {
    title: "Ground the answer",
    body: "Use local files, trusted source packs, government pages, or live search with visible citations.",
  },
  {
    title: "Answer small",
    body: "One answer, two citations, one next step, spoken back in the user's language.",
  },
  {
    title: "Gate the action",
    body: "If it touches money, identity, files, accounts, device settings, or upload, ask first and write a receipt.",
  },
];

export const aindiaMetaThesis = [
  "Reflection over prediction: the model may draft, but the harness checks what matters before the user acts.",
  "Help, not extraction: solve the turn without forcing photos, messages, documents, or identity into the cloud.",
  "AIndia is not a model lab. It is a sovereign harness over many models.",
  "A small local supervisor can be useful even when it is not smarter than a frontier model, because it decides what should stay local and what needs consent.",
  "The app should feel like one blue microphone, but internally it is a router, policy engine, receipt writer, and language bridge.",
  "India does not need to beat frontier labs at frontier pretraining to win this layer; it needs ownership of the wrapper, local language rails, safety gates, distribution, data contracts, and trusted source packs.",
];
