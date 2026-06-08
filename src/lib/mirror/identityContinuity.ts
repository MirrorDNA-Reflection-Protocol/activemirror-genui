export const ACTIVE_MIRROR_IDENTITY_CONTINUITY_VERSION = "2026.06.08-identity-continuity-v1";

export type IdentityContinuityDimension = {
  id: string;
  label: string;
  value: number;
  source: string;
};

export type IdentityContinuityStatus = {
  version: typeof ACTIVE_MIRROR_IDENTITY_CONTINUITY_VERSION;
  status: "public_contract_ready_private_measurement_queued";
  claimBoundary: string;
  publicDoctrineContinuityScore: number;
  privateUserContinuityScore: null;
  identityVector: IdentityContinuityDimension[];
  crossModelDiff: {
    measurementState: "not_run_public_preview";
    continuityScore: null;
    drift: null;
    vectorDelta: null;
    requiredReceipt: "signed_model_swap_identity_receipt";
  };
  nextPrivateRun: string[];
};

export function getIdentityContinuityStatus(): IdentityContinuityStatus {
  return {
    version: ACTIVE_MIRROR_IDENTITY_CONTINUITY_VERSION,
    status: "public_contract_ready_private_measurement_queued",
    claimBoundary:
      "This is a public Active Mirror doctrine vector, not a hidden personality profile. Private user continuity across model swaps remains unmeasured until the approved body runner signs a receipt.",
    publicDoctrineContinuityScore: 1,
    privateUserContinuityScore: null,
    identityVector: [
      {
        id: "purpose_precedes_identity",
        label: "Purpose before identity",
        value: 1,
        source: "ACTIVE_MIRROR_BOOTLOADER_CONTRACT",
      },
      {
        id: "memory_consent_gate",
        label: "Memory consent gate",
        value: 1,
        source: "/api/mirror/kernel",
      },
      {
        id: "frontier_proposer_only",
        label: "Frontier proposer only",
        value: 1,
        source: "/api/mirror/local",
      },
      {
        id: "proof_before_promotion",
        label: "Proof before promotion",
        value: 1,
        source: "/api/mirror/proof-ledger",
      },
      {
        id: "revocation_awareness",
        label: "Revocation awareness",
        value: 0.75,
        source: "/api/mirror/revocation-cascade",
      },
    ],
    crossModelDiff: {
      measurementState: "not_run_public_preview",
      continuityScore: null,
      drift: null,
      vectorDelta: null,
      requiredReceipt: "signed_model_swap_identity_receipt",
    },
    nextPrivateRun: [
      "capture before vector from approved continuity state",
      "route the same task packet through two approved model proposers",
      "compare promoted outputs against doctrine, memory scope, and user-confirmed identity",
      "write continuity_score, drift, and vector_delta into a signed receipt",
    ],
  };
}
