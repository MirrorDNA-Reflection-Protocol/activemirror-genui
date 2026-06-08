import {
  ACTIVE_MIRROR_BOOTLOADER_CONTRACT,
  ACTIVE_MIRROR_LOCAL_SUPERVISOR_CONTRACT,
  ACTIVE_MIRROR_PRODUCT_CONSTITUTION,
  ACTIVE_MIRROR_RELEASE_EVALUATION,
  ACTIVE_MIRROR_STORAGE_CONTRACT,
} from "./contracts/activeMirrorBootloader";

export const ACTIVE_MIRROR_RATCHET_VERSION = "2026.06.08-mirror-ratchet-v1";

type RatchetState = "passing" | "queued" | "blocked";

export type MirrorRatchetCheck = {
  id: string;
  label: string;
  state: RatchetState;
  frontierFailure: string;
  activeMirrorControl: string;
};

export type MirrorRatchetStatus = {
  version: typeof ACTIVE_MIRROR_RATCHET_VERSION;
  targetPasses: 1000;
  claimBoundary: string;
  score: {
    passing: number;
    total: number;
    coveragePct: number;
  };
  frontierFailureCoverage: {
    covered: string[];
    queued: string[];
  };
  checks: MirrorRatchetCheck[];
  frontierComparison: Array<{
    axis: string;
    nakedFrontierModel: string;
    activeMirror: string;
  }>;
  nextQueue: string[];
};

function hasRule(rules: readonly string[], pattern: RegExp) {
  return rules.some((rule) => pattern.test(rule));
}

function check(
  id: string,
  label: string,
  state: RatchetState,
  frontierFailure: string,
  activeMirrorControl: string,
): MirrorRatchetCheck {
  return { id, label, state, frontierFailure, activeMirrorControl };
}

export function getMirrorRatchetStatus(): MirrorRatchetStatus {
  const checks: MirrorRatchetCheck[] = [
    check(
      "accuracy-without-fabrication",
      "Accuracy without fabrication",
      hasRule(ACTIVE_MIRROR_BOOTLOADER_CONTRACT, /Accuracy without fabrication/) ? "passing" : "blocked",
      "Optimizes for plausible helpful text, even when proof is absent.",
      "Facts, assumptions, unknowns, source gaps, and next safe steps are explicit.",
    ),
    check(
      "canonical-promotion",
      "Canonical promotion",
      hasRule(ACTIVE_MIRROR_LOCAL_SUPERVISOR_CONTRACT, /Promotion is canonical/) ? "passing" : "blocked",
      "Lets model output feel final by default.",
      "Probabilistic output cannot promote facts, memory, permissions, receipts, or actions.",
    ),
    check(
      "context-firewall",
      "Context firewall",
      hasRule(ACTIVE_MIRROR_LOCAL_SUPERVISOR_CONTRACT, /context envelope/) ? "passing" : "blocked",
      "Wants broad context to improve output.",
      "The supervisor sends only a scoped task packet to proposer models.",
    ),
    check(
      "memory-writeback",
      "Memory writeback firewall",
      hasRule(ACTIVE_MIRROR_STORAGE_CONTRACT, /No model output becomes memory/) ? "passing" : "blocked",
      "Can infer preferences and fold them into future behavior opaquely.",
      "No output becomes memory, proof, or canonical state without consent, scope, and receipts.",
    ),
    check(
      "action-authority",
      "Action authority",
      hasRule(ACTIVE_MIRROR_BOOTLOADER_CONTRACT, /No irreversible action/) ? "passing" : "blocked",
      "Tool availability can be confused with permission.",
      "Files, accounts, devices, sends, spend, and durable writes require scoped approval.",
    ),
    check(
      "generated-surface",
      "Generated surface first",
      hasRule(ACTIVE_MIRROR_PRODUCT_CONSTITUTION, /generated workspace/) ? "passing" : "blocked",
      "Returns a chat answer as the product.",
      "Compiles the request into a workspace, proof line, export, and next action.",
    ),
    check(
      "release-gates",
      "Release gates",
      ACTIVE_MIRROR_RELEASE_EVALUATION.length >= 10 ? "passing" : "blocked",
      "Improves by vibes or benchmark snippets.",
      "Ships against visible release gates for proof, mobile, voice, artifacts, and private-path absence.",
    ),
    check(
      "portable-proof",
      "Portable proof ledger",
      "queued",
      "Audit data usually belongs to the vendor or product account.",
      "Next queue: exportable hash-chain ledger with revocation cascade events.",
    ),
    check(
      "identity-continuity",
      "Identity continuity across models",
      "queued",
      "Identity is bound to one model session or one vendor account.",
      "Next queue: identity-vector and cross-model drift score with receipts.",
    ),
    check(
      "confession-stream",
      "Confessional self-transparency",
      "queued",
      "Most assistants hide policy misses, stale assumptions, and tool failures behind polished prose.",
      "Next queue: live decision/critique stream that shows gate fires and system failures.",
    ),
  ];

  const passing = checks.filter((item) => item.state === "passing").length;

  return {
    version: ACTIVE_MIRROR_RATCHET_VERSION,
    targetPasses: 1000,
    claimBoundary:
      "Better than naked frontier chat on controlled truth, continuity, provenance, permission, and generated work surfaces; not a claim of superior raw model IQ.",
    score: {
      passing,
      total: checks.length,
      coveragePct: Math.round((passing / checks.length) * 100),
    },
    frontierFailureCoverage: {
      covered: [
        "fabricated certainty",
        "source promotion without proof",
        "memory ambiguity",
        "permission blur",
        "tool/action overclaiming",
        "generic chat instead of generated work",
        "private-context leakage",
      ],
      queued: [
        "vendor-owned proof ledger",
        "model-swap identity drift",
        "hidden system failure stream",
      ],
    },
    checks,
    frontierComparison: [
      {
        axis: "Truth",
        nakedFrontierModel: "Confident answer",
        activeMirror: "Source, receipt, assumption, unknown, or source_gap",
      },
      {
        axis: "Memory",
        nakedFrontierModel: "Session or vendor profile",
        activeMirror: "Scoped, opt-in, revocable continuity",
      },
      {
        axis: "Authority",
        nakedFrontierModel: "Model/tool route can blur into action",
        activeMirror: "Canonical approval gate before files, accounts, devices, sends, spend, or memory writes",
      },
      {
        axis: "Output",
        nakedFrontierModel: "Text response",
        activeMirror: "Generated workspace, artifact, proof line, export, and next action",
      },
      {
        axis: "Portability",
        nakedFrontierModel: "Vendor-owned transcript or logs",
        activeMirror: "User-owned receipts and public-safe body sync path",
      },
    ],
    nextQueue: [
      "Install production body receipt publisher and token.",
      "Verify public-key signatures instead of present_unverified signature state.",
      "Add revocation cascade events when memory or source permissions change.",
      "Add identity-continuity score across model swaps.",
      "Expose live decision/critique stream for gate failures.",
    ],
  };
}
