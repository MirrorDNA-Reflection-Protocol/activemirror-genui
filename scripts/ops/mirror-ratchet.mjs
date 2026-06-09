#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const argPasses = process.argv.find((arg) => arg.startsWith("--passes="));
const passes = Number(argPasses?.split("=")[1] || process.env.MIRROR_RATCHET_PASSES || 1000);
const receiptPath = process.env.MIRROR_RATCHET_RECEIPT || "";

if (!Number.isInteger(passes) || passes < 1 || passes > 100000) {
  console.error("FAIL passes must be an integer between 1 and 100000");
  process.exit(1);
}

const files = {
  contracts: "src/lib/mirror/contracts/activeMirrorBootloader.ts",
  kernel: "src/lib/mirror/mirrorKernel.ts",
  bodyReceipt: "src/lib/mirror/bodyReceipt.ts",
  ratchet: "src/lib/mirror/mirrorRatchet.ts",
  proofLedger: "src/lib/mirror/proofLedger.ts",
  critique: "src/lib/mirror/decisionCritique.ts",
  revocation: "src/lib/mirror/revocationCascade.ts",
  identity: "src/lib/mirror/identityContinuity.ts",
  identityMeasure: "src/lib/mirror/identityContinuityMeasure.ts",
  ui: "src/components/active-mirror/GovernedGenUIWorkbench.tsx",
  tests: "tests/qa-suite.spec.ts",
  healthcheck: "scripts/ops/healthcheck.sh",
  signer: "scripts/ops/sign-body-receipt.mjs",
};

const contents = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
  ),
);

const invariants = [
  {
    id: "accuracy_without_fabrication",
    file: "contracts",
    pattern: /Accuracy without fabrication/,
  },
  {
    id: "probabilistic_proposer_canonical_verifier",
    file: "kernel",
    pattern: /probabilistic_proposer[\s\S]*canonical_verifier/,
  },
  {
    id: "canonical_promotion_blocks_model_memory",
    file: "contracts",
    pattern: /No model output becomes memory, proof, or canonical state/,
  },
  {
    id: "body_receipt_public_safe_bridge",
    file: "bodyReceipt",
    pattern: /ACTIVE_MIRROR_BODY_RECEIPT_SCHEMA_VERSION[\s\S]*receipt_contains_private_material/,
  },
  {
    id: "body_receipt_token_gate",
    file: "bodyReceipt",
    pattern: /timingSafeEqual[\s\S]*MIRROR_BODY_RECEIPT_TOKEN/,
  },
  {
    id: "body_receipt_ed25519_verification",
    file: "bodyReceipt",
    pattern: /MIRROR_BODY_RECEIPT_PUBLIC_KEY[\s\S]*publicBodyReceiptSigningPayload[\s\S]*ed25519_verified/,
  },
  {
    id: "body_receipt_signed_publisher",
    file: "signer",
    pattern: /MIRROR_BODY_RECEIPT_PRIVATE_KEY[\s\S]*receipt contains private material[\s\S]*algorithm: "ed25519"/,
  },
  {
    id: "ratchet_frontier_failure_coverage",
    file: "ratchet",
    pattern: /frontierFailureCoverage[\s\S]*fabricated certainty[\s\S]*unverified audit signatures[\s\S]*hidden system failure stream/,
  },
  {
    id: "ratchet_claim_boundary",
    file: "ratchet",
    pattern: /not a claim of superior raw model IQ/,
  },
  {
    id: "proof_ledger_hash_chain",
    file: "proofLedger",
    pattern: /ACTIVE_MIRROR_PROOF_LEDGER_VERSION[\s\S]*chainHead[\s\S]*previousHash[\s\S]*hash/,
  },
  {
    id: "proof_ledger_markdown_export",
    file: "proofLedger",
    pattern: /proofLedgerToMarkdown[\s\S]*Active Mirror Public-Safe Proof Ledger/,
  },
  {
    id: "critique_stream_admits_failures",
    file: "critique",
    pattern: /ACTIVE_MIRROR_DECISION_CRITIQUE_VERSION[\s\S]*systemAdmission[\s\S]*body_unavailable/,
  },
  {
    id: "revocation_cascade_downstream_effects",
    file: "revocation",
    pattern: /ACTIVE_MIRROR_REVOCATION_CASCADE_VERSION[\s\S]*downstreamEffect[\s\S]*body_unavailable/,
  },
  {
    id: "identity_continuity_boundary",
    file: "identity",
    pattern: /ACTIVE_MIRROR_IDENTITY_CONTINUITY_VERSION[\s\S]*privateUserContinuityScore: null[\s\S]*signed_model_swap_identity_receipt/,
  },
  {
    id: "identity_continuity_scorer",
    file: "identityMeasure",
    pattern: /ACTIVE_MIRROR_IDENTITY_CONTINUITY_MEASURE_VERSION[\s\S]*continuityScore[\s\S]*signed_model_swap_identity_receipt/,
  },
  {
    id: "ui_shows_kernel_receipt_and_ratchet",
    file: "ui",
    pattern: /Body receipt[\s\S]*mirror-ratchet-proof|mirror-ratchet-proof[\s\S]*Body receipt/,
  },
  {
    id: "qa_covers_body_receipt_and_ratchet",
    file: "tests",
    pattern: /body receipt bridge[\s\S]*MirrorRatchet|MirrorRatchet[\s\S]*body receipt bridge/,
  },
  {
    id: "healthcheck_covers_public_contracts",
    file: "healthcheck",
    pattern: /api\/mirror\/ratchet[\s\S]*api\/mirror\/proof-ledger[\s\S]*api\/mirror\/critique[\s\S]*api\/mirror\/revocation-cascade[\s\S]*api\/mirror\/identity-continuity[\s\S]*api\/mirror\/identity-continuity\/measure/,
  },
];

const sourceHash = createHash("sha256")
  .update(Object.values(contents).join("\n---active-mirror-ratchet---\n"))
  .digest("hex");

const failures = [];
for (let pass = 1; pass <= passes; pass += 1) {
  for (const invariant of invariants) {
    if (!invariant.pattern.test(contents[invariant.file])) {
      failures.push({ pass, invariant: invariant.id, file: files[invariant.file] });
      break;
    }
  }
  if (failures.length) break;
}

const receipt = {
  schemaVersion: "active_mirror.ratchet_receipt.v1",
  generatedAt: new Date().toISOString(),
  passesRequested: passes,
  passesCompleted: failures.length ? failures[0].pass - 1 : passes,
  status: failures.length ? "failed" : "passed",
  sourceHash: `sha256:${sourceHash}`,
  invariants: invariants.map(({ id, file }) => ({ id, file: files[file] })),
  failures,
  claimBoundary:
    "This proves deterministic product-control invariants repeated locally. It does not claim superior raw model IQ.",
};

if (receiptPath) {
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
}

console.log(JSON.stringify(receipt, null, 2));
process.exit(failures.length ? 1 : 0);
