# AIndia Sovereign AI Research Memo

Date: 2026-06-12

## Thesis

AIndia should not position as "India's ChatGPT." That is the wrong fight.

AIndia should position as India's sovereign AI harness: a local-first, language-first, consent-first wrapper that lets many models help, but never lets the model own the route, the action, the memory, or the receipt.

Priority order:

```text
latency -> cheap devices -> language -> trust -> model quality
```

If it only works well on flagship phones, it is not AIndia.

The phrase is:

```text
Reflection over prediction.
```

The model predicts. AIndia reflects: language, source, risk, consent, action, receipt, replay.

## Human Product Boundary

We are here to help, not extract.

The user may never know who built AIndia. The product still succeeds if it helps them avoid a UPI fraud, understand a form, check a message, speak instead of type, or finish a shop task without uploading private data by default.

No cringe India layer. No decorative nationalism. India-specific means UPI, WhatsApp, screenshots, shared devices, mixed scripts, local-language speech, forms, schemes, shops, fraud, and public-service reality.

## Audience Estimate

The exact cross-tab "does not speak English + personally owns a smartphone" needs current raw survey data. The public sources still give a strong range:

- IAMAI-Kantar coverage says India had 958M active internet users in 2025, with rural India at about 548M and AI-enabled feature use at 44%.
- IAMAI-Kantar 2024 says 870M internet users, 98% of active internet users, accessed the internet in Indic languages.
- The older KPMG-Google language report projected Indian-language users at 536M and English internet users at 199M by 2021, with Indian-language users nearly 75% of the internet base.
- Census 2011 reporting, summarized by Mint, says just over 10% of Indians reported speaking some English.

Working estimate:

```text
As a share of active mobile internet users, the non-English-first / Indic-first opportunity is likely 75-90%.
As a share of India's total population, the practical smartphone-plus-non-English-first audience is plausibly 45-55%.
In people, this is conservatively 600M+ and likely larger when shared-device users are included.
```

Do not overclaim "illiterate." Say low-English, low-typing, low-trust, shared-device, voice/photo-first, and source-vulnerable.

## Hallucination Boundary

AIndia should not claim perfect hallucination freedom from any model. The stronger and truthful claim is source-bounded behavior:

- factual claims need a source, source pack, or local receipt
- current-data claims require freshness checks
- future statements are labeled scenario assumptions
- high-risk advice must use deterministic risk rules and receipts
- unsupported claims become "unknown" or "unverified"

See `docs/aindia-hallucination-control.md`.

## Sovereignty Tests

AIndia only earns the sovereignty claim if these pass:

1. Language first: detect script, speech, and preferred language before general reasoning.
2. Local first: app shell, files, source packs, receipts, and helper models stay local when possible.
3. Low-end latency: fast deterministic checks must run before heavy model calls, with a lighter fallback for every expensive route.
4. No silent upload: cloud route requires purpose, data class, approval, retention, and receipt.
5. Reflection gate: observe, retrieve, reflect, propose, gate, commit, receipt, replay.
6. Deterministic policy: same facts must produce the same route, regardless of model wording.
7. India risk rail: UPI, OTP, KYC, fake jobs, support calls, links, and suspicious screenshots slow down.
8. Source grounding: government/scheme/source-pack answers are cited or labeled unverified.
9. Receipts and replay: high-risk decisions can prove what happened later.

This is the category claim. Not "we are the only option" as a slogan. The defensible statement is:

```text
The only credible sovereign AI product is the one that passes the sovereignty tests.
AIndia is built to own that pass/fail harness.
```

## What The Research Says

### IndiaAI and Sarvam

PIB described the IndiaAI/Sarvam direction as local languages, Indian datasets, and sovereign ecosystem work. Sarvam's platform now exposes Indian-language speech, translation, document digitization, and sovereign model infrastructure. Sarvam also announced 30B and 105B open-source reasoning models trained in India under IndiaAI compute.

Implication: Sarvam is a critical rail, not a replacement for AIndia. AIndia should wrap Sarvam behind language, consent, source, and action contracts.

Sources:

- [PIB on Sarvam and IndiaAI](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2231169&lang=1&reg=3)
- [Sarvam platform](https://www.sarvam.ai/)
- [Sarvam 30B and 105B open-source release](https://www.sarvam.ai/blogs/sarvam-30b-105b)
- [sarvamai/sarvam-30b](https://huggingface.co/sarvamai/sarvam-30b)
- [sarvamai/sarvam-105b](https://huggingface.co/sarvamai/sarvam-105b)

### Open Indic Rails

AI4Bharat has open IndicTrans2 translation for all 22 scheduled Indic languages and IndicConformer ASR for all 22 official Indian languages. IndicBERT v2 and IndicTrans2 papers show an Indian-language research base that should feed the language rail and eval harness.

Implication: AIndia should not wait for one perfect model. Use open translation, ASR, embeddings, script detection, and evals as replaceable rails.

Sources:

- [AI4Bharat IndicTrans2 GitHub](https://github.com/AI4Bharat/IndicTrans2)
- [AI4Bharat IndicConformer ASR GitHub](https://github.com/AI4Bharat/IndicConformerASR)
- [IndicTrans2 paper](https://arxiv.org/abs/2305.16307)
- [IndicBERT v2 paper](https://arxiv.org/abs/2212.05409)

### OS-Native Local Models

Google ML Kit GenAI exposes Gemini Nano features through Android AICore on supported devices. Google AI Edge LiteRT-LM is a cross-platform local LLM runtime path. Chrome Prompt API brings Gemini Nano to supported desktop Chrome. Apple WWDC26 guidance exposes Foundation Models, Vision, Speech, and private compute handoffs to native iOS apps.

Implication: PWA is the first shell, but Android and iOS wrappers are the sovereign unlock. The browser can cache contracts and small helpers; native apps can access OS AI, speech, OCR, share sheets, and local receipts.

Sources:

- [Google ML Kit GenAI](https://developers.google.com/ml-kit/genai)
- [Google AI Edge LiteRT-LM](https://developers.google.com/edge/litert-lm/overview)
- [LiteRT-LM GitHub](https://github.com/google-ai-edge/LiteRT-LM)
- [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [Apple WWDC26 Apple Intelligence guide](https://developer.apple.com/wwdc26/guides/apple-intelligence/)
- [Apple Foundation Models provider session](https://developer.apple.com/videos/play/wwdc2026/339/)

### Browser Local AI

WebLLM runs LLM inference in browser with WebGPU and no server. Transformers.js runs transformer models in browser/Node through ONNX Runtime. These are not universal low-end-phone answers, but they support an offline helper path where hardware allows.

Implication: AIndia should ship the PWA shell first, then gate model/helper downloads on storage, network, battery, and user approval.

Sources:

- [WebLLM GitHub](https://github.com/mlc-ai/web-llm)
- [Transformers.js GitHub](https://github.com/huggingface/transformers.js/)

### Determinism and Governance

The LLM itself is not the deterministic moat. The deterministic moat is the wrapper:

- canonical input
- fixed proposal schema
- constrained decoding where possible
- deterministic policy gates
- consent envelope
- receipt hash
- replayable event history

Structured-output research supports schema-constrained generation. Runtime governance research supports deterministic policy over agent execution paths. "Right to History" argues for tamper-evident execution records.

Implication: AIndia can make final behavior deterministic enough for product safety even when model text varies.

Sources:

- [Generating Structured Outputs from Language Models](https://arxiv.org/html/2501.10868v1)
- [Runtime Governance for AI Agents: Policies on Paths](https://arxiv.org/html/2603.16586v1)
- [Right to History](https://arxiv.org/html/2602.20214v1)
- [Outlines GitHub](https://github.com/dottxt-ai/outlines)
- [llama.cpp grammar docs](https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md)

### Law, Trust, and Enterprise Reality

The DPDP Act pushes explicit consent, erasure, child-data care, and stronger obligations for significant data fiduciaries. CERT-In directions require fast incident reporting and log retention in Indian jurisdiction for covered entities.

Implication: Consent envelopes, no silent upload, local receipts, and India-jurisdiction logs are not decorative. They are deployment prerequisites for serious institutional trust.

Sources:

- [DPDP Act PDF](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
- [CERT-In directions PDF](https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf)

### Altman and the Wrong Fight

The Sam Altman quote was from a 2023 Delhi event about whether a small Indian team with around $10M could compete with OpenAI on training foundation models. Reporting also notes his clarification: the real question is what a startup can do that is new.

Implication: AIndia should not be wounded by the frontier-model race. The wedge is not "train a bigger model today." The wedge is "own the wrapper, trust, language, source, and action layer that every model must pass through."

Sources:

- [Rest of World on Altman's India comments](https://restofworld.org/2023/sam-altmans-india/)
- [India Today on the quote and clarification](https://www.indiatoday.in/technology/news/story/open-ai-ceo-sam-altman-tells-indians-you-can-not-build-ai-like-chatgpt-2390798-2023-06-09)

### Krutrim

Recent reporting says Krutrim paused chip and foundation-model work during a late-2025 realignment and shifted resources toward AI cloud services. ETEnterpriseAI separately reported execution and leadership concerns.

Implication: India model/cloud attempts matter, but AIndia should avoid a "full-stack everything" trap. Own the harness and integrate model/cloud rails where they pass policy.

Sources:

- [Medianama on Krutrim pivot](https://www.medianama.com/2026/05/223-krutrim-ai-cloud-chip-ai-model-work/)
- [ETEnterpriseAI on Krutrim execution issues](https://enterpriseai.economictimes.indiatimes.com/news/industry/krutrims-ai-ambitions-derail-delayed-launches-and-leadership-turmoil/126137229)

## Option-Space Simulation

Keep all paths alive, but score them through reach, trust, sovereignty, determinism, and speed:

| Option | Verdict |
|---|---|
| AIndia Check PWA | Best today wedge: installable, voice/photo/message, immediate habit. |
| Sarvam helper pack | Strong rail; must be gated by storage/network/consent. |
| Android native wrapper | Highest mass-market sovereign unlock. |
| iOS native wrapper | High-trust rail for Apple Intelligence devices. |
| Perplexity for India | Strong answer layer if sources and local language output are strict. |
| SME copilot | Strong monetization path after trust habit exists. |
| Public-service helper | Highest sovereignty value; needs source-pack discipline. |
| Smart-contract notarization | Useful later; local receipts come first. |

Collapse today to:

```text
PWA AIndia Check
+ machine-readable contracts
+ deterministic harness
+ offline shell
+ Android/iOS bridge contracts
+ Sarvam/open Indic language rail plan
```

## Five-Year View

By 2031, the model will not be the product. Models will be utilities inside phones, browsers, clouds, and open model packs.

The scarce layer will be:

- who owns continuity
- who owns user consent
- who owns local data
- who owns action authority
- who owns source trust
- who can replay what happened
- who can swap models without losing identity

AIndia can be the sovereign layer if it stays a harness, not a chatbot.

## What Not To Claim Yet

- Do not claim every Indian smartphone can run a useful offline LLM.
- Do not claim Sarvam full models will download into every browser.
- Do not claim LLM internals are deterministic.
- Do not claim government endorsement.
- Do not claim all users are illiterate.
- Do not claim blockchain is required for trust.

## What We Can Claim Now

- AIndia is designed around local-first, language-first help.
- AIndia treats models as proposer engines, not authorities.
- AIndia can own wrapper, harness, gates, receipts, and replay.
- AIndia can integrate Sarvam, AI4Bharat, Google, Apple, WebLLM, search, and frontier APIs as rails.
- AIndia's wedge is trust by design for India-specific everyday AI.
