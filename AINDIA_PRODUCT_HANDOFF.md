# AIndia — Product Spinout Handoff (for CC)

**Decision owner:** Paul. **Decided by:** Claude.ai. **Date:** 2026-06-13 (IST)

## The reframe
AIndia was an internal thinking surface. It is now a **product: Sovereign AI for India**.
The overlap with Chetana is resolved: **Chetana is the safety rail AIndia routes into.**
AIndia is the harness (ask → answer → source → gate → safe step → receipt). The model is replaceable; the harness is the product.

Wedge vs Sarvam / Krutrim / BharatGPT: they ship models. AIndia ships the **harness** —
consent-first, local-first, deterministic, receipted. Market the gate, not the slogan.

## Already done (copy, in AIndiaPage.tsx)
- Hero: "पूछो. आपकी भाषा में. / जवाब, source, aur ek safe agla kadam. / Sovereign AI for India."
- CheckHabitSection eyebrow → "Powered by Chetana"; headline reframed to the rail
- Final CTA: "Sovereign AI, aapke haath mein." / button "AIndia try karo" / route /intake?focus=aindia
- Killed the "AIndia Check" sub-brand and the "Build AIndia Check" / aindia-check route

## CC build tasks

### 1. Split product vs thesis (route)
Product page `/aindia` keeps ONLY: PhoneDemo (hero), CheckHabitSection (Chetana rail),
SovereignSection, ModeSection, ModelMatrixSection (answer-engine), StackSection, finalCta.
Move ALL of these to new route `/aindia/thesis` (internal, noindex):
SovereigntyTestSection, OptionSpaceSection, RecursionSection, FounderRelaySection,
OwnStarSection, FutureProofSection, RuntimeSection, WrapperRoadmapSection,
DeviceRailsSection, ContractsSection, DeterminismSection, HardeningSection, OpportunitySection.
FounderRelaySection: thesis/internal only — cut from the product page entirely.

### 2. Retokenize CSS (AIndiaPage.module.css — 2629 lines, all hardcoded hex)
Replace hardcoded hex with tokens. Distinct from Chetana (Chetana = alarm red/amber/green).
AIndia brand = sovereign gold + ink on warm paper. Drop these in :root (or a tokens module):

```css
:root {
  /* AIndia brand */
  --ain-ink: #1a1305;          /* near-black warm */
  --ain-paper: #f4efe4;        /* warm paper bg (replaces #e9ebf0) */
  --ain-paper-2: #ffffff;
  --ain-gold: #c79a3a;         /* primary accent (REPLACES #ff4e12) */
  --ain-gold-deep: #9a7320;
  --ain-muted: #6b6354;
  --ain-line: #e0d7c4;
  /* safety states live ONLY inside the Chetana rail, not brand-wide */
  --ain-safe: #2f7d4f;
  --ain-risky: #b3402b;
  --ain-verify: #b07d1a;
  /* type */
  --ain-display: "Instrument Serif", Georgia, serif;  /* headlines */
  --ain-body: var(--font-body);                        /* keep */
  --ain-mono: "Geist Mono", ui-monospace, monospace;   /* receipts/proof */
  /* radius/motion keep existing */
}
```
Action: replace `.brand span { color:#ff4e12 }` → `var(--ain-gold)`; `.page` bg `#e9ebf0` → `var(--ain-paper)`.
Headlines (h1/h2 in sectionHead, hero) → `font-family: var(--ain-display)`.
Receipt/hash lines → `var(--ain-mono)`. Sweep remaining hex → nearest token.

### 3. Rework the phone demo interaction
Currently the phone IS a checker (mic→checking, photo check, message check, safe/risky/verify).
That re-creates Chetana. New flow: ask (voice/photo/text) → AIndia answers in detected language →
shows a source chip → if the turn is risky, the Chetana rail fires (safe/risky/verify) →
ends on ONE next step + a proof line. Safe/risky/verify becomes a *conditional rail state*, not the default screen.

### 4. Two-tier proof component (AIndia's signature pattern)
Every answer ends with proof, progressively disclosed:
- Plain line (default, all users): "✓ Checked · kuch bahar nahi gaya"  [--ain-safe dot, body type]
- Tap to expand → technical receipt: local hash, route taken, gates passed  [--ain-mono]
Chetana never shows receipts; this is what visually + functionally separates the two products.

### 5. Chetana rail wiring
Define the contract: AIndia calls Chetana as a module/endpoint for risk classification.
Confirm Chetana exposes a check API (screenshot/message → safe|risky|verify + reason).
If not, that's a Chetana-side build before #3 is real. Until then the rail is copy-only — flag in UI.

### 6. Don't over-claim languages
Only render language pills for languages with working end-to-end ASR + output.
A dead Tamil voice button kills "Proof, not promises." Gate pills on real capability.

### 7. The product page must pass its own test
Thesis = cheap-device-first, sub-300ms local. So the marketing page itself must be light:
defer GSAP, keep DOM lean (the split in #1 already helps), no heavy hero on first paint.
The page proving the pitch IS the credibility.

## Voice spec (Hinglish — document so agents don't drift)
- Hindi script (Devanagari): emotional + command lines, hero, CTAs ("पूछो", "रुकिए")
- Roman Hindi: flow/connective words in mixed sentences ("poocho", "se pehle", "aapke haath mein")
- English: proper nouns, technical terms, source/receipt ("source", "receipt", "Sovereign AI")
- Never stack >2 register switches in one short line (the old hero broke this)
- "bharosa nahi — pehle milaiye" not "not enough bharosa" (countable-noun bug)

## Still unanswered (Paul to decide later, not blocking)
- Domain: aindia.activemirror.ai vs standalone? Confirm no generic "AI India" collision.
- Business model: free consumer / paid SME + institution is the implied shape — confirm before pricing copy.
- Distribution copy: PWA install prompt + Play Store listing not yet written.
- Compliance positioning: DPDP Act + RBI alignment is a moat — claim it on the SME/institution tier.
