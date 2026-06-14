export type AIndiaGlyphId =
  | "reflect"
  | "source"
  | "language"
  | "local"
  | "consent"
  | "unknown"
  | "risk"
  | "memory"
  | "next";

export type AIndiaGlyph = {
  id: AIndiaGlyphId;
  symbol: string;
  label: string;
  category: "REFLECT" | "PROOF" | "LANGUAGE" | "ROUTE" | "GATE" | "STATE" | "MEMORY" | "ACTION";
  truthTier: "shown" | "checked" | "gated" | "unknown";
  meaning: string;
  compileTarget: string;
  allowedModes: string[];
  closureRequired: boolean;
};

export const aindiaGlyphGrammarVersion = "aindia-glyph-grammar-2026-06-14";

const allModes = ["voice", "photo", "message", "source-pack", "offline-helper", "cloud-fallback"];

export const aindiaGlyphs: AIndiaGlyph[] = [
  {
    id: "reflect",
    symbol: "⟡",
    label: "Reflect",
    category: "REFLECT",
    truthTier: "checked",
    meaning: "Reflect before prediction: language, intent, source, risk, consent, action, receipt.",
    compileTarget: "turn.reflect",
    allowedModes: allModes,
    closureRequired: true,
  },
  {
    id: "source",
    symbol: "⧉",
    label: "Source",
    category: "PROOF",
    truthTier: "checked",
    meaning: "The answer is tied to a source pack, local document, or marked as needing a source.",
    compileTarget: "proof.source",
    allowedModes: ["photo", "message", "source-pack", "cloud-fallback"],
    closureRequired: true,
  },
  {
    id: "language",
    symbol: "भ",
    label: "Bhasha",
    category: "LANGUAGE",
    truthTier: "shown",
    meaning: "Script or language was detected before the answer route.",
    compileTarget: "language.detect",
    allowedModes: allModes,
    closureRequired: false,
  },
  {
    id: "local",
    symbol: "◎",
    label: "Local",
    category: "ROUTE",
    truthTier: "checked",
    meaning: "Local supervisor or local helper route was considered before a cloud route.",
    compileTarget: "route.local_first",
    allowedModes: ["voice", "photo", "message", "offline-helper"],
    closureRequired: true,
  },
  {
    id: "consent",
    symbol: "⨀",
    label: "Consent",
    category: "GATE",
    truthTier: "gated",
    meaning: "Upload, send, payment, account, file, or device action needs explicit approval.",
    compileTarget: "gate.human_approved",
    allowedModes: ["photo", "message", "cloud-fallback"],
    closureRequired: true,
  },
  {
    id: "unknown",
    symbol: "◇",
    label: "Unknown",
    category: "STATE",
    truthTier: "unknown",
    meaning: "The system must say what is missing instead of guessing.",
    compileTarget: "state.unknown",
    allowedModes: allModes,
    closureRequired: true,
  },
  {
    id: "risk",
    symbol: "⛔",
    label: "Risk",
    category: "GATE",
    truthTier: "gated",
    meaning: "UPI, OTP, KYC, job, fraud, identity, or coercion risk slows the answer down.",
    compileTarget: "gate.safety_checked",
    allowedModes: ["message", "photo", "cloud-fallback"],
    closureRequired: true,
  },
  {
    id: "memory",
    symbol: "⧈",
    label: "Memory",
    category: "MEMORY",
    truthTier: "gated",
    meaning: "Receipts can persist only with consent; no silent profile.",
    compileTarget: "memory.consent_receipt",
    allowedModes: allModes,
    closureRequired: true,
  },
  {
    id: "next",
    symbol: "→",
    label: "Next",
    category: "ACTION",
    truthTier: "shown",
    meaning: "One clear next step, not a long lecture.",
    compileTarget: "action.next_step",
    allowedModes: allModes,
    closureRequired: false,
  },
];

const defaultAnswerGlyphs: AIndiaGlyphId[] = ["reflect", "language", "local", "source", "next"];

export function getAIndiaGlyphs(ids: readonly AIndiaGlyphId[] = defaultAnswerGlyphs) {
  const byId = new Map(aindiaGlyphs.map((glyph) => [glyph.id, glyph]));
  return ids.map((id) => byId.get(id)).filter((glyph): glyph is AIndiaGlyph => Boolean(glyph));
}

export function answerGlyphIdsForRisk(status?: "safe" | "risky" | "verify") {
  if (status === "risky") return ["reflect", "language", "local", "source", "risk", "consent", "next"] satisfies AIndiaGlyphId[];
  if (status === "verify") return ["reflect", "language", "local", "source", "unknown", "consent", "next"] satisfies AIndiaGlyphId[];
  return defaultAnswerGlyphs;
}

export type AIndiaGlyphGraphNode = {
  id: string;
  label: string;
  type: "agent" | "service" | "data" | "security" | "default";
  glyphId?: AIndiaGlyphId;
  category?: AIndiaGlyph["category"];
  truthTier?: AIndiaGlyph["truthTier"];
  compileTarget?: string;
};

export type AIndiaGlyphGraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export function getAIndiaGlyphMirrorGraph() {
  const glyphNodes: AIndiaGlyphGraphNode[] = aindiaGlyphs.map((glyph) => ({
    id: `glyph:${glyph.id}`,
    label: `${glyph.symbol} ${glyph.label}`,
    type:
      glyph.category === "GATE"
        ? "security"
        : glyph.category === "PROOF" || glyph.category === "MEMORY"
          ? "data"
          : glyph.category === "LANGUAGE" || glyph.category === "ROUTE"
            ? "service"
            : "default",
    glyphId: glyph.id,
    category: glyph.category,
    truthTier: glyph.truthTier,
    compileTarget: glyph.compileTarget,
  }));

  const nodes: AIndiaGlyphGraphNode[] = [
    { id: "aindia:glyph-grammar", label: "AIndia glyph grammar", type: "agent" },
    { id: "aindia:turn-reflection", label: "Reflective turn", type: "agent" },
    { id: "aindia:receipt", label: "Receipt edge", type: "data" },
    ...glyphNodes,
  ];

  const edges: AIndiaGlyphGraphEdge[] = [
    ...aindiaGlyphs.map((glyph) => ({
      id: `grammar-defines-${glyph.id}`,
      source: "aindia:glyph-grammar",
      target: `glyph:${glyph.id}`,
      label: "defines",
    })),
    { id: "turn-uses-reflect", source: "aindia:turn-reflection", target: "glyph:reflect", label: "starts with" },
    { id: "reflect-language", source: "glyph:reflect", target: "glyph:language", label: "observes" },
    { id: "language-local", source: "glyph:language", target: "glyph:local", label: "routes" },
    { id: "local-source", source: "glyph:local", target: "glyph:source", label: "checks" },
    { id: "source-unknown", source: "glyph:source", target: "glyph:unknown", label: "may expose" },
    { id: "source-next", source: "glyph:source", target: "glyph:next", label: "supports" },
    { id: "risk-consent", source: "glyph:risk", target: "glyph:consent", label: "requires" },
    { id: "consent-receipt", source: "glyph:consent", target: "aindia:receipt", label: "writes" },
    { id: "memory-receipt", source: "glyph:memory", target: "aindia:receipt", label: "requires consent" },
    { id: "next-receipt", source: "glyph:next", target: "aindia:receipt", label: "can log" },
  ];

  return {
    version: aindiaGlyphGrammarVersion,
    mirrorGraphId: "mirrorgraph:aindia:glyph-grammar:v1",
    boundary:
      "MirrorGraph stores the public glyph grammar and consented receipts, not raw private chat or silent user profiles.",
    nodes,
    edges,
  };
}
