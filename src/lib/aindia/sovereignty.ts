export type AIndiaScore = 0 | 1 | 2 | 3 | 4 | 5;

export type AIndiaDoctrinePoint = {
  title: string;
  body: string;
};

export type AIndiaSovereigntyTest = {
  id: string;
  title: string;
  test: string;
  passRule: string;
};

export type AIndiaOperatingPriority = {
  title: string;
  rule: string;
  budget: string;
};

export type AIndiaCompetitorClass = {
  title: string;
  shape: string;
  passes: string[];
  fails: string[];
  verdict: string;
};

export type AIndiaOptionScenario = {
  title: string;
  shape: string;
  reach: AIndiaScore;
  trust: AIndiaScore;
  sovereignty: AIndiaScore;
  determinism: AIndiaScore;
  speed: AIndiaScore;
  cheapDevice: AIndiaScore;
  todayMove: string;
};

export type AIndiaResearchSource = {
  title: string;
  kind: "official" | "github" | "arxiv" | "law" | "market" | "company";
  url: string;
  takeaway: string;
};

export const aindiaSovereigntyDefinition = {
  title: "Reflection over prediction",
  short:
    "A model predicts the next words. AIndia reflects on language, source, risk, consent, action, and receipt before any answer becomes advice.",
  positioning:
    "AIndia is a sovereign AI harness for India: local-first, language-first, consent-first, and deterministic before action.",
};

export const aindiaAudienceMath = {
  activeInternetUsersIndia2025: "1.03B",
  ruralShareOfInternetUsers2025: "57%",
  fiveGUsersIndia2026: "400M+",
  activeInternetUsersWhoAccessedIndicLanguages2024: "870M",
  englishSpeakersCensusShare2011: "over 10%",
  conservativeLowerBound:
    "India crossed 1 billion internet users by end-2025, with 57% rural. 870M+ accessed the internet in Indic languages. Over 400M are on 5G. The language wedge is population-scale.",
};

export const aindiaDoctrine: AIndiaDoctrinePoint[] = [
  {
    title: "Help, not harvest",
    body: "The product should solve the turn in front of the person without building a shadow profile or forcing data into the cloud.",
  },
  {
    title: "Trust by design",
    body: "No silent upload, no hidden send, no payment or account action without an explicit gate and a local receipt.",
  },
  {
    title: "Cheap devices first",
    body: "AIndia should feel useful on low-cost Android phones before it feels impressive on flagship devices.",
  },
  {
    title: "Reflection over prediction",
    body: "The answer is not trusted because a model sounded fluent. It is trusted only after language, source, risk, consent, and action checks pass.",
  },
  {
    title: "Audience before brand",
    body: "The main user may never know who built it. Success is a safer payment, a clearer form, a message not clicked, or a shop task finished.",
  },
  {
    title: "Model is replaceable",
    body: "Sarvam, OS-native models, frontier APIs, search, and local packs are rails. The harness decides which rail is allowed.",
  },
];

export const aindiaOperatingPriorities: AIndiaOperatingPriority[] = [
  {
    title: "Latency first",
    rule: "The first useful response should be a check, warning, or next step, not a long generated answer.",
    budget: "Target sub-300ms for local script/risk routing; sub-2s for common voice/photo check feedback.",
  },
  {
    title: "Cheap devices first",
    rule: "Design for low RAM, weak CPU, limited storage, prepaid data, old Android, and shared phones.",
    budget: "Ship tiny deterministic checks first; download heavy helpers only after Wi-Fi/storage/battery gates pass.",
  },
  {
    title: "Progressive intelligence",
    rule: "Start with rules, source packs, OCR, ASR, and small helpers before full LLM routes.",
    budget: "Every heavy model route must have a lighter fallback that still helps.",
  },
  {
    title: "Data and battery respect",
    rule: "No surprise downloads, background uploads, or battery-heavy inference without a visible reason.",
    budget: "Show size and purpose before helper downloads; pause on metered or low-battery devices.",
  },
  {
    title: "Offline habit",
    rule: "The app must still open and perform basic checks when network quality is poor.",
    budget: "PWA shell, language detection, canned risk checks, receipts, and source-pack answers stay cacheable.",
  },
];

export const aindiaSovereigntyTests: AIndiaSovereigntyTest[] = [
  {
    id: "language-first",
    title: "Language first",
    test: "Can it detect script/language and answer without making English the hidden default?",
    passRule: "Script detection, speech, translation, and local-language output run before the general model route.",
  },
  {
    id: "local-first",
    title: "Local first",
    test: "Can useful work happen with files, checks, and source packs on the device?",
    passRule: "PWA/native storage, IndexedDB/OPFS or native SQLite, and offline helper packs are first-class routes.",
  },
  {
    id: "low-end-latency",
    title: "Low-end latency",
    test: "Does the product still feel useful on cheap Android phones and bad networks?",
    passRule: "Fast deterministic checks run before heavy model calls; every expensive model route has a lightweight fallback.",
  },
  {
    id: "no-silent-upload",
    title: "No silent upload",
    test: "Does the user know when a photo, document, message, or query leaves the device?",
    passRule: "Cloud routes require purpose, data class, approval, and retention in the consent envelope.",
  },
  {
    id: "reflection-gate",
    title: "Reflection gate",
    test: "Does the system check itself before advice becomes action?",
    passRule: "Observe, retrieve, reflect, propose, gate, commit, receipt, replay.",
  },
  {
    id: "deterministic-policy",
    title: "Deterministic policy",
    test: "Can the same facts produce the same route even when the model wording changes?",
    passRule: "Canonical input, fixed proposal schema, gate policy, and receipt hash own final behavior.",
  },
  {
    id: "india-risk-rail",
    title: "India risk rail",
    test: "Does it understand UPI, OTP, KYC, job scams, fake support calls, and local reporting paths?",
    passRule: "Chetana/Kavach-style risk checks run before reply, payment, send, account, or document action.",
  },
  {
    id: "source-grounding",
    title: "Source grounding",
    test: "Can it separate a sourced answer from a guess?",
    passRule: "Government, scheme, fraud, SME, and local document packs are cited or the answer is marked unverified.",
  },
  {
    id: "receipts-replay",
    title: "Receipts and replay",
    test: "Can the system prove what happened later?",
    passRule: "High-risk decisions write local receipts and can be replayed from canonical events.",
  },
];

export const aindiaCompetitorClasses: AIndiaCompetitorClass[] = [
  {
    title: "Raw frontier chatbot",
    shape: "Very capable general reasoning behind a chat box.",
    passes: ["reasoning", "coding", "broad knowledge"],
    fails: ["local-first", "India risk rail", "deterministic policy", "no silent upload by default"],
    verdict: "Useful engine. Not sovereign by itself.",
  },
  {
    title: "India foundation model only",
    shape: "Important national model work with Indian language strength.",
    passes: ["language capacity", "national model ownership"],
    fails: ["distribution", "action gates", "receipts", "device wrappers"],
    verdict: "Necessary rail. Not the whole product.",
  },
  {
    title: "Search answer app",
    shape: "Perplexity-style question answering with sources.",
    passes: ["citations", "fresh web answers"],
    fails: ["offline use", "UPI/OTP risk gate", "local files", "native action approvals"],
    verdict: "Good answer layer. Needs AIndia gates for trust.",
  },
  {
    title: "Offline model app",
    shape: "A local model downloaded to a phone or browser.",
    passes: ["private inference", "low marginal cost"],
    fails: ["source freshness", "India-specific safety", "governance", "consented cloud fallback"],
    verdict: "Good helper. Not sovereign without policy.",
  },
  {
    title: "Enterprise RAG",
    shape: "Documents plus chat for businesses and institutions.",
    passes: ["source grounding", "workflow fit"],
    fails: ["mass-market voice", "shared-device reality", "low-literacy UX", "public risk rails"],
    verdict: "Strong B2B path. Not the public wedge alone.",
  },
  {
    title: "AIndia harness",
    shape: "PWA plus native wrappers plus Indian-language rails plus deterministic gates.",
    passes: ["language-first", "local-first", "no silent upload", "reflection gate", "deterministic policy", "India risk rail", "source grounding", "receipts and replay"],
    fails: ["nothing passes until implemented and verified in the runtime"],
    verdict: "The category to own if the tests stay executable.",
  },
];

export const aindiaOptionScenarios: AIndiaOptionScenario[] = [
  {
    title: "AIndia Check PWA",
    shape: "Voice/photo/message checks for payment, form, link, and screenshot risk.",
    reach: 5,
    trust: 4,
    sovereignty: 3,
    determinism: 4,
    speed: 5,
    cheapDevice: 5,
    todayMove: "Ship installable shell, cache contracts, and make checks feel instant.",
  },
  {
    title: "Sarvam helper pack",
    shape: "Background local-language helper download when storage and network gates pass.",
    reach: 3,
    trust: 4,
    sovereignty: 4,
    determinism: 3,
    speed: 3,
    cheapDevice: 2,
    todayMove: "Expose the helper-pack contract first; download only after consent and device check.",
  },
  {
    title: "Android native wrapper",
    shape: "Kotlin bridge for speech, OCR, capability-checked AICore/LiteRT, share sheet, and receipts.",
    reach: 5,
    trust: 5,
    sovereignty: 5,
    determinism: 5,
    speed: 3,
    cheapDevice: 4,
    todayMove: "Keep the TypeScript envelope identical to the Kotlin bridge contract.",
  },
  {
    title: "iOS native wrapper",
    shape: "Swift bridge for Speech, Vision, Foundation Models, App Intents, and local receipts.",
    reach: 3,
    trust: 5,
    sovereignty: 5,
    determinism: 5,
    speed: 3,
    cheapDevice: 2,
    todayMove: "Mirror the Android envelope so iOS is a rail, not a separate product.",
  },
  {
    title: "Perplexity for India",
    shape: "Short sourced answers in local languages with speech output and scheme/source packs.",
    reach: 4,
    trust: 4,
    sovereignty: 3,
    determinism: 3,
    speed: 4,
    cheapDevice: 3,
    todayMove: "Build answer rules: one answer, two sources, one next step, receipt on risk.",
  },
  {
    title: "SME copilot",
    shape: "Local-language help for catalog, GST, orders, buyer messages, returns, and discovery.",
    reach: 4,
    trust: 4,
    sovereignty: 4,
    determinism: 4,
    speed: 3,
    cheapDevice: 4,
    todayMove: "Start after check habit; reuse the same action gates for messages and money.",
  },
  {
    title: "Public-service helper",
    shape: "Scheme, document, form, health, agriculture, and reporting guidance from source packs.",
    reach: 5,
    trust: 5,
    sovereignty: 5,
    determinism: 4,
    speed: 2,
    cheapDevice: 5,
    todayMove: "Begin with offline source packs and clear unverified labels.",
  },
  {
    title: "Smart contract notarization",
    shape: "Optional external anchoring for receipts and enterprise workflows.",
    reach: 2,
    trust: 3,
    sovereignty: 3,
    determinism: 5,
    speed: 2,
    cheapDevice: 1,
    todayMove: "Do not lead with chain. Lead with local receipts; anchor later.",
  },
];

export const aindiaResearchSources: AIndiaResearchSource[] = [
  {
    title: "DataReportal Digital 2026: India",
    kind: "market",
    url: "https://datareportal.com/reports/digital-2026-india",
    takeaway: "India reached ~1.03B internet users by end-2025 (70% penetration), 57% rural, 400M+ on 5G, 44% using AI features.",
  },
  {
    title: "IAMAI-Kantar Internet in India 2024 report",
    kind: "market",
    url: "https://www.iamai.in/sites/default/files/research/Kantar_%20IAMAI%20report_2024_.pdf",
    takeaway: "The report says 870M internet users, 98% of internet users, accessed the internet in Indic languages in 2024.",
  },
  {
    title: "KPMG-Google Indian Languages report",
    kind: "market",
    url: "https://assets.kpmg.com/content/dam/kpmgsites/in/pdf/2017/04/Indian-languages-Defining-Indias-Internet.pdf",
    takeaway: "Indian-language internet users had already surpassed English users by 2016 and were projected to be nearly 75% of India's internet users by 2021.",
  },
  {
    title: "Sarvam AI platform",
    kind: "company",
    url: "https://www.sarvam.ai/",
    takeaway: "Sarvam provides India-focused speech, translation, document digitization, and sovereign model infrastructure across Indian languages.",
  },
  {
    title: "Sarvam 30B and 105B open-source release",
    kind: "company",
    url: "https://www.sarvam.ai/blogs/sarvam-30b-105b",
    takeaway: "Sarvam released 30B and 105B open-source reasoning models trained in India under the IndiaAI mission compute path.",
  },
  {
    title: "Sam Altman India foundation-model quote context",
    kind: "market",
    url: "https://restofworld.org/2023/sam-altmans-india/",
    takeaway: "The 2023 comment was about the difficulty of competing with OpenAI on foundation-model training with limited capital; the better question is what Indian builders can create that is new.",
  },
  {
    title: "Krutrim business realignment",
    kind: "market",
    url: "https://www.medianama.com/2026/05/223-krutrim-ai-cloud-chip-ai-model-work/",
    takeaway: "Krutrim paused chip and foundation-model work (May 2026), pulled chatbot from app stores, cut headcount from ~550 to ~150. Pivoted to AI cloud.",
  },
  {
    title: "AI4Bharat IndicTrans2",
    kind: "github",
    url: "https://github.com/AI4Bharat/IndicTrans2",
    takeaway: "Open translation models, datasets, benchmarks, and scripts for all 22 scheduled Indic languages.",
  },
  {
    title: "AI4Bharat IndicConformer ASR",
    kind: "github",
    url: "https://github.com/AI4Bharat/IndicConformerASR",
    takeaway: "Open ASR suite for all 22 official Indian languages.",
  },
  {
    title: "Google ML Kit GenAI",
    kind: "official",
    url: "https://developers.google.com/ml-kit/genai",
    takeaway: "Android-native Gemini Nano features run locally through AICore/ML Kit only on supported devices.",
  },
  {
    title: "Google AI Edge LiteRT-LM",
    kind: "official",
    url: "https://developers.google.com/edge/litert-lm/overview",
    takeaway: "Cross-platform edge LLM runtime for production local inference on mobile, web, and native targets.",
  },
  {
    title: "Apple Foundation Models WWDC26 guide",
    kind: "official",
    url: "https://developer.apple.com/wwdc26/guides/apple-intelligence/",
    takeaway: "Apple exposes on-device Foundation Models plus Vision and related AI APIs to native apps.",
  },
  {
    title: "WebLLM",
    kind: "github",
    url: "https://github.com/mlc-ai/web-llm",
    takeaway: "WebGPU LLM inference can run entirely in browser, giving AIndia a browser helper path where hardware supports it.",
  },
  {
    title: "Structured Outputs from Language Models",
    kind: "arxiv",
    url: "https://arxiv.org/html/2501.10868v1",
    takeaway: "Constrained decoding and schema-based output are core tools for making model proposals machine-checkable.",
  },
  {
    title: "Runtime Governance for AI Agents",
    kind: "arxiv",
    url: "https://arxiv.org/html/2603.16586v1",
    takeaway: "Agent control should use deterministic policies over execution paths, not just static pre-deployment rules.",
  },
  {
    title: "Right to History",
    kind: "arxiv",
    url: "https://arxiv.org/html/2602.20214v1",
    takeaway: "Tamper-evident execution records are a sovereignty primitive for proving what agents did.",
  },
  {
    title: "DPDP Act",
    kind: "law",
    url: "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf",
    takeaway: "Consent, erasure, child-data duties, and significant data fiduciary controls make explicit data-governance gates non-optional.",
  },
  {
    title: "CERT-In 2022 directions",
    kind: "law",
    url: "https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf",
    takeaway: "Incident reporting and India-jurisdiction log retention requirements shape enterprise and public-sector deployments.",
  },
];
