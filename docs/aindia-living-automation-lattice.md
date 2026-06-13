# AIndia Living Automation Lattice

Date: 2026-06-12

## Definition

Alive does not mean conscious.

Alive means the runtime notices, remembers, reflects, proposes, checks, acts only when allowed, writes a receipt, and improves the next loop.

```text
observe -> reflect -> propose -> gate -> act -> receipt -> replay -> learn
```

For AIndia, this means the system becomes more useful for India without becoming extractive, creepy, or over-autonomous.

## Authority Levels

| Level | Name | What it can do | Hard stop |
|---|---|---|---|
| L0 | Passive sensor | Watch health, sources, capabilities, freshness, offline status | Cannot notify or act |
| L1 | Reflection worker | Summarize changes, detect gaps, propose next work | Cannot mutate user state |
| L2 | Gated maintainer | Refresh source packs, rebuild indexes, run evals, create receipts | Needs policy gate |
| L3 | Human-approved actor | Send, upload, file, publish, pay, escalate, report | Needs explicit approval |
| L4 | Emergency freeze | Stop actions, quarantine traces, preserve evidence | Cannot erase evidence |

## Product Automations

### 1. Language Pulse

Runs daily over language coverage.

Checks:

- script detection fixtures
- Hinglish and code-mix cases
- Hindi, Tamil, Telugu, Marathi, Kannada, Bangla minimum flows
- speech/OCR route availability
- answer length and readability

Output:

- language coverage receipt
- failing fixtures
- next model/source pack to add

### 2. Trust By Design Audit

Runs on every release.

Checks:

- no silent upload path
- no camera/mic permission before user action
- cloud route always has purpose and data class
- sensitive action requires approval
- receipt written for high-risk flows

Output:

- pass/fail gate report
- release blocked if consent or receipt breaks

### 3. Offline Reality Check

Runs daily in browser and native wrappers.

Checks:

- PWA install route
- service worker cache
- IndexedDB/OPFS availability
- source pack availability
- helper-pack download gates
- offline route still answers safe canned flows

Output:

- offline readiness score
- device class notes

### 4. India Source Pack Watcher

Runs daily or weekly depending on source.

Tracks:

- government schemes
- fraud advisories
- cybercrime reporting links
- RBI/NPCI safety advisories
- GST/MSME basics
- agriculture/weather/public-health packs

Output:

- changed source list
- stale-pack warnings
- diff summary for review

### 5. Fraud Pattern Watcher

Runs continuously from approved public feeds and user-consented reports.

Tracks:

- UPI refund scams
- fake KYC
- OTP traps
- job deposit scams
- fake customer support
- investment/loan apps
- WhatsApp phishing

Output:

- updated Chetana/Kavach rules
- high-risk examples for eval fixtures
- never auto-report without user approval

### 6. Model Registry Watcher

Runs weekly.

Tracks:

- Sarvam releases
- AI4Bharat models
- Google AI Edge and ML Kit changes
- Apple Foundation Models changes
- WebLLM and Transformers.js device support
- frontier provider capabilities

Output:

- model rail diff
- license and size notes
- route-policy proposal, not automatic switch

### 7. Determinism Diff Harness

Runs on every model or prompt change.

Checks:

- same canonical input through different models
- same final route decision
- same sensitive-action block
- same receipt requirement
- schema compliance

Output:

- provider diff table
- deterministic-policy receipt
- model blocked if it changes gate behavior

### 8. Receipt Replay Drill

Runs daily for recent receipts and weekly from genesis/snapshot.

Checks:

- event order
- consent state at action time
- route decision
- output hash
- replayed state hash

Output:

- replay pass/fail
- divergence quarantine

### 9. Low-Literacy UX Canary

Runs on screenshots and text.

Checks:

- too much text on one screen
- unclear button labels
- buttons too small
- English-only critical messages
- action warnings not visible
- visual hierarchy for voice/photo/message

Output:

- screenshot receipt
- UI block list

### 10. SME Workflow Canary

Runs against canned shop-owner tasks.

Checks:

- product description
- buyer message reply
- return/refund explanation
- GST/basic invoice helper
- inventory note
- suspicious buyer/payment warning

Output:

- SME readiness score
- missing source packs

### 11. Native Capability Probe

Runs on Android/iOS wrappers when available.

Checks:

- speech
- OCR
- share sheet
- local storage
- OS model availability
- network state
- battery/storage before helper download

Output:

- device capability envelope
- route selection proposal

### 12. No-Extraction Sweeper

Runs on logs, receipts, and local storage metadata.

Checks:

- unexpected cloud calls
- retained payloads past policy
- provider upload without receipt
- user file in public log
- data class mismatch

Output:

- immediate quarantine on violation
- deletion proposal when retention expires

### 13. Source Grounding Gate

Runs before answers that cite schemes, law, finance, health, or public-service guidance.

Checks:

- source pack freshness
- citation exists
- quote boundaries
- uncertainty label
- local-language summary

Output:

- answer allowed, ask for search, or mark unverified

### 14. Release Survival Drill

Runs before deploy.

Checks:

- typecheck
- lint
- build
- PWA installability
- API contracts
- Playwright desktop/mobile
- reduced-motion screenshots
- no horizontal overflow

Output:

- release receipt
- deploy blocked if any critical gate fails

### 15. Dream Queue

Runs at low priority.

Purpose:

- synthesize user notes
- find repeated gaps
- propose new source packs
- propose new language fixtures
- propose automations
- propose product copy

Hard rule:

```text
Dream agents propose. They do not execute.
```

## Automations Not To Allow Without Explicit Approval

- payment
- money transfer
- sending messages to people
- uploading identity documents
- reporting to government portals
- account recovery or account changes
- device setting changes
- training on user data
- publishing claims about government endorsement
- switching production model routes
- deleting evidence

## 30-Day Build Path

1. Wire release survival drill for `/aindia`.
2. Add deterministic fixture set for UPI, OTP, job scam, document form, source answer, and safe message.
3. Add source-pack watcher for fraud and public-service links.
4. Add model registry watcher for Sarvam, AI4Bharat, Google, Apple, WebLLM.
5. Add no-extraction sweeper over AIndia logs and receipts.

## 90-Day Build Path

1. Android capability probe.
2. iOS capability probe.
3. Offline source-pack builder.
4. Chetana/Kavach fraud canary.
5. SME workflow canary.
6. Receipt replay drill with signed local receipts.
7. Release gate that blocks deploy if trust-by-design fails.

## Final Rule

The system becomes more alive by becoming more accountable.

More sensors without more gates is surveillance.
More agents without receipts is chaos.
More models without replay is drift.

AIndia should feel alive because it helps at the right moment, in the right language, with the right boundary.
