export type AIndiaOpportunityId =
  | "native-android-shell"
  | "native-ios-shell"
  | "sarvam-edge-switchboard"
  | "bhashini-public-service-connector"
  | "perplexity-india-answer-engine"
  | "offline-source-packs"
  | "low-literacy-voice-mode"
  | "fraud-reporting-rail"
  | "digilocker-document-rail"
  | "ondc-sme-commerce-rail"
  | "local-embedding-store"
  | "dpdp-consent-ledger"
  | "model-pack-marketplace"
  | "indic-eval-harness";

export type AIndiaOpportunity = {
  id: AIndiaOpportunityId;
  title: string;
  whyItMatters: string;
  addNow: string;
  requires: "pwa" | "android-native" | "ios-native" | "backend" | "partnership";
  priority: "today" | "next" | "later";
  gate: string;
  sourceUrls: string[];
};

export const aindiaOpportunityBacklog: AIndiaOpportunity[] = [
  {
    id: "native-android-shell",
    title: "Android native shell",
    whyItMatters: "This is the real phone path for supported-device Gemini Nano/AICore, ML Kit GenAI, LiteRT-LM, MediaPipe, Android speech, ML Kit OCR, and share intents.",
    addNow: "Create an Android wrapper contract that receives voice/photo/message and returns a signed local rail result to the AIndia web shell.",
    requires: "android-native",
    priority: "next",
    gate: "device_model_checked",
    sourceUrls: [
      "https://developers.google.com/ml-kit/genai",
      "https://developer.android.com/ai/gemini-nano",
      "https://developers.google.com/edge/litert-lm/overview",
      "https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/android",
    ],
  },
  {
    id: "native-ios-shell",
    title: "iOS native shell",
    whyItMatters: "Apple Foundation Models, App Intents, SpeechAnalyzer, Vision, Translation, and Private Cloud Compute are native app tools, not direct PWA APIs.",
    addNow: "Create a Swift wrapper contract that exposes speech, OCR, translation, and Foundation Models results through the same AIndia gate protocol.",
    requires: "ios-native",
    priority: "next",
    gate: "device_model_checked",
    sourceUrls: [
      "https://developer.apple.com/documentation/FoundationModels",
      "https://developer.apple.com/documentation/appintents",
      "https://developer.apple.com/videos/play/wwdc2025/277/",
      "https://developer.apple.com/machine-learning/api/",
    ],
  },
  {
    id: "sarvam-edge-switchboard",
    title: "Sarvam Edge switchboard",
    whyItMatters: "Sarvam now has Indian-language speech, TTS, translation, vision/document, open-weight, and on-device/edge directions that align directly with AIndia.",
    addNow: "Add a provider adapter that can choose Sarvam Edge/local, Sarvam API, or Sarvam open weights per task and consent state.",
    requires: "backend",
    priority: "today",
    gate: "offline_download_allowed",
    sourceUrls: [
      "https://www.sarvam.ai/blogs/sarvam-edge",
      "https://docs.sarvam.ai/api-reference-docs/getting-started/models",
      "https://www.sarvam.ai/models",
      "https://huggingface.co/sarvamai",
    ],
  },
  {
    id: "bhashini-public-service-connector",
    title: "Bhashini public-service connector",
    whyItMatters: "Bhashini is the government-backed language bridge for citizen services, which fits AIndia's public-service and scheme-answering layer.",
    addNow: "Add Bhashini as a governed connector for translation/speech experiments, with source labels and consent boundaries.",
    requires: "partnership",
    priority: "next",
    gate: "cloud_route_allowed",
    sourceUrls: ["https://bhashini.gov.in/", "https://dibd-bhashini.gitbook.io/bhashini-apis"],
  },
  {
    id: "perplexity-india-answer-engine",
    title: "India answer engine",
    whyItMatters: "Perplexity's shape is right: search, citations, short answer, source control. AIndia should localize it for Indian languages, phones, schemes, fraud, and SMEs.",
    addNow: "Add a citation contract: every web answer needs sources, freshness, answer language, and a next-step receipt.",
    requires: "backend",
    priority: "today",
    gate: "cloud_route_allowed",
    sourceUrls: [
      "https://docs.perplexity.ai/docs/getting-started/overview",
      "https://docs.perplexity.ai/docs/search/quickstart",
      "https://docs.perplexity.ai/docs/sonar/quickstart",
    ],
  },
  {
    id: "offline-source-packs",
    title: "Offline source packs",
    whyItMatters: "AIndia can answer common questions offline if it ships small, trusted packs for schemes, fraud, health basics, agriculture, SME forms, and repair steps.",
    addNow: "Define pack manifests with source URL, version, language, size, embedding model, hash, and expiration date.",
    requires: "pwa",
    priority: "today",
    gate: "local_storage_ready",
    sourceUrls: ["https://web.dev/learn/pwa/service-workers", "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API"],
  },
  {
    id: "low-literacy-voice-mode",
    title: "Low-literacy voice mode",
    whyItMatters: "The target user may not read comfortably. The default should be listen, speak, photo, red/yellow/green, and one-button repeat.",
    addNow: "Add audio-first answer cards: repeat, slower, explain in another language, call helper, save receipt.",
    requires: "pwa",
    priority: "today",
    gate: "language_detected",
    sourceUrls: [
      "https://developer.apple.com/documentation/speech",
      "https://developers.google.com/ml-kit/genai",
      "https://www.sarvam.ai/models",
    ],
  },
  {
    id: "fraud-reporting-rail",
    title: "Fraud reporting rail",
    whyItMatters: "AIndia should not just warn users; it should route suspected fraud to the right official reporting path when the user asks.",
    addNow: "Add Chetana outcomes: warn, verify, report to Chakshu, report financial fraud, or ask a trusted person.",
    requires: "pwa",
    priority: "today",
    gate: "safety_checked",
    sourceUrls: [
      "https://sancharsaathi.gov.in/sfc",
      "https://sachet.rbi.org.in/",
      "https://sachet.rbi.org.in/complaints/add",
    ],
  },
  {
    id: "digilocker-document-rail",
    title: "DigiLocker document rail",
    whyItMatters: "Many India workflows require consented access to official documents, verification, forms, and KYC artifacts.",
    addNow: "Add a future connector contract: no document access without explicit DigiLocker/OAuth consent and receipt.",
    requires: "partnership",
    priority: "later",
    gate: "human_approved",
    sourceUrls: ["https://apisetu.gov.in/digilocker", "https://www.digilocker.gov.in/web/partners/requesters"],
  },
  {
    id: "ondc-sme-commerce-rail",
    title: "ONDC SME commerce rail",
    whyItMatters: "For SMEs, AIndia can become a local-language copilot for catalog, orders, returns, discovery, and buyer/seller workflows.",
    addNow: "Add a commerce-mode contract that starts with explanation/drafting, then later routes to ONDC only through approved partners.",
    requires: "partnership",
    priority: "later",
    gate: "human_approved",
    sourceUrls: ["https://resources.ondc.org/tech-resources", "https://ondc-official.github.io/ONDC-SRV-Specifications/"],
  },
  {
    id: "local-embedding-store",
    title: "Local embedding store",
    whyItMatters: "The sovereign layer needs private retrieval over user files, receipts, and local source packs without uploading everything.",
    addNow: "Add an IndexedDB/OPFS vector manifest with pluggable multilingual or Indic embeddings and a no-upload default.",
    requires: "pwa",
    priority: "next",
    gate: "local_storage_ready",
    sourceUrls: [
      "https://huggingface.co/ai4bharat/indic-bert",
      "https://ai4bharat.iitm.ac.in/areas/model/LLM/IndicBERTv2",
      "https://docs.perplexity.ai/docs/getting-started/quickstart",
    ],
  },
  {
    id: "dpdp-consent-ledger",
    title: "DPDP consent ledger",
    whyItMatters: "India's privacy regime makes consent, purpose, withdrawal, and child/guardian safeguards product requirements, not paperwork.",
    addNow: "Add a consent object to every cloud route and source connector: purpose, data fields, retention, withdrawal, receipt.",
    requires: "backend",
    priority: "next",
    gate: "cloud_route_allowed",
    sourceUrls: [
      "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf",
      "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014",
    ],
  },
  {
    id: "model-pack-marketplace",
    title: "Model pack marketplace",
    whyItMatters: "One full model will not fit all phones. AIndia needs swappable packs by device, language, task, size, license, and freshness.",
    addNow: "Add model manifest schema: id, provider, task, languages, size, license, checksum, device requirements, fallback route.",
    requires: "backend",
    priority: "next",
    gate: "offline_download_allowed",
    sourceUrls: [
      "https://huggingface.co/sarvamai",
      "https://huggingface.co/collections/ai4bharat/indictrans2",
      "https://huggingface.co/collections/ai4bharat/indicconformer",
      "https://ai.google.dev/gemma/docs/integrations/mobile",
    ],
  },
  {
    id: "indic-eval-harness",
    title: "Indic eval harness",
    whyItMatters: "AIndia needs to know which model is best for Hindi, Tamil, Hinglish, fraud safety, local schemes, and low-literacy instruction following.",
    addNow: "Add evaluation receipts for language, context, safety, citations, and action-gate behavior.",
    requires: "backend",
    priority: "next",
    gate: "receipt_written",
    sourceUrls: [
      "https://ai4bharat.iitm.ac.in/blog/indic-llm-arena",
      "https://arena.ai4bharat.org/",
      "https://github.com/AI4Bharat/MILU",
    ],
  },
];
