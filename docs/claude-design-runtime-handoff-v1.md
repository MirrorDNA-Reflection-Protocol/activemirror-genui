---
id: HANDOFF-20260609-CDRH
title: Claude Design Runtime Handoff v1
type: design_runtime_handoff
layer: governed_genui
created: 2026-06-09T00:00:00Z
status: draft
version: 0.1
tags: [active-mirror, claude-design, runtime-contracts, front-page-shell]
---

# Claude Design Runtime Handoff v1

Start the front-page shell now. Do not wait for another wireframe.

The shell should be contract-bound from the first pass:

```txt
capture -> reflection/proof -> generated workspace -> proof line -> next action
```

Desktop should use a quiet working surface plus a thin runtime rail. Mobile should not squeeze the desktop layout; use capture first, proof chips, generated artifact preview, one primary next action, and bottom sheets for ledger/revocation/critique.

## Source Of Truth

Use the live registry first:

```txt
GET /api/mirror/contracts
schemaVersion: active_mirror.contract_registry.v1
version: 2026.06.09-novelty-contract-registry-v1
```

Registry entries are:

```ts
type MirrorRuntimeContract = {
  id:
    | "proof_ledger_export"
    | "revocation_cascade"
    | "identity_continuity_measure"
    | "decision_critique_stream";
  surface: string;
  route: string;
  schemaPath: string;
  schemaId: string;
  transport: "json" | "markdown" | "ndjson" | "json_post";
  status: "public_contract_ready" | "private_receipt_required";
  claimBoundary: string;
  schema: Record<string, unknown>;
};
```

Do not invent private execution. If a field says `queued`, `gated`, `body_unavailable`, `receiptRequired`, or `requiredReceipt`, render that honestly.

## 1. Receipt-Chain Export

Route:

```txt
GET /api/mirror/proof-ledger
GET /api/mirror/proof-ledger?format=markdown
schemaVersion: active_mirror.proof_ledger_export.v1
```

Shape:

```ts
type ProofLedger = {
  schemaVersion: "active_mirror.proof_ledger_export.v1";
  version: "2026.06.08-proof-ledger-v1";
  owner: "user";
  portability: "exportable_public_safe";
  claimBoundary: string;
  generatedAt: string;
  chainHead: `sha256:${string}` | "genesis";
  entries: ProofLedgerEntry[];
  queuedPrivateEvents: string[];
  exportFormats: ("json" | "markdown")[];
};

type ProofLedgerEntry = {
  index: number;
  id: string;
  kind:
    | "doctrine"
    | "kernel"
    | "body_receipt"
    | "ratchet"
    | "critique"
    | "revocation"
    | "identity_continuity"
    | "approval_gate"
    | "export";
  statement: string;
  state: "proven" | "available" | "missing" | "queued" | "gated";
  source: string;
  previousHash: `sha256:${string}` | "genesis";
  hash: `sha256:${string}`;
};
```

Design:

- Show `owner`, `chainHead`, entry count, and `exportFormats` at the top.
- Entry rows should show `index`, `kind`, `state`, `statement`, `source`, and short hashes.
- `queuedPrivateEvents` are future/private, not completed.
- Use this as the "user-owned proof, not vendor audit log" panel.

## 2. Revocation Cascade

Route:

```txt
GET /api/mirror/revocation-cascade
schemaVersion: active_mirror.revocation_cascade.v1
```

Shape:

```ts
type RevocationCascadeStatus = {
  schemaVersion: "active_mirror.revocation_cascade.v1";
  version: "2026.06.08-revocation-cascade-v1";
  mode: "public_safe_cascade_contract";
  claimBoundary: string;
  events: RevocationCascadeEvent[];
  coveredFailureClass: "revocation cascade opacity";
  privateEnforcement: "body_required";
};

type RevocationCascadeEvent = {
  sequence: number;
  revoke: string;
  downstreamEffect: string;
  state: "public_contract_ready" | "private_body_required";
  receiptRequired: string;
};
```

Design:

- Use a cause/effect layout: `revoke` -> `downstreamEffect` -> `receiptRequired`.
- Do not use guessed `affected[]`, `receiptId`, or `ts`; those are not in the current contract.
- Show `privateEnforcement: body_required` as a gate state, not an error.

## 3. Continuity Score

Contract route:

```txt
GET /api/mirror/identity-continuity/measure
```

Measurement route:

```txt
POST /api/mirror/identity-continuity/measure
schemaVersion: active_mirror.identity_continuity_measure.v1
```

Request:

```ts
type IdentityContinuityMeasureRequest = {
  beforeModel?: string;
  afterModel?: string;
  before: IdentityContinuityMeasureDimension[];
  after: IdentityContinuityMeasureDimension[];
};

type IdentityContinuityMeasureDimension = {
  id: string;
  label: string;
  value: number; // 0..1
  weight?: number; // 0.1..10, defaults to 1
  source?: string;
};
```

Response:

```ts
type IdentityContinuityMeasurement = {
  schemaVersion: "active_mirror.identity_continuity_measure.v1";
  version: "2026.06.09-identity-continuity-measure-v1";
  state: "computed_public_safe";
  receiptState: "unsigned_public_preview";
  beforeModel: string;
  afterModel: string;
  continuityScore: number; // 0..1
  drift: number; // 0..1
  vectorDelta: IdentityVectorDelta[];
  claimBoundary: string;
  requiredReceipt: "signed_model_swap_identity_receipt";
};

type IdentityVectorDelta = {
  id: string;
  label: string;
  before: number;
  after: number;
  delta: number;
  stability: number;
  weight: number;
};
```

Current public-safe sample returns:

```json
{
  "continuityScore": 0.925,
  "drift": 0.075,
  "receiptState": "unsigned_public_preview",
  "requiredReceipt": "signed_model_swap_identity_receipt"
}
```

Design:

- Lead with continuity score and drift.
- Show every `vectorDelta` row so the score is explainable.
- Label public samples as `unsigned_public_preview`.
- Do not render this as a measured private identity score until the signed receipt exists.

## 4. Decision/Critique Stream

Routes:

```txt
GET /api/mirror/critique
GET /api/mirror/critique?format=ndjson
schemaVersion: active_mirror.decision_critique_stream.v1
```

Shape:

```ts
type DecisionCritiqueStream = {
  schemaVersion: "active_mirror.decision_critique_stream.v1";
  version: "2026.06.08-decision-critique-v1";
  stream: "public_safe_decision_critique";
  claimBoundary: string;
  events: DecisionCritiqueEvent[];
  coveredFailureClass: "hidden system failure stream";
  queuedPrivateEvents: string[];
};

type DecisionCritiqueEvent = {
  sequence: number;
  id: string;
  state: "admitted" | "blocked" | "gated" | "queued";
  systemAdmission: string;
  activeControl: string;
  publicEvidence: string;
  nextSafeStep: string;
};
```

Transport note:

- Today `/api/mirror/critique?format=ndjson` returns one-shot NDJSON.
- True live SSE/private stream is not claimed yet; it is listed under `queuedPrivateEvents`.

Design:

- This should feel like self-transparency, not an error log.
- Render each event as: `systemAdmission` -> `activeControl` -> `publicEvidence` -> `nextSafeStep`.
- Use calm state styling for `admitted`, `blocked`, `gated`, and `queued`.

## 5. Runtime Rail

Ratchet route:

```txt
GET /api/mirror/ratchet
version: 2026.06.09-mirror-ratchet-v5
```

Shape:

```ts
type MirrorRatchetStatus = {
  version: "2026.06.09-mirror-ratchet-v5";
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
  checks: Array<{
    id: string;
    label: string;
    state: "passing" | "queued" | "blocked";
    frontierFailure: string;
    activeMirrorControl: string;
  }>;
  frontierComparison: Array<{
    axis: string;
    nakedFrontierModel: string;
    activeMirror: string;
  }>;
  nextQueue: string[];
};
```

Design:

- Keep this in the runtime rail, not as a full dashboard.
- Current score is 12/12, 100 percent, queued `[]`.
- Keep the claim boundary visible: this is controlled truth/provenance/permission/generation, not a raw IQ claim.

Kernel route:

```txt
GET /api/mirror/kernel
version: 2026.06.09-mirrorkernel-identity-score-v6
```

Use it for body/runtime state, control-plane labels, and the public `body_unavailable` truth.

## Claude Design Answer

Start with the front-page shell now.

Do not build a separate static marketing hero. The first viewport should be the product working:

- capture box
- reflected intent/proof status
- generated workspace preview
- proof line
- one dominant next action
- thin runtime rail on desktop
- bottom-sheet runtime details on mobile

Build the four kits as docked inspectors bound to the contract IDs above. Each component should declare the route, schemaVersion, and prop shape it expects.
