export type AIndiaFutureThreat = {
  title: string;
  assumption: string;
  defense: string;
};

export type AIndiaFuturePrimitive = {
  title: string;
  role: string;
  mustExistBefore: string;
};

export type AIndiaFiveYearBet = {
  year: string;
  scenarioAssumption: string;
  aindiaPosition: string;
};

export const aindiaFutureThesis = {
  title: "Future-proof means fail-useful",
  body:
    "AIndia should not depend on one model, one provider, one flagship phone, one network, one language, or one law staying fixed. It should degrade to the safest useful path.",
  evidenceBoundary:
    "The threats are engineering assumptions to test against, not factual claims about the future. Ship only what the current runtime can verify.",
};

export const aindiaFutureThreats: AIndiaFutureThreat[] = [
  {
    title: "Cheap phone reality",
    assumption: "Many users will have low RAM, old Android, shared storage, weak CPUs, or prepaid data.",
    defense: "Run script/risk/source checks first; make heavy helper downloads optional and gated.",
  },
  {
    title: "Network failure",
    assumption: "The user may need help when the connection is slow, metered, captive, or gone.",
    defense: "PWA shell, receipts, source packs, deterministic risk checks, and last-known guidance must work offline.",
  },
  {
    title: "Model churn",
    assumption: "Sarvam, Gemini, Apple, OpenAI, WebLLM, and local models will all change.",
    defense: "Model registry, fixed proposal schema, provider diff tests, and route policy stay above the model.",
  },
  {
    title: "Fraud adaptation",
    assumption: "UPI, OTP, KYC, job, loan, and support scams will keep mutating.",
    defense: "Fraud pattern watcher feeds Chetana/Kavach rules, eval fixtures, and cautious next-step copy.",
  },
  {
    title: "Source drift",
    assumption: "Schemes, reporting links, business rules, and public guidance will go stale.",
    defense: "Source packs carry freshness, citations, stale labels, and block high-stakes answers when unverified.",
  },
  {
    title: "Consent changes",
    assumption: "A user may revoke permission after a check, upload, or saved receipt.",
    defense: "Consent ledger, revocation events, retention classes, and replay-aware state reduction.",
  },
  {
    title: "Prompt injection",
    assumption: "A page, PDF, message, or screenshot may contain instructions aimed at the assistant.",
    defense: "Treat user content as data, not authority; tool/action gates never run from raw model text.",
  },
  {
    title: "Regulatory change",
    assumption: "DPDP, CERT-In, platform, app-store, and sector rules will evolve.",
    defense: "Policy adapters, India-jurisdiction log modes, privacy review gates, and deployment profiles.",
  },
  {
    title: "Trust failure",
    assumption: "One hidden upload or wrong action can destroy the entire premise.",
    defense: "No silent upload, no hidden send, no action without approval, and local receipts by default.",
  },
];

export const aindiaFuturePrimitives: AIndiaFuturePrimitive[] = [
  {
    title: "Capability probe",
    role: "Detect device, network, storage, battery, OS AI, speech, OCR, and helper-pack readiness.",
    mustExistBefore: "Any offline model promise.",
  },
  {
    title: "Tiny route",
    role: "A no-model path for script detection, fraud keywords, source-pack lookup, warnings, and receipts.",
    mustExistBefore: "Any heavyweight LLM route.",
  },
  {
    title: "Model registry",
    role: "Pin models, licenses, size, languages, risk limits, and fallback order.",
    mustExistBefore: "Any provider or Sarvam/local model switch.",
  },
  {
    title: "Consent ledger",
    role: "Record purpose, data classes, local/cloud route, retention, expiry, and revocation.",
    mustExistBefore: "Any upload, storage, or human relay.",
  },
  {
    title: "Receipt writer",
    role: "Hash the route, inputs, policy verdict, action, and what did not happen.",
    mustExistBefore: "Any high-risk advice or external action.",
  },
  {
    title: "Replay verifier",
    role: "Rebuild decisions from canonical events and detect divergence.",
    mustExistBefore: "Any autonomous or semi-autonomous workflow.",
  },
  {
    title: "Quarantine switch",
    role: "Freeze a source, model, tool, device, or trace without deleting evidence.",
    mustExistBefore: "Any production action gate.",
  },
  {
    title: "Human bridge",
    role: "Let users escalate to Paul or a trusted person without impersonation or silent send.",
    mustExistBefore: "Any claim of personal guidance.",
  },
];

export const aindiaFiveYearBets: AIndiaFiveYearBet[] = [
  {
    year: "2026",
    scenarioAssumption: "If local phone AI remains uneven, the PWA and tiny deterministic route must still be useful.",
    aindiaPosition: "Own PWA check habit, contracts, relay, source packs, and Android-first wrapper.",
  },
  {
    year: "2027",
    scenarioAssumption: "If on-device AI becomes common on mid-range phones, language and trust still need one harness.",
    aindiaPosition: "Route OS models, Sarvam/open Indic rails, and source packs through one consented harness.",
  },
  {
    year: "2028",
    scenarioAssumption: "If agents act across apps, payments, forms, and documents, fraud defenses must be agent-aware too.",
    aindiaPosition: "Own action gates, Chetana/Kavach risk rails, receipts, and replay.",
  },
  {
    year: "2029",
    scenarioAssumption: "If regulation and procurement demand stronger provenance, data boundaries and auditability become buying criteria.",
    aindiaPosition: "Sell trust-by-design infrastructure to SMEs, institutions, and public-service workflows.",
  },
  {
    year: "2030+",
    scenarioAssumption: "If models become utility rails, continuity, consent, and proof become the durable layer.",
    aindiaPosition: "AIndia is the India-specific human trust harness over replaceable intelligence.",
  },
];
