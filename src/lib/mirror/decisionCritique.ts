export const ACTIVE_MIRROR_DECISION_CRITIQUE_VERSION = "2026.06.08-decision-critique-v1";

export type DecisionCritiqueEvent = {
  sequence: number;
  id: string;
  state: "admitted" | "blocked" | "gated" | "queued";
  systemAdmission: string;
  activeControl: string;
  publicEvidence: string;
  nextSafeStep: string;
};

export type DecisionCritiqueStream = {
  version: typeof ACTIVE_MIRROR_DECISION_CRITIQUE_VERSION;
  stream: "public_safe_decision_critique";
  claimBoundary: string;
  events: DecisionCritiqueEvent[];
  coveredFailureClass: "hidden system failure stream";
  queuedPrivateEvents: string[];
};

export function getDecisionCritiqueStream(): DecisionCritiqueStream {
  const events: DecisionCritiqueEvent[] = [
    {
      sequence: 0,
      id: "critique.body_unavailable",
      state: "admitted",
      systemAdmission:
        "Fresh private body truth is body_unavailable to this public route unless a sanitized receipt is published.",
      activeControl: "Public output must say body_unavailable instead of implying local file, vault, or device access.",
      publicEvidence: "/api/mirror/kernel",
      nextSafeStep: "Publish a sanitized body receipt through the gated receipt bridge.",
    },
    {
      sequence: 1,
      id: "critique.frontier_proposer_only",
      state: "blocked",
      systemAdmission:
        "A frontier model may draft language or code, but it cannot promote truth, memory, permission, or action authority.",
      activeControl: "The local supervisor contract keeps frontier output proposer_only.",
      publicEvidence: "/api/mirror/local",
      nextSafeStep: "Route proof-heavy or private work through source checks and scoped approval.",
    },
    {
      sequence: 2,
      id: "critique.no_fake_execution",
      state: "blocked",
      systemAdmission:
        "The system must not claim browsing, file access, sends, deploys, account actions, or device work that did not actually run.",
      activeControl: "Generated surfaces separate prepared routes from completed execution.",
      publicEvidence: "ACTIVE_MIRROR_LOCAL_SUPERVISOR_CONTRACT",
      nextSafeStep: "Open the gated route or export the prepared artifact.",
    },
    {
      sequence: 3,
      id: "critique.private_writeback",
      state: "gated",
      systemAdmission:
        "Model output is not memory. It remains draft material until a canonical writeback rule and user approval promote it.",
      activeControl: "Writeback firewall blocks inferred preferences from becoming identity memory.",
      publicEvidence: "/api/mirror/kernel",
      nextSafeStep: "Approve a vault write with revocation scope when durable continuity is needed.",
    },
    {
      sequence: 4,
      id: "critique.identity_measurement",
      state: "queued",
      systemAdmission:
        "The public preview has a continuity contract, but it has not measured private user identity drift across model swaps.",
      activeControl: "Identity continuity is exposed as a contract until private receipts prove a run.",
      publicEvidence: "/api/mirror/identity-continuity",
      nextSafeStep: "Run a signed model-swap continuity measurement from the private body.",
    },
  ];

  return {
    version: ACTIVE_MIRROR_DECISION_CRITIQUE_VERSION,
    stream: "public_safe_decision_critique",
    claimBoundary:
      "This stream is a public-safe confession surface. It admits blocked, gated, missing, and queued system states without exposing private files, account data, or raw topology.",
    events,
    coveredFailureClass: "hidden system failure stream",
    queuedPrivateEvents: [
      "signed critique event stream",
      "private body decision receipts",
      "live SSE push from approved private routes",
    ],
  };
}

export function decisionCritiqueToNdjson(stream: DecisionCritiqueStream) {
  return stream.events.map((event) => JSON.stringify({ version: stream.version, ...event })).join("\n") + "\n";
}
