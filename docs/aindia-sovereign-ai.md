# AIndia Sovereign AI Scope

Date: 2026-06-12

## Position

AIndia is a sovereign AI wrapper for India, not a frontier model lab.

The product should feel like one familiar assistant: speak, show a photo, check a message, get one safe next step in the user's language. Underneath, it is a bootloader, router, contract system, model harness, local receipt writer, and consented fallback layer.

Doctrine update:

- Reflection over prediction.
- Help, not extraction.
- Trust by design.
- No consent, no action.
- No audit, no autonomy.
- No local fallback, not sovereign.
- The model is replaceable; the harness owns the user-facing trust boundary.

Deep research spine:

- `docs/aindia-sovereignty-research.md`
- `docs/aindia-living-automation-lattice.md`
- `docs/aindia-hallucination-control.md`
- `docs/aindia-recursion-harness.md`

## Native Device Reality

Android and Apple now matter because both expose native on-device AI paths:

- Android: ML Kit GenAI APIs run Gemini Nano features through Android-native rails for supported devices and tasks. Google AI Edge LiteRT-LM adds a custom small-model path for Gemma-class local inference.
- Apple: Foundation Models exposes the Apple Intelligence on-device model to native apps through Swift APIs, alongside Speech, Vision, Translation, and sandboxed local storage.
- Chrome web: Chrome built-in AI / Prompt API can use Gemini Nano on supported desktop Chrome, but it is not the mass-market Android/iOS PWA route yet.
- PWA: AIndia can still install, cache the shell, keep files local, detect scripts, run small helpers, and route to native/cloud paths when available.

## Model Layers

1. OS-native LLMs: supported-device Android AICore/Gemini Nano, LiteRT-LM, Apple Foundation Models.
2. Indic language: Sarvam Translate/Sarvam-M, AI4Bharat IndicTrans2, IndicBERT, script detection.
3. Speech: OS speech first, Indic ASR/TTS helpers second, Sarvam/cloud speech only with approval.
4. OCR/vision: Google ML Kit Text Recognition, Apple Vision, local image description where supported.
5. Embeddings/RAG: local vector indexes over files, scheme packs, fraud packs, SME docs, receipts.
6. Search/citations: Perplexity-style answer engine for India with short answer, source, spoken summary, receipt.
7. Safety/fraud: Chetana/Kavach risk rules before answer or action.
8. Action tools: draft, preview, approve, act, receipt.

## Contracts

AIndia should enforce contracts before model calls:

- Wrapper contract: voice, photo, message, large buttons, few words.
- Local file contract: files stay local unless upload is approved.
- Device model contract: use the strongest local rail the device can actually support.
- Sarvam/Indic rail contract: language bridge before general-purpose reasoning.
- Safety contract: fraud, UPI, OTP, links, account, and document risks route through Chetana/Kavach.
- Approval contract: no payment, send, upload, account, device, or identity action without approval.
- Receipt contract: important checks leave a local receipt.
- Smart contract adapter: optional notarization later; the MVP does not depend on a blockchain.

## Runtime Spine

Bootloader -> hooks -> harness -> wrappers.

- Bootloader: detect language, device capability, storage, network, model availability, source packs, consent, and risk.
- Hooks: connect voice, photo, share sheet, local files, capability-checked Android AICore/ML Kit/LiteRT, Apple Foundation Models/Speech/Vision, Sarvam, Bhashini, Chetana, source packs, and receipts.
- Harness: enforce gates, source grounding, model routing, prompts, evals, approvals, DPDP consent, and receipts.
- Wrappers: ship the same governed runtime through PWA, Android Kotlin, iOS Swift, provider adapters, and enterprise/OEM shells.

The live protocol is exposed at:

- `/api/aindia/wrappers`

Starter native bridge files:

- `native/aindia/android/AIndiaRuntimeBridge.kt`
- `native/aindia/ios/AIndiaRuntimeBridge.swift`

Hardening note:

- `docs/aindia-hardening.md`

Deterministic harness note:

- `docs/aindia-deterministic-harness.md`

## Perplexity For India

The answer engine should be:

- Ask like a person: voice, photo, message, local script.
- Ground the answer: local files, trusted packs, government pages, live web only when approved.
- Answer small: one answer, two citations, one next step, spoken back.
- Gate the action: if the answer touches money, identity, files, accounts, device settings, or upload, ask first and write a receipt.

## Founder Relay

AIndia can include a public-safe relay that lets people talk through confusion and optionally package a note for Paul.

Rules:

- It is not a Paul bot and does not impersonate him.
- It answers first from public AIndia doctrine.
- It keeps the response small: one interpretation, one next step.
- It does not send or store private content silently.
- It prepares a ready-to-send email only when the user provides contact and explicit consent.

Implemented:

- `/api/aindia/founder-relay`
- AIndia page Founder Relay section

## Additions From Deep Search

- Sarvam Edge switchboard: local or API speech, translation, TTS, document, and open-weight rails.
- Bhashini connector: governed public-service language bridge.
- Fraud rail: Chetana outcomes for UPI, OTP, fake KYC, suspicious call/SMS/WhatsApp, Chakshu, RBI Sachet, and cyber helpline paths.
- Offline source packs: schemes, fraud, SME/GST, agriculture, health basics, repair steps, and local PDFs.
- Local embedding store: private retrieval over files and source packs using IndexedDB/OPFS or native SQLite.
- DigiLocker document rail: future consented official-document workflow.
- ONDC SME rail: future local-language commerce/copilot workflow for sellers.
- Indic eval harness: benchmark language, context, safety, citations, and action-gate behavior.

## Source Starting Points

- Android ML Kit GenAI: https://developers.google.com/ml-kit/genai
- Android ML Kit Prompt API: https://developers.google.com/ml-kit/genai/prompt/android/get-started
- Android Gemini Nano/AICore: https://developer.android.com/ai/gemini-nano
- Google AI Edge LiteRT-LM: https://developers.google.com/edge/litert-lm
- MediaPipe LLM Inference Android: https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/android
- Chrome Prompt API: https://developer.chrome.com/docs/ai/prompt-api
- Chrome Built-in AI APIs: https://developer.chrome.com/docs/ai/built-in-apis
- Apple Foundation Models: https://developer.apple.com/documentation/FoundationModels
- Apple Foundation Models WWDC session: https://developer.apple.com/videos/play/wwdc2025/286/
- Apple App Intents: https://developer.apple.com/documentation/appintents
- Apple Speech: https://developer.apple.com/documentation/speech
- Apple Intelligence requirements: https://support.apple.com/en-us/121115
- Bhashini: https://bhashini.gov.in/
- Bhashini API docs: https://dibd-bhashini.gitbook.io/bhashini-apis
- Sanchar Saathi Chakshu: https://sancharsaathi.gov.in/sfc
- RBI Sachet: https://sachet.rbi.org.in/
- DigiLocker API Setu: https://apisetu.gov.in/digilocker
- ONDC developer resources: https://resources.ondc.org/tech-resources
- Perplexity API overview: https://docs.perplexity.ai/docs/getting-started/overview
- Sarvam Translate: https://huggingface.co/sarvamai/sarvam-translate
- Sarvam Translate blog: https://www.sarvam.ai/blogs/sarvam-translate
- Sarvam Edge: https://www.sarvam.ai/blogs/sarvam-edge
- AI4Bharat organization: https://huggingface.co/ai4bharat
- AI4Bharat Indic LLM Arena: https://ai4bharat.iitm.ac.in/blog/indic-llm-arena
