import { createHash } from "node:crypto";
import { readPublicBodyReceiptSummary } from "./bodyReceipt";
import { getMirrorRatchetStatus } from "./mirrorRatchet";

export const ACTIVE_MIRROR_PROOF_LEDGER_VERSION = "2026.06.08-proof-ledger-v1";

export type ProofLedgerEntry = {
  index: number;
  id: string;
  kind:
    | "doctrine"
    | "kernel"
    | "body_receipt"
    | "ratchet"
    | "approval_gate"
    | "export";
  statement: string;
  state: "proven" | "available" | "missing" | "queued" | "gated";
  source: string;
  previousHash: string;
  hash: string;
};

export type ProofLedger = {
  version: typeof ACTIVE_MIRROR_PROOF_LEDGER_VERSION;
  owner: "user";
  portability: "exportable_public_safe";
  claimBoundary: string;
  generatedAt: string;
  chainHead: string;
  entries: ProofLedgerEntry[];
  queuedPrivateEvents: string[];
};

function hashEntry(entry: Omit<ProofLedgerEntry, "hash">) {
  return `sha256:${createHash("sha256").update(JSON.stringify(entry)).digest("hex")}`;
}

function buildEntry(
  entries: ProofLedgerEntry[],
  item: Omit<ProofLedgerEntry, "index" | "previousHash" | "hash">,
) {
  const previousHash = entries.at(-1)?.hash || "genesis";
  const entryWithoutHash = {
    index: entries.length,
    previousHash,
    ...item,
  };
  const entry = {
    ...entryWithoutHash,
    hash: hashEntry(entryWithoutHash),
  };
  entries.push(entry);
}

export async function getProofLedger(): Promise<ProofLedger> {
  const [bodyReceipt, ratchet] = await Promise.all([
    readPublicBodyReceiptSummary(),
    Promise.resolve(getMirrorRatchetStatus()),
  ]);
  const entries: ProofLedgerEntry[] = [];

  buildEntry(entries, {
    id: "doctrine.accuracy",
    kind: "doctrine",
    statement: "Accuracy without fabrication is active doctrine.",
    state: "proven",
    source: "ACTIVE_MIRROR_BOOTLOADER_CONTRACT",
  });
  buildEntry(entries, {
    id: "kernel.canonical",
    kind: "kernel",
    statement: "Probabilistic engines are proposer-only; canonical runtime verifies and promotes.",
    state: "proven",
    source: "/api/mirror/kernel",
  });
  buildEntry(entries, {
    id: "body.receipt",
    kind: "body_receipt",
    statement:
      bodyReceipt.status === "available"
        ? "A sanitized public body receipt is available."
        : "No fresh sanitized public body receipt is available.",
    state: bodyReceipt.status === "available" ? "available" : "missing",
    source: "/api/mirror/body-receipt",
  });
  buildEntry(entries, {
    id: "ratchet.frontier_failure_coverage",
    kind: "ratchet",
    statement: `MirrorRatchet covers ${ratchet.frontierFailureCoverage.covered.length} frontier failure classes and queues ${ratchet.frontierFailureCoverage.queued.length}.`,
    state: ratchet.score.passing > 0 ? "available" : "queued",
    source: "/api/mirror/ratchet",
  });
  buildEntry(entries, {
    id: "approval.private_actions",
    kind: "approval_gate",
    statement: "Private files, vault, accounts, devices, sends, spend, and durable writes remain scoped-approval gated.",
    state: "gated",
    source: "ACTIVE_MIRROR_LOCAL_SUPERVISOR_CONTRACT",
  });
  buildEntry(entries, {
    id: "export.public_safe",
    kind: "export",
    statement: "This ledger is public-safe and exportable by the user.",
    state: "available",
    source: "/api/mirror/proof-ledger",
  });

  return {
    version: ACTIVE_MIRROR_PROOF_LEDGER_VERSION,
    owner: "user",
    portability: "exportable_public_safe",
    claimBoundary:
      "This is a public-safe proof ledger. It records doctrine, route, receipt, ratchet, gate, and export states; it does not expose private files, raw topology, or account data.",
    generatedAt: new Date().toISOString(),
    chainHead: entries.at(-1)?.hash || "genesis",
    entries,
    queuedPrivateEvents: [
      "private body receipt publisher",
      "public-key signature verification",
      "revocation cascade events",
      "identity continuity score",
      "decision critique stream",
    ],
  };
}

export function proofLedgerToMarkdown(ledger: ProofLedger) {
  const lines = [
    "# Active Mirror Public-Safe Proof Ledger",
    "",
    `Version: ${ledger.version}`,
    `Generated: ${ledger.generatedAt}`,
    `Owner: ${ledger.owner}`,
    `Portability: ${ledger.portability}`,
    `Chain head: ${ledger.chainHead}`,
    "",
    ledger.claimBoundary,
    "",
    "## Entries",
    "",
    "| # | ID | Kind | State | Source | Hash |",
    "| --- | --- | --- | --- | --- | --- |",
    ...ledger.entries.map((entry) =>
      `| ${entry.index} | ${entry.id} | ${entry.kind} | ${entry.state} | ${entry.source} | ${entry.hash} |`,
    ),
    "",
    "## Queued Private Events",
    "",
    ...ledger.queuedPrivateEvents.map((event) => `- ${event}`),
    "",
  ];

  return lines.join("\n");
}
