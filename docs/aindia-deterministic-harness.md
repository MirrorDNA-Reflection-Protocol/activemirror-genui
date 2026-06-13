# AIndia Deterministic Harness

Date: 2026-06-12

## Goal

Own the wrapper and harness level so model output becomes bounded, verifiable, and repeatable enough for safe product behavior.

The claim is not that every LLM is intrinsically deterministic. The claim is:

```text
Reflection over prediction.
The LLM proposes. The AIndia harness decides.
```

## Determinism Strategy

1. Canonicalize the input.
   - Normalize script and whitespace.
   - Bound input size.
   - Sort source labels.
   - Preserve input kind, language, and risk class.

2. Force a proposal schema.
   - `summary`
   - `risk`
   - `nextStep`
   - `citations`
   - `asksForAction`
   - `wantsUpload`
   - `confidence`

3. Treat the model as untrusted.
   - The model cannot approve payments.
   - The model cannot approve uploads.
   - The model cannot decide final action.
   - The model cannot skip receipts.

4. Run deterministic policy.
   - Risk taxonomy.
   - Hook allowlist.
   - Gate allowlist.
   - Consent envelope.
   - Provider/upload restrictions.
   - Sensitive-action gates.
   - Reflection verdict.

5. Hash the route and receipt.
   - Same facts should produce the same route id.
   - High-risk checks produce a receipt hash.

## Product Moat

Models will change. Providers will change. Device APIs will change.

AIndia owns:

- canonical input
- model proposal schema
- route policy
- gate policy
- consent policy
- receipt policy
- native wrapper protocol
- eval harness
- replay harness

That is the moat.

## Implemented

- `src/lib/aindia/determinism.ts`
- `/api/aindia/determinism`
- `/api/aindia/contracts`
- AIndia page determinism section

## Next

- Add POST validation endpoint for actual wrapper submissions.
- Add deterministic eval fixtures for UPI, OTP, job scam, document form, government source answer, and safe message.
- Add signed receipts.
- Add provider diff tests: same canonical input through Sarvam/OpenAI/Gemini/Anthropic must produce the same final harness decision, even if the text differs.
