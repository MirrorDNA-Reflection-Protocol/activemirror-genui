# AIndia Hardening Notes

Date: 2026-06-12

## Threat Surface

AIndia handles high-risk user inputs: voice, photos, screenshots, WhatsApp/SMS text, documents, source queries, and future actions. The sensitive assets are user files, local receipts, identity/payment data, model routing decisions, provider uploads, native OS capabilities, and consent records.

## Invariants

- Unknown device/model capability fails closed.
- Unknown hooks and unknown gates fail closed.
- Local-only data cannot be uploaded or referenced through provider storage.
- Provider routes require purpose, data classes, explicit user approval, and receipt.
- Money, identity, account, document, device, child, and action flows require human approval before execution.
- Payload references cannot use `javascript:`, `data:`, `http:`, or `https:` schemes inside runtime envelopes.
- High-risk checks should produce local receipts or explicitly include the `receipt_written` gate.
- Native wrappers expose capability only; they do not bypass the harness.

## Implemented Controls

- `src/lib/aindia/hardening.ts`
  - Runtime envelope validator.
  - Fail-closed control catalog.
  - Consent and payload scheme checks.
- `/api/aindia/wrappers`
  - Valid sample envelope plus validation output.
  - Intentionally blocked sample envelope plus block reasons.
- `public/sw.js`
  - Same-origin only.
  - Fixed shell cache only.
  - Network-first navigation with `/aindia` fallback.
- `next.config.ts`
  - `nosniff`, frame deny, same-origin resource/opener policy, origin-agent cluster, DNS prefetch off, restricted permissions policy, and stricter CSP report-only directives.
- Native stubs
  - Android and iOS bridges reject contradictory consent, unsafe payload schemes, provider storage without upload approval, and add receipt gates for non-normal risk classes.

## Still Needed

- POST endpoint for native wrapper submissions that calls `validateAIndiaRuntimeEnvelope` before accepting any result.
- Signed local receipts for high-risk checks.
- Capability probe implementations on Android and iOS.
- Provider adapter allowlist with per-provider data-class and retention policy.
- DPDP consent ledger with withdrawal state and purpose limitation.

