import decisionCritiqueStreamSchema from "../../../schemas/active-mirror-decision-critique-stream.schema.json";
import identityContinuityMeasureSchema from "../../../schemas/active-mirror-identity-continuity-measure.schema.json";
import proofLedgerExportSchema from "../../../schemas/active-mirror-proof-ledger-export.schema.json";
import revocationCascadeSchema from "../../../schemas/active-mirror-revocation-cascade.schema.json";

export const ACTIVE_MIRROR_CONTRACT_REGISTRY_VERSION = "2026.06.09-novelty-contract-registry-v1";

type JsonSchema = Record<string, unknown>;

export type MirrorRuntimeContract = {
  id: string;
  surface: string;
  route: string;
  schemaPath: string;
  schemaId: string;
  transport: "json" | "markdown" | "ndjson" | "json_post";
  status: "public_contract_ready" | "private_receipt_required";
  claimBoundary: string;
  schema: JsonSchema;
};

export type MirrorRuntimeContractRegistry = {
  version: typeof ACTIVE_MIRROR_CONTRACT_REGISTRY_VERSION;
  schemaVersion: "active_mirror.contract_registry.v1";
  generatedAt: string;
  claimBoundary: string;
  contracts: MirrorRuntimeContract[];
};

const contracts: Omit<MirrorRuntimeContract, "schemaId">[] = [
  {
    id: "proof_ledger_export",
    surface: "Receipt-chain export",
    route: "/api/mirror/proof-ledger",
    schemaPath: "schemas/active-mirror-proof-ledger-export.schema.json",
    transport: "json",
    status: "public_contract_ready",
    claimBoundary:
      "The ledger is public-safe and user-owned. It proves chain shape and public runtime state, not private body execution unless a signed body receipt exists.",
    schema: proofLedgerExportSchema as JsonSchema,
  },
  {
    id: "revocation_cascade",
    surface: "Revocation cascade",
    route: "/api/mirror/revocation-cascade",
    schemaPath: "schemas/active-mirror-revocation-cascade.schema.json",
    transport: "json",
    status: "public_contract_ready",
    claimBoundary:
      "The cascade contract shows downstream effects. Private memory, file, account, or body revocation still requires private enforcement receipts.",
    schema: revocationCascadeSchema as JsonSchema,
  },
  {
    id: "identity_continuity_measure",
    surface: "Continuity score",
    route: "/api/mirror/identity-continuity/measure",
    schemaPath: "schemas/active-mirror-identity-continuity-measure.schema.json",
    transport: "json_post",
    status: "private_receipt_required",
    claimBoundary:
      "The public route computes deterministic scores from supplied public-safe vectors. Private user identity continuity across model swaps requires a signed receipt.",
    schema: identityContinuityMeasureSchema as JsonSchema,
  },
  {
    id: "decision_critique_stream",
    surface: "Live decision/critique stream",
    route: "/api/mirror/critique?format=ndjson",
    schemaPath: "schemas/active-mirror-decision-critique-stream.schema.json",
    transport: "ndjson",
    status: "public_contract_ready",
    claimBoundary:
      "The public stream admits blocked, gated, missing, and queued system states. Private decisions require approved body receipts before promotion.",
    schema: decisionCritiqueStreamSchema as JsonSchema,
  },
];

export function getMirrorRuntimeContractRegistry(): MirrorRuntimeContractRegistry {
  return {
    version: ACTIVE_MIRROR_CONTRACT_REGISTRY_VERSION,
    schemaVersion: "active_mirror.contract_registry.v1",
    generatedAt: new Date().toISOString(),
    claimBoundary:
      "This registry publishes public-safe runtime contracts for design and integration. It does not expose private body files, credentials, vault memory, or account state.",
    contracts: contracts.map((contract) => ({
      ...contract,
      schemaId: String(contract.schema.$id),
    })),
  };
}
