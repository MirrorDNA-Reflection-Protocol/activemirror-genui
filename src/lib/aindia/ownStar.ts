export type AIndiaStarAxiom = {
  title: string;
  userProvidedSignal: string;
  runtimeRule: string;
  gate: string;
};

export type AIndiaAntiStar = {
  title: string;
  reject: string;
};

export type AIndiaDecisionRule = {
  pressure: string;
  choose: string;
};

export const aindiaOwnStar = {
  title: "The AIndia Star",
  subtitle: "Create the compass, not just the destination.",
  provenance:
    "This doctrine is derived only from user-provided direction in this build thread. It is product doctrine, not an external factual claim.",
  core:
    "AIndia exists to help people make safer, clearer decisions in their language, on the devices they actually have, without extracting trust from them.",
};

export const activeMirrorIndiaPosition = {
  title: "Active Mirror is Sovereign AI for India",
  boundary:
    "This is user-provided product positioning. It means Active Mirror owns the trust harness: local-first routes, consent, source-bound claims, deterministic gates, receipts, replay, and human relay. It does not claim government endorsement, monopoly, or perfect model certainty.",
  proofStandard:
    "The position is earned only when the runtime gates pass: claim guard, consent envelope, tiny route, source pack, receipt writer, replay verifier, and low-end-device budget.",
};

export const aindiaStarAxioms: AIndiaStarAxiom[] = [
  {
    title: "Help, not extraction",
    userProvidedSignal: "we are here to help not extract",
    runtimeRule: "Solve the current turn with the least data required.",
    gate: "No hidden upload, no shadow profile, no unnecessary retention.",
  },
  {
    title: "Trust by design",
    userProvidedSignal: "trust by design",
    runtimeRule: "Trust is a product property, not a marketing line.",
    gate: "Consent, local-first route, receipts, and clear boundaries before risky action.",
  },
  {
    title: "Reflection over prediction",
    userProvidedSignal: "reflection over prediction",
    runtimeRule: "A model may draft; the harness reflects before advice becomes action.",
    gate: "Observe, retrieve, reflect, propose, gate, receipt, replay.",
  },
  {
    title: "Latency and cheap devices first",
    userProvidedSignal: "latency, and cheap devices priority",
    runtimeRule: "Fast useful checks beat impressive slow answers.",
    gate: "Tiny route before LLM route; every heavy path needs a light fallback.",
  },
  {
    title: "No made-up facts",
    userProvidedSignal: "dont make any shit up make sure you are hallucination free",
    runtimeRule: "Do not claim what cannot be sourced, receipted, or labeled as an assumption.",
    gate: "Claim guard blocks unsupported facts, statistics, future certainty, and simulated founder claims.",
  },
  {
    title: "Human relay with consent",
    userProvidedSignal: "chatbot up that allows the user to talk me via you",
    runtimeRule: "The assistant can help people reach the human, but it cannot impersonate the human.",
    gate: "Relay requires contact, consent, and a user-sent handoff.",
  },
  {
    title: "India without performance",
    userProvidedSignal: "we are in india but no cringe",
    runtimeRule: "India-specific means lived workflows, language, devices, fraud, public services, and SMEs.",
    gate: "No decorative nationalism, no fake cultural texture, no unsupported population claims.",
  },
];

export const aindiaAntiStar: AIndiaAntiStar[] = [
  {
    title: "Do not chase frontier-model ego",
    reject: "AIndia should not depend on beating frontier labs at pretraining.",
  },
  {
    title: "Do not make a chatbot costume",
    reject: "AIndia should not be a generic chat box with Indian words pasted on top.",
  },
  {
    title: "Do not convert confusion into capture",
    reject: "A lost person is not a lead to extract. First help, then ask consent.",
  },
  {
    title: "Do not fake certainty",
    reject: "Unknown, stale, and unsourced states must stay visible.",
  },
  {
    title: "Do not build flagship-only AI",
    reject: "If it fails on cheap Android and poor networks, it misses the wedge.",
  },
];

export const aindiaDecisionRules: AIndiaDecisionRule[] = [
  {
    pressure: "Accuracy vs speed",
    choose: "Give a safe fast next step, then offer sourced depth.",
  },
  {
    pressure: "Power vs trust",
    choose: "Keep the local/consented route even if a cloud model would be flashier.",
  },
  {
    pressure: "Growth vs dignity",
    choose: "Do not use confusion, fear, or low literacy as conversion pressure.",
  },
  {
    pressure: "Model capability vs deterministic behavior",
    choose: "Let the model propose, but keep the harness as authority.",
  },
  {
    pressure: "Future vision vs factual rigor",
    choose: "Label scenarios as scenarios and ship only verified runtime claims.",
  },
];
