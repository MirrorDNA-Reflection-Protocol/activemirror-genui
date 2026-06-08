---
id: SPEC-20260608-AMBR
title: Active Mirror Public Body Receipt Contract v1
type: runtime_contract
layer: public_genui
status: active
version: 0.1
---

# Active Mirror Public Body Receipt Contract v1

## Purpose

The public site may receive a sanitized body receipt from the private Active Mirror body. The receipt proves only that a public-safe sync packet was accepted. It never exposes raw topology, private files, local paths, vault memory, credentials, or device state, and it never grants private action authority.

## Public API

- `GET /api/mirror/body-receipt`: returns the current public-safe receipt summary, or `missing`.
- `POST /api/mirror/body-receipt`: accepts one sanitized receipt only when `MIRROR_BODY_RECEIPT_TOKEN` or `MIRROR_BODY_SYNC_TOKEN` is configured and supplied as a bearer token.

## Schema

```json
{
  "schemaVersion": "active_mirror.body_public_receipt.v1",
  "receiptId": "am-body-20260608T171438Z",
  "issuedAt": "2026-06-08T17:14:38Z",
  "expiresAt": "2026-06-08T17:29:38Z",
  "bodyState": "online",
  "sourceState": "public_safe_sync",
  "capabilityKernel": {
    "status": "compiled",
    "compiledAt": "2026-06-08T17:14:38Z",
    "skills": ["canonical-doctrine", "receipt-export"],
    "automationServices": ["body-sync"]
  },
  "continuity": {
    "status": "fresh",
    "snapshotAt": "2026-06-08T17:14:38Z"
  },
  "proof": {
    "didRun": ["body_public_sync"],
    "didNotRun": ["private_file_read", "vault_write"],
    "sourceGaps": [],
    "approvalsRequired": ["private_actions"]
  },
  "signature": {
    "algorithm": "ed25519",
    "keyId": "active-mirror-public-body-key",
    "payloadHash": "sha256:...",
    "chainHead": "sha256:...",
    "signature": "base64..."
  }
}
```

## Enforcement

- Receipts with private paths, known secret names, `.env` references, or API-key shaped values are rejected.
- Expired receipts stay visible as `expired`; they do not imply a fresh body.
- Ed25519 signatures are verified when `MIRROR_BODY_RECEIPT_PUBLIC_KEY` is configured. The public key may be PEM, base64 SPKI DER, or base64 raw 32-byte Ed25519 public key.
- A receipt with a signature is reported as `present_unverified` when no public key is configured, and `invalid_signature` when the configured key or payload hash does not verify.
- A receipt with only hash or chain fields is reported as `hash_only`.
- Missing or invalid receipts do not block public preview generation, but private/fresh actions remain `body_unavailable`.

## Publish Command

```bash
MIRROR_BODY_RECEIPT_TOKEN=... scripts/ops/publish-body-receipt.sh /path/to/public-safe-receipt.json
```

The receipt file must already be sanitized before publishing. Raw body files remain on the private body.
