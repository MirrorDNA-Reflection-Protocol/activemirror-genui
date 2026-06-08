---
id: SPEC-20260608-AMPC
title: Active Mirror Product Constitution v1
type: product_constitution
layer: public_genui
created: 2026-06-08T00:00:00Z
author: Paul Desai / Active Mirror
status: draft
version: 0.1
tags: [active-mirror, genui, constitution, provenance, skills, wrappers]
---

# Active Mirror Product Constitution v1

## Purpose

Active Mirror is not a chatbot. It is a governed reflective work OS that uses frontier models as proposing engines, then compiles user intent into working surfaces with proof, approvals, memory boundaries, exports, and next actions.

The product must feel like a mirror of the user and a compiler for useful work:

```txt
messy prompt -> reflection -> generated workspace -> proof line -> export -> next action
```

If the surface does not produce a useful workspace, artifact, proof state, or action path, it has failed even if the text sounds good.

## Product Laws

1. The user owns the goal.
2. The mirror reflects before it generates.
3. Generated surfaces beat generic answers.
4. Proof is visible by default.
5. Capability is not permission.
6. Memory is opt-in, scoped, and revocable.
7. Simulation is not execution.
8. Private body truth is never exposed raw.
9. A blocked route must still leave a useful safe artifact.
10. The smallest next action is part of every output.

## Killer Loop

### Step 1: Capture

The user should be able to arrive with a messy idea, pressure, half-formed prompt, file need, company name, or personal state.

### Step 2: Reflect

Active Mirror mirrors:

- goal
- audience
- urgency
- constraints
- missing inputs
- likely artifact
- proof or approval needs

Reflection should be short and human. Detail belongs in the generated surface.

### Step 3: Compile

The request routes into a specific workspace, not a generic response. Examples:

- Client Intake Workspace
- Research Browser Workspace
- Finish Mode Workspace
- Public-Sector Evidence Desk
- Automation Builder Workspace
- Site Audit Workspace
- Video Workbench
- Audio Workbench
- Governed GenUI Workbench

### Step 4: Prove

The proof line separates:

- ready now
- generated sample
- assumption
- source_gap
- approval_required
- body_unavailable
- did_not_run

### Step 5: Export

Every valuable output should offer an artifact:

- one-pager
- spec
- checklist
- evidence brief
- intake form
- demo scope
- handoff email
- receipt fields

### Step 6: Next Action

The next action must be narrow:

- use this artifact
- refine this section
- open source route
- request reviewed access
- download pack
- approve a gated route

## Signature Skills

Public V1 should expose a small set of signature skills. More skills can exist behind routing, but the public surface should not feel like a plugin catalog.

| Skill | Visible Surface | Output |
| --- | --- | --- |
| Build Me a Workspace | Client/workflow/app preview | form, spec, demo scope |
| Research or Prove | Research Browser Workspace | source route, assumptions, evidence brief |
| Finish Mode | Finish Mode Workspace | one artifact, parked ideas, next action |
| Client Intake Builder | Client Intake Workspace | goals, files, approvals, 72-hour scope |
| Evidence Brief | Evidence Desk | facts, assumptions, unknowns, reviewer path |
| Automation Studio | Automation Builder Workspace | trigger, checks, schedule, alert copy |
| Site Audit | Site Audit Workspace | checks, fix brief, monitor route |
| Public-Sector Review | Public-Sector Evidence Desk | procurement notes, consent, review gates |
| Translation/Localization | Language Workspace | bilingual draft, review gate |
| Media Workbench | Video/Audio Workbench | storyboard, script, render gate |
| Governed GenUI | Governed GenUI Workbench | doctrine, approvals, receipt packet |
| Vault Boot Packet | Memory/Storage Workspace | storage map, consent, export control |

## Wrapper Stack

Wrappers are the moat. Frontier models may draft content, but Active Mirror's wrappers determine what the product is.

| Wrapper | Job |
| --- | --- |
| Reflection Wrapper | Mirrors goal, constraints, user state, and likely artifact |
| Doctrine Wrapper | Applies Product Laws and harm boundary |
| Router Wrapper | Selects deterministic, model, tool, or reviewed route |
| Surface Wrapper | Converts request into a rendered workspace |
| Provenance Wrapper | Separates facts, estimates, assumptions, unknowns |
| Consent Wrapper | Blocks files, accounts, devices, sends, and vault writes |
| Memory Wrapper | Chooses session, browser cache, KV, vault, or body state |
| Export Wrapper | Packages one useful artifact |
| Receipt Wrapper | Records source, route, approval, export, and did_not_run |
| Trust Recovery Wrapper | Explains stale, blocked, failed, or unavailable states |
| Cost Wrapper | Chooses the smallest model/tool route that can finish |
| Voice Wrapper | Removes generic SaaS copy and makes the output direct |

## Local Supervisor Over Frontier Models

Active Mirror should treat the local layer as the governor and the frontier model as a proposer.

The strongest architecture is:

```txt
user prompt
-> deterministic local supervisor
-> optional local model advisory classifier
-> context/redaction envelope
-> frontier model proposal
-> local verifier and scrubber
-> generated surface, proof line, export, receipt
```

The local supervisor is 100% controlled code and policy. It owns:

- intent route
- context allowed into the model
- private-source redaction
- tool permissions
- storage/memory route
- approval gates
- provenance requirements
- output verification
- receipt state

The optional local model is not sovereign. It may classify risk, tone, route hints, or missing gates at deterministic settings, but it cannot grant permissions, promote facts, execute tools, or override doctrine.

The frontier model is `proposer_only`. It may draft, transform, synthesize, and generate UI content inside the envelope selected by the local supervisor. If frontier output conflicts with policy, source state, approvals, or private boundaries, the local verifier blocks or downscopes it before render.

| Layer | Controlled By | Allowed To Do | Not Allowed To Do |
| --- | --- | --- | --- |
| Deterministic supervisor | Active Mirror code/contracts | route, redact, gate, verify, receipt | invent content |
| Local model advisory | Local runtime | classify and suggest | grant permission or facts |
| Frontier model | OpenAI/other frontier API | propose surfaces and drafts | execute, remember, approve, or override |
| Tool/runtime layer | Active Mirror governed routes | execute approved actions | run without scoped approval |

## Memory Boundaries

| Store | Default | What It Can Keep | Gate |
| --- | --- | --- | --- |
| Browser session | on | prompt draft, UI state, recent surface | local only |
| Browser cache | optional | replayable public-safe surfaces | user/local reset |
| KV cache | optional | receipt ids, public-safe packets | public-safe only |
| Vault memory | off | private continuity and files | opt-in and revocable |
| Body lattice | private | runtime truth, skills, topology | never raw public |
| Receipts | required when durable | source, route, approval, export state | sensitivity split |

## Proof Rules

- Do not claim a lookup ran unless it ran.
- Do not claim files exist unless generated or approved.
- Do not turn generated signal scores into evidence.
- Source routes are not sources.
- Facts require source or user-provided proof.
- Estimates must be labeled as estimates.
- Unknowns should be visible and useful.
- A blocked route should explain the smallest safe continuation.

## Trust Recovery

Active Mirror should recover trust explicitly when:

- the model is slow
- a route is rate-limited
- the private body is offline
- sources were not opened
- a prompt is too broad
- a generated surface is generic
- a request hits safety, privacy, legal, or cost boundaries

Recovery format:

```txt
What happened.
What did not run.
What is still useful.
Smallest next action.
```

## Commercial Packaging

| Tier | Promise | Boundaries |
| --- | --- | --- |
| Public Preview | Generate useful surfaces and artifacts | no private files, live sends, or vault memory |
| Personal Vault | Continuity, local memory, exports | opt-in, revocable, receipt-backed |
| Team Workspace | shared workflows, approvals, admin roles | scoped data and audit logs |
| Enterprise/Government | governance, procurement, proof, review gates | legal/security review and role boundaries |
| 72-Hour Demo | scoped working demo from a generated spec | starts after scope and gates are confirmed |

## Hero Use Cases

### Primary Hero

```txt
Build me a client intake workspace that turns a messy customer request into goals, files, approvals, a 72-hour demo scope, and an exportable handoff pack.
```

Reason: it shows reflection, generated UI, files, approvals, proof, export, and conversion without relying on external facts.

### Secondary Hero

```txt
Prepare a GCC digital identity evidence brief with source routes, facts, assumptions, unknowns, procurement risks, and reviewer-ready next steps.
```

Reason: it shows governance and provenance, but it must not use fake scoring or unsourced claims.

## Evaluation Gates

Every release should answer yes/no:

- Does the first useful surface appear before explanation?
- Does a build prompt create a concrete builder, not the official demo?
- Does a research prompt label source routes as unverified until opened?
- Does a scattered/focus prompt produce one artifact and parked ideas?
- Does public-sector evidence avoid fake scores?
- Does every output show proof and gated actions?
- Are private paths absent?
- Are generated artifacts downloadable?
- Does mobile feel purpose-built?
- Does the voice sound direct, reflective, and non-generic?

## Non-Goals

- Do not become a plugin directory.
- Do not compete on model cleverness alone.
- Do not expose internal topology or raw private doctrine.
- Do not generate fake proof.
- Do not let paid-access forms appear before useful output.
- Do not make every prompt look like the same workspace.

## Implementation Plan

1. Add first-class route profiles for client intake, finish mode, and public-sector evidence.
2. Replace fake generated planning scores with evidence matrices for high-stakes proof prompts.
3. Keep the public front door compact and device-specific.
4. Add regression tests for the hero loop and secondary evidence loop.
5. Use this constitution as the runtime and release-review contract for public GenUI changes.

## Changelog

- 2026-06-08: Initial constitution draft.
