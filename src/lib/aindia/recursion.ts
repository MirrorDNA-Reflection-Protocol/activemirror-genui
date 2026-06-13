export type AIndiaRecursionScore = 0 | 1 | 2 | 3 | 4 | 5;

export type AIndiaRecursionMetric =
  | "trust"
  | "latency"
  | "sovereignty"
  | "determinism"
  | "cheapDevice"
  | "proof";

export type AIndiaRecursionScenario = {
  id: string;
  title: string;
  shape: string;
  scores: Record<AIndiaRecursionMetric, AIndiaRecursionScore>;
  failureMode: string;
  absorb: string;
};

export type AIndiaMacRail = {
  title: string;
  status: "ready" | "partial" | "blocked";
  observed: string;
  useInAIndia: string;
};

export type AIndiaHundredRecursionStatus = "absorbed" | "blocked" | "backlog";

export type AIndiaHundredRecursion = {
  cycle: number;
  pressure: string;
  scenarioId: string;
  scenarioTitle: string;
  gate: string;
  status: AIndiaHundredRecursionStatus;
  improvement: string;
  receiptId: string;
  score: number;
};

export const aindiaRecursionScoreLabels: AIndiaRecursionMetric[] = [
  "trust",
  "latency",
  "sovereignty",
  "determinism",
  "cheapDevice",
  "proof",
];

export const aindiaPerfectionDoctrine = {
  title: "Perfection is a loop, not a claim",
  body:
    "AIndia should never claim perfect AI. It should keep observing reality, simulate routes, gate the model, absorb only verified wins, apply one bounded change, and leave receipts.",
  invariant:
    "If a route cannot be verified, it can stay as a hypothesis, but it cannot become user-facing truth.",
};

export const aindiaMacAbsorption = {
  verifiedAt: "2026-06-13T14:10:02+05:30",
  body:
    "MacBook Pro is the canonical builder/runtime body. The M4 mini is the control plane. Phones are limbs, not sovereign runtimes.",
  evidence: [
    "Ollama direct check at 127.0.0.1:11434 returned Sarvam, embeddinggemma, ministral, qwen3-coder, mirrorstudent, and phi4-mini models.",
    "phone-mesh /health returned router ok with grapheneos_mode=true and aicore_supported=false.",
    "phone-mesh /health reported Pixel and OnePlus inference backends are false; mac route through mesh also reported false, so phone-mesh is not a proof rail.",
    "Codex and Claude cognitive adapters returned ok=true and ready=true on ports 8926 and 8927.",
  ],
  localModels: [
    "hf.co/mradermacher/sarvam-translate-i1-GGUF:Q4_K_M",
    "embeddinggemma:latest",
    "ministral-3:14b",
    "qwen3-coder:30b",
    "mirrorstudent:latest",
    "phi4-mini:latest",
  ],
  rails: [
    {
      title: "Mac Ollama",
      status: "ready",
      observed: "Ollama is reachable directly at 127.0.0.1:11434 with six local models; the phone-mesh mac-ollama backend is currently false through ::1.",
      useInAIndia: "Use direct Mac Ollama as the developer proof rail for Sarvam language, embeddings, and local fallback tests.",
    },
    {
      title: "Sarvam local language rail",
      status: "ready",
      observed: "Sarvam translate GGUF is installed locally through Ollama.",
      useInAIndia: "Treat Indian-language translation as a real local rail on this Mac, then gate browser/device downloads separately.",
    },
    {
      title: "Cognitive adapters",
      status: "ready",
      observed: "Codex and Claude cognitive adapters are healthy on ports 8926 and 8927.",
      useInAIndia: "Use the governed agent lane for build, review, and receipt-backed improvement loops.",
    },
    {
      title: "Phone mesh",
      status: "partial",
      observed: "The router answers on 8875, but mac-ollama, Pixel, and OnePlus inference backends are false and ADB has no attached devices in this pass.",
      useInAIndia: "Keep phone mesh as a declared optional rail; do not make it a proof dependency until live backend health passes.",
    },
    {
      title: "Google AICore on this body",
      status: "blocked",
      observed: "The phone contract says GrapheneOS is the canonical Pixel reality; AICore is not the body inference path.",
      useInAIndia: "Mention AICore only as a supported-device Android wrapper candidate, not as this Mac's phone-limb route.",
    },
  ] satisfies AIndiaMacRail[],
  activeConstraint:
    "Each recursion pass must refresh model, phone-mesh, API, and browser checks before converting current runtime claims into product truth.",
};

export const aindiaRecursionScenarios: AIndiaRecursionScenario[] = [
  {
    id: "frontier-chatbot",
    title: "Raw frontier chatbot",
    shape: "Put a strong model behind a chat box and localize the UI.",
    scores: { trust: 2, latency: 3, sovereignty: 1, determinism: 1, cheapDevice: 2, proof: 2 },
    failureMode: "Fluent answers become perceived authority without local consent, receipts, or action gates.",
    absorb: "Use frontier models only as replaceable proposal engines behind the harness.",
  },
  {
    id: "sanatana-brand-first",
    title: "Sanatana brand first",
    shape: "Lead with the civilizational frame and make the brand the product.",
    scores: { trust: 3, latency: 4, sovereignty: 3, determinism: 2, cheapDevice: 4, proof: 2 },
    failureMode: "The frame becomes culturally loaded before the runtime earns trust.",
    absorb: "Keep Sanatana Tech as doctrine and R&D lab; let AIndia prove trust through behavior.",
  },
  {
    id: "pwa-check",
    title: "AIndia Check PWA",
    shape: "Voice, photo, and message check with offline shell, local rules, and consented fallbacks.",
    scores: { trust: 4, latency: 5, sovereignty: 4, determinism: 4, cheapDevice: 5, proof: 4 },
    failureMode: "If it overpromises local models in the browser, cheap devices will fail.",
    absorb: "Ship tiny deterministic checks first; helper packs download only after device, network, and consent gates.",
  },
  {
    id: "mac-local-harness",
    title: "Mac local harness",
    shape: "Use this Mac's Ollama, Sarvam, embedding, and governed adapter rails to prototype deterministic receipts.",
    scores: { trust: 5, latency: 4, sovereignty: 5, determinism: 5, cheapDevice: 2, proof: 5 },
    failureMode: "Strong local Mac proof does not automatically transfer to low-cost phones.",
    absorb: "Use the Mac as the lab and receipt factory; productize only the routes that survive cheap-device gates.",
  },
  {
    id: "phone-mesh-first",
    title: "Phone mesh first",
    shape: "Make Pixel/phone-mesh the primary edge inference path.",
    scores: { trust: 3, latency: 2, sovereignty: 4, determinism: 3, cheapDevice: 2, proof: 2 },
    failureMode: "Current phone backends are unreachable, so this cannot be the present proof path.",
    absorb: "Keep the route explicit and GrapheneOS-safe, but fall back to PWA/Mac proof until limb health passes.",
  },
  {
    id: "active-mirror-harness",
    title: "Active Mirror harness",
    shape: "Active Mirror owns contracts, gates, model routing, receipts, replay, and public claim boundaries.",
    scores: { trust: 5, latency: 4, sovereignty: 5, determinism: 5, cheapDevice: 4, proof: 5 },
    failureMode: "If the harness stays doctrine-only, another app can copy the surface.",
    absorb: "Make every claim executable: claim guard, route receipt, device gate, source contract, replay check.",
  },
];

export const aindiaRecursionWinner = {
  title: "Collapse path",
  body:
    "Build AIndia Check as the public wedge, prove it on the Mac local harness, keep Sanatana as doctrine/lab, and make Active Mirror the deterministic trust runtime.",
  today:
    "Apply one visible recursion layer, expose it through the API, then verify build/browser proof before any public claim.",
};

export const aindiaRecursionLoop = [
  {
    step: "Observe",
    rule: "Read live body, repo, model, phone, service, and source state before claims.",
  },
  {
    step: "Simulate",
    rule: "Score every plausible route against trust, latency, sovereignty, determinism, cheap-device fit, and proof.",
  },
  {
    step: "Gate",
    rule: "Block routes that depend on unreachable devices, unsupported models, silent upload, or unverified claims.",
  },
  {
    step: "Absorb",
    rule: "Keep only verified rails and bounded hypotheses; mark the rest as blocked or future.",
  },
  {
    step: "Apply",
    rule: "Ship one reversible product/runtime slice that makes the harness harder to copy.",
  },
  {
    step: "Verify",
    rule: "Run typecheck, lint, build, API checks, and browser proof before handoff.",
  },
];

const recursionPressures = [
  "cheap-device latency",
  "language confusion",
  "UPI and OTP risk",
  "offline-first storage",
  "source-grounded answer",
  "founder relay consent",
  "Sarvam helper download",
  "phone-mesh health",
  "public claim boundary",
  "receipt replay",
] as const;

const recursionImprovements = [
  "Keep the first answer as a check, not a lecture.",
  "Prefer script detection before translation.",
  "Block payment or account action until approval exists.",
  "Keep files local unless cloud consent is explicit.",
  "Mark unsourced claims as unverified.",
  "Prepare relay notes only after contact and consent.",
  "Gate helper downloads by Wi-Fi, battery, and storage.",
  "Treat phone rails as optional until backend health passes.",
  "Convert strong positioning into pass/fail tests.",
  "Write receipts for sensitive decisions.",
] as const;

function scoreScenario(scenario: AIndiaRecursionScenario) {
  const values = aindiaRecursionScoreLabels.map((label) => scenario.scores[label]);
  return values.reduce<number>((sum, value) => sum + value, 0);
}

function statusForCycle(scenario: AIndiaRecursionScenario, pressureIndex: number): AIndiaHundredRecursionStatus {
  const score = scoreScenario(scenario);
  if (scenario.id === "phone-mesh-first" || scenario.id === "frontier-chatbot") return "blocked";
  if (score >= 27 && pressureIndex !== 7) return "absorbed";
  return "backlog";
}

function receiptForCycle(cycle: number, scenario: AIndiaRecursionScenario, pressure: string) {
  const normalized = `${cycle}:${scenario.id}:${pressure}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `AIN-R${String(cycle).padStart(3, "0")}-${normalized.slice(-16)}`;
}

export const aindiaHundredRecursions: AIndiaHundredRecursion[] = Array.from({ length: 100 }, (_, index) => {
  const cycle = index + 1;
  const pressure = recursionPressures[index % recursionPressures.length];
  const scenario = aindiaRecursionScenarios[(index * 7 + 3) % aindiaRecursionScenarios.length];
  const pressureIndex = recursionPressures.indexOf(pressure);
  const status = statusForCycle(scenario, pressureIndex);
  const score = scoreScenario(scenario);

  return {
    cycle,
    pressure,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    gate:
      status === "absorbed"
        ? "passes current harness"
        : status === "blocked"
          ? "blocked until proof exists"
          : "kept as bounded backlog",
    status,
    improvement: recursionImprovements[pressureIndex],
    receiptId: receiptForCycle(cycle, scenario, pressure),
    score,
  };
});

const absorbedCount = aindiaHundredRecursions.filter((item) => item.status === "absorbed").length;
const blockedCount = aindiaHundredRecursions.filter((item) => item.status === "blocked").length;
const backlogCount = aindiaHundredRecursions.filter((item) => item.status === "backlog").length;

export const aindiaHundredRecursionSummary = {
  total: aindiaHundredRecursions.length,
  absorbed: absorbedCount,
  blocked: blockedCount,
  backlog: backlogCount,
  firstCycle: aindiaHundredRecursions[0],
  finalCycle: aindiaHundredRecursions[99],
  invariant:
    "One hundred simulated passes do not grant perfection. They produce a tighter queue of verified rails, blocked assumptions, and bounded next slices.",
};

export const aindiaForeverLoop = {
  id: "aindia-recursion-loop",
  status: "active",
  cadence: "Every 6 hours",
  guardrail:
    "Each pass may apply one bounded improvement only after typecheck, lint, build, API proof, and browser proof. No autonomous deploys or runtime-topology mutations.",
  receipt: "Local Codex automation: aindia-recursion-loop",
};
