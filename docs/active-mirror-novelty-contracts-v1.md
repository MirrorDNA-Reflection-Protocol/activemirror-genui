---
id: SPEC-20260609-AMNC
title: Active Mirror Novelty Runtime Contracts v1
type: runtime_contracts
layer: governed_genui
created: 2026-06-09T00:00:00Z
status: draft
version: 0.1
tags: [active-mirror, contracts, provenance, revocation, continuity, critique]
---

# Active Mirror Novelty Runtime Contracts v1

This is the design-to-runtime bind for the four surfaces that differentiate Active Mirror from a generic frontier-model chat UI.

The public registry is:

```txt
GET /api/mirror/contracts
```

It returns the public-safe contract registry plus the embedded JSON Schema for each surface. These schemas are the shapes Claude Design, generated UI kits, and downstream integrations should bind to first.

## Contract Set

| Surface | Contract ID | Runtime route | Schema |
| --- | --- | --- | --- |
| Receipt-chain export | `proof_ledger_export` | `/api/mirror/proof-ledger` | `schemas/active-mirror-proof-ledger-export.schema.json` |
| Revocation cascade | `revocation_cascade` | `/api/mirror/revocation-cascade` | `schemas/active-mirror-revocation-cascade.schema.json` |
| Continuity score | `identity_continuity_measure` | `/api/mirror/identity-continuity/measure` | `schemas/active-mirror-identity-continuity-measure.schema.json` |
| Live decision/critique stream | `decision_critique_stream` | `/api/mirror/critique?format=ndjson` | `schemas/active-mirror-decision-critique-stream.schema.json` |

## Claim Boundary

These are public-safe contracts. They prove the runtime shape and visible controls. They do not claim private body execution, private memory revocation, or measured private user identity continuity unless a signed private/body receipt is present.

## Design Binding Rules

- Use `schemaVersion` as the primary compatibility key.
- Render `claimBoundary` visibly when a surface could be mistaken for private execution.
- Treat `requiredReceipt` and `receiptRequired` as gate labels, not decorative text.
- Never turn `queuedPrivateEvents` into completed action language.
- For continuity, show public preview scores as unsigned until `signed_model_swap_identity_receipt` exists.
- For critique, render `systemAdmission`, `activeControl`, and `nextSafeStep` together so failure confession has a recovery path.

## Layer-0 Gates

The following commands enforce the contract layer:

```bash
npm run ratchet:1000
npm run ops:health -- https://activemirror.ai
npm run ops:browser-canary -- https://activemirror.ai
```

The browser canary verifies rendered MirrorKernel/Ratchet proof panels, no private path leakage, and active service-worker control.
