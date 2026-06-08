export const ACTIVE_MIRROR_REVOCATION_CASCADE_VERSION = "2026.06.08-revocation-cascade-v1";

export type RevocationCascadeEvent = {
  sequence: number;
  revoke: string;
  downstreamEffect: string;
  state: "public_contract_ready" | "private_body_required";
  receiptRequired: string;
};

export type RevocationCascadeStatus = {
  version: typeof ACTIVE_MIRROR_REVOCATION_CASCADE_VERSION;
  mode: "public_safe_cascade_contract";
  claimBoundary: string;
  events: RevocationCascadeEvent[];
  coveredFailureClass: "revocation cascade opacity";
  privateEnforcement: "body_required";
};

export function getRevocationCascadeStatus(): RevocationCascadeStatus {
  return {
    version: ACTIVE_MIRROR_REVOCATION_CASCADE_VERSION,
    mode: "public_safe_cascade_contract",
    claimBoundary:
      "This route shows the revocation cascade contract. It does not claim private memory was revoked unless a private body receipt proves that run.",
    events: [
      {
        sequence: 0,
        revoke: "vault_memory.project_context",
        downstreamEffect: "Remove matching context from future task packets sent to frontier proposers.",
        state: "public_contract_ready",
        receiptRequired: "memory_revocation_receipt",
      },
      {
        sequence: 1,
        revoke: "source_permission.browser_lookup",
        downstreamEffect: "Mark current-world claims as source_gap until lookup is re-approved.",
        state: "public_contract_ready",
        receiptRequired: "source_permission_receipt",
      },
      {
        sequence: 2,
        revoke: "artifact_export.shared_pack",
        downstreamEffect: "Invalidate downstream export references and record a revocation child event in the proof ledger.",
        state: "public_contract_ready",
        receiptRequired: "artifact_revocation_receipt",
      },
      {
        sequence: 3,
        revoke: "private_body_receipt",
        downstreamEffect: "Return public kernel state to body_unavailable and block fresh private actions.",
        state: "private_body_required",
        receiptRequired: "body_receipt_revocation",
      },
    ],
    coveredFailureClass: "revocation cascade opacity",
    privateEnforcement: "body_required",
  };
}
