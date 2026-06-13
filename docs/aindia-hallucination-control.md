# AIndia Hallucination Control

Date: 2026-06-12

## Rule

Do not make shit up.

In product terms:

```text
No source, no factual claim.
No consent, no relay.
No receipt, no high-risk advice.
No current data, no "latest" answer.
No future certainty, only labeled scenario assumptions.
```

## Claim Classes

| Class | Allowed wording | Required proof |
|---|---|---|
| Current fact | "According to source X..." | URL, source pack, or local document receipt |
| User-provided fact | "You said..." | Current session text or receipt |
| Product doctrine | "AIndia's rule is..." | Versioned doctrine file or API contract |
| Risk warning | "Pause / verify / do not act yet" | Deterministic risk rule |
| Future view | "If this happens..." | Labeled scenario assumption, not prediction |
| Unknown | "I do not know yet" | No source required |

## Runtime Gates

1. Classify every answer as sourced, user-provided, doctrine, risk, assumption, or unknown.
2. For high-stakes domains, require source grounding or refuse certainty.
3. For current facts, check freshness before answering.
4. For future claims, label them as scenario assumptions.
5. For relay to Paul, never impersonate him and never send silently.
6. For India-specific public-service answers, prefer source packs and cite them.
7. For low-confidence answers, ask one clarifying question or give a safe next step.

Implemented guard:

- `src/lib/aindia/claimGuard.ts`
- `/api/aindia/claim-guard`

The guard blocks:

- absolute reliability claims
- unsupported statistics
- unsupported current/latest/date-specific claims
- future certainty phrased as fact
- simulated Paul/founder claims
- product-state claims without build/test/API receipt

## Founder Relay Boundary

The relay may say:

- "Here is the AIndia view."
- "Here is one next step."
- "I can prepare a note for Paul if you choose."

The relay must not say:

- "Paul thinks..."
- "Paul will..."
- "This is guaranteed."
- "This is official government advice."
- "Your data was sent" unless the user explicitly sent it.

## Product Copy Boundary

Use:

- source-bounded
- assumption-labeled
- verified when possible
- unverified when not
- trust by design

Avoid:

- hallucination-free as an absolute guarantee
- bulletproof as an absolute guarantee
- sovereign as a branding claim without gates
- "all Indians" or "most Indians" without sourced numbers

## Fail-Safe Answer

When unsure:

```text
I do not know enough to answer that as fact. I can give a safe next step, or I can check a source before answering.
```
