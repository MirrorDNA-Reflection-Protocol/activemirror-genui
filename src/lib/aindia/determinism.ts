import { createHash } from "node:crypto";
import { validateAIndiaRuntimeEnvelope, type AIndiaEnvelopeValidation } from "./hardening";
import { aindiaDeterminismPrinciples } from "./determinismPrinciples";
import { makeAIndiaEnvelope, type AIndiaRuntimeEnvelope } from "./wrapperProtocol";

export type AIndiaDeterministicRisk = "safe" | "risky" | "verify" | "blocked";

export type AIndiaDeterministicAction =
  | "answer_locally"
  | "ask_one_question"
  | "warn_user"
  | "route_chetana"
  | "require_approval"
  | "write_receipt"
  | "block";

export type AIndiaCanonicalInput = {
  text: string;
  languageCode: string;
  inputKind: AIndiaRuntimeEnvelope["inputKind"];
  riskClass: AIndiaRuntimeEnvelope["riskClass"];
  sourceLabels: string[];
};

export type AIndiaModelProposal = {
  summary: string;
  risk: AIndiaDeterministicRisk;
  nextStep: string;
  citations: string[];
  asksForAction: boolean;
  wantsUpload: boolean;
  confidence: "low" | "medium" | "high";
};

export type AIndiaHarnessDecision = {
  routeId: string;
  risk: AIndiaDeterministicRisk;
  actions: AIndiaDeterministicAction[];
  userLine: string;
  allowedToAnswer: boolean;
  allowedToAct: boolean;
  receiptRequired: boolean;
  receiptHash: string;
  validation: AIndiaEnvelopeValidation;
};

const riskWords = [
  "upi",
  "otp",
  "password",
  "kyc",
  "loan",
  "job",
  "urgent",
  "click",
  "link",
  "refund",
  "bank",
  "aadhaar",
  "pan",
  "account",
  "pay",
  "payment",
  "qr",
];

function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .slice(0, 4000);
}

export function canonicalizeAIndiaInput(input: AIndiaCanonicalInput): AIndiaCanonicalInput {
  return {
    text: normalizeText(input.text).toLowerCase(),
    languageCode: input.languageCode.toLowerCase(),
    inputKind: input.inputKind,
    riskClass: input.riskClass,
    sourceLabels: Array.from(new Set(input.sourceLabels.map((label) => normalizeText(label).toLowerCase()).filter(Boolean))).sort(),
  };
}

export function classifyAIndiaRisk(input: AIndiaCanonicalInput): AIndiaDeterministicRisk {
  const canonical = canonicalizeAIndiaInput(input);
  if (canonical.riskClass === "money" || canonical.riskClass === "identity" || canonical.riskClass === "account") return "risky";
  if (canonical.riskClass === "child" || canonical.riskClass === "device") return "blocked";
  if (riskWords.some((word) => canonical.text.includes(word))) return "verify";
  if (canonical.text.length < 8) return "verify";
  return "safe";
}

export function sanitizeAIndiaProposal(proposal: Partial<AIndiaModelProposal> | null | undefined): AIndiaModelProposal {
  return {
    summary: normalizeText(proposal?.summary ?? "I can help check this, but I need one clear input."),
    risk: proposal?.risk && ["safe", "risky", "verify", "blocked"].includes(proposal.risk) ? proposal.risk : "verify",
    nextStep: normalizeText(proposal?.nextStep ?? "Please send the message, screenshot, or form first."),
    citations: Array.from(new Set((proposal?.citations ?? []).map((citation) => normalizeText(citation)).filter(Boolean))).slice(0, 3),
    asksForAction: Boolean(proposal?.asksForAction),
    wantsUpload: Boolean(proposal?.wantsUpload),
    confidence: proposal?.confidence && ["low", "medium", "high"].includes(proposal.confidence) ? proposal.confidence : "low",
  };
}

export function decideAIndiaHarness(input: {
  canonicalInput: AIndiaCanonicalInput;
  envelope: AIndiaRuntimeEnvelope;
  proposal?: Partial<AIndiaModelProposal> | null;
}): AIndiaHarnessDecision {
  const canonical = canonicalizeAIndiaInput(input.canonicalInput);
  const deterministicRisk = classifyAIndiaRisk(canonical);
  const proposal = sanitizeAIndiaProposal(input.proposal);
  const envelope = makeAIndiaEnvelope(input.envelope);
  const validation = validateAIndiaRuntimeEnvelope(envelope);
  const actions = new Set<AIndiaDeterministicAction>();

  if (!validation.ok) actions.add("block");
  if (deterministicRisk === "blocked" || proposal.risk === "blocked") actions.add("block");
  if (deterministicRisk === "risky" || proposal.risk === "risky") {
    actions.add("warn_user");
    actions.add("route_chetana");
    actions.add("require_approval");
    actions.add("write_receipt");
  }
  if (deterministicRisk === "verify" || proposal.risk === "verify") {
    actions.add("ask_one_question");
    actions.add("write_receipt");
  }
  if (proposal.asksForAction || envelope.inputKind === "action") actions.add("require_approval");
  if (proposal.wantsUpload || envelope.consent.mayUpload) actions.add("require_approval");
  if (actions.size === 0) actions.add("answer_locally");

  const finalActions = Array.from(actions).sort();
  const allowedToAct = validation.ok && !finalActions.includes("block") && !finalActions.includes("require_approval");
  const allowedToAnswer = validation.ok && !finalActions.includes("block");
  const receiptRequired = finalActions.includes("write_receipt") || deterministicRisk !== "safe";
  const routeId = stableHash({
    canonical,
    envelope: {
      target: envelope.target,
      inputKind: envelope.inputKind,
      hookId: envelope.hookId,
      languageCode: envelope.languageCode,
      riskClass: envelope.riskClass,
      requiredGates: envelope.requiredGates.slice().sort(),
    },
    deterministicRisk,
    finalActions,
  }).slice(0, 16);

  const userLine = finalActions.includes("block")
    ? "Rukiye. Is par main bina approval ke aage nahi badhunga."
    : finalActions.includes("route_chetana")
      ? "Rukiye. Yeh risky lag raha hai. Pehle Chetana/Kavach se check karte hain."
      : finalActions.includes("ask_one_question")
        ? "Pehle ek baat verify karni hogi."
        : "Theek lag raha hai. Phir bhi paisa ya identity ho to confirm karke hi aage badhiye.";

  const receiptHash = stableHash({
    routeId,
    canonical,
    finalActions,
    userLine,
    validation: validation.severity,
  });

  return {
    routeId,
    risk: finalActions.includes("block") ? "blocked" : deterministicRisk === "safe" ? proposal.risk : deterministicRisk,
    actions: finalActions,
    userLine,
    allowedToAnswer,
    allowedToAct,
    receiptRequired,
    receiptHash,
    validation,
  };
}

export { aindiaDeterminismPrinciples };
