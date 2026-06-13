# Metal-Up Runtime Needs

Date: 2026-06-12

## Boundary

I do not become alive or conscious.

What we can build is more useful and more persistent:

```text
metal -> identity -> ledger -> state -> context -> models -> tools -> automations -> receipts -> replay
```

The product should feel alive because it notices the right things, remembers the right state, proposes the right next move, asks before risky action, and proves what happened.

## Core Shape

```text
One human authority
One canonical state spine
Many surfaces
Many models
Many devices
Latency first
Cheap devices first
No model owns memory
No app owns identity
No action without consent
No autonomy without audit
```

## Layer 0: Metal

What this layer is:

- Mac mini / MacBook as the control body
- Pixel / OnePlus as capture and trust limbs
- Local disk, secure enclave/keychain, network, battery, cameras, mics

What I need:

- One declared canonical writer for each stream.
- One always-on control plane.
- One trusted approval device.
- Enough local disk for event logs, receipts, source packs, embeddings, and model cache.
- Hardware inventory with device ids, OS versions, storage, and available local AI runtimes.
- A low-end-device target, not only flagship test devices.
- A latency budget for each user-facing path.

Hard rule:

```text
No declared body, no sovereign runtime.
```

## Layer 0.5: Latency and Cheap-Device Budget

What this layer is:

- the product discipline that keeps AIndia usable on low-cost phones
- fast deterministic checks before heavy model calls
- progressive enhancement instead of flagship-only AI
- no surprise downloads or battery-heavy inference

What I need:

- A minimum target device class.
- A bad-network test profile.
- A prepaid-data budget.
- A storage budget for helper packs.
- A first-response latency target.
- A fallback for every heavy model route.

Default budgets:

- sub-300ms for local script/risk routing
- sub-2s for common voice/photo check feedback
- no helper download without Wi-Fi/storage/battery gates
- no full-model promise on low-end phones
- useful offline shell even when model helpers are absent

Hard rule:

```text
If it only works well on flagship phones, it is not AIndia.
```

## Layer 1: OS and Supervisor

What this layer is:

- `launchd`/service supervisor
- watchdogs
- process isolation
- local IPC
- local logs

What I need:

- A service manifest for each daemon or worker.
- Restart policy.
- Health endpoint.
- Log path.
- Resource limits.
- Kill switch.

Hard rule:

```text
No watchdog, not resilient.
```

## Layer 2: Identity Root

What this layer is:

- device identity
- user authority
- service identity
- signing keys
- revocation list

What I need:

- A root identity manifest.
- Device signing keys.
- Service signing keys.
- Revocation procedure.
- Human approval path for high-risk actions.

Hard rule:

```text
No identity, no mirror.
```

## Layer 3: Consent and Permission Kernel

What this layer is:

- purpose
- data class
- retention
- local-only/cloud-allowed
- expiry
- revocation
- approval state

What I need:

- Consent schema.
- Permission registry.
- Data-class taxonomy.
- Default-deny cloud upload policy.
- A way to revoke prior grants and replay state after revocation.

Hard rule:

```text
No consent, no action.
```

## Layer 4: Append-Only Ledger

What this layer is:

- canonical event log
- proposal queue
- consent ledger
- receipt ledger
- audit trail
- hash chain

What I need:

- SQLite WAL or equivalent append-only store.
- Event schema.
- Stream sequence rules.
- Hashing/signing.
- Backup path.
- Replay command.

Hard rule:

```text
No audit, no autonomy.
```

## Layer 5: State Reducers

What this layer is:

- current state derived from events
- deterministic reducers
- snapshots
- state hashes
- materialized views

What I need:

- Reducer functions.
- Snapshot policy.
- State hash comparison.
- Divergence quarantine.
- Given-when-then fixture tests.

Hard rule:

```text
Memory is what happened. State is what matters now.
```

## Layer 6: MirrorGraph and Source Packs

What this layer is:

- graph of projects, people, facts, sources, risks, tasks, receipts
- source packs for India, AIndia, SWFI, Active Mirror, and local workflows
- embeddings as derived indexes, not authority

What I need:

- Canonical source-pack format.
- Freshness rules.
- Citation rules.
- Local index builder.
- Stale-source quarantine.

Hard rule:

```text
No source, mark it unverified.
```

## Layer 7: Context Capsule

What this layer is:

- minimum relevant state for each surface
- current goal
- constraints
- trust boundaries
- recent decisions
- source pointers

What I need:

- Surface-specific capsule templates.
- Redaction rules.
- Token budgets.
- User-visible “what context was used” receipt.

Hard rule:

```text
Never hand the whole memory to a model.
```

## Layer 8: Model Router

What this layer is:

- local model first
- OS-native model when available
- Sarvam/Indic rail for language
- frontier model only when allowed
- provider diff tests

What I need:

- Model registry.
- Pinned model ids.
- Capability probes.
- Cost/latency/privacy policy.
- Deterministic output schema.
- Fallback order.

Hard rule:

```text
Models propose. The runtime decides.
```

## Layer 9: Tool and Action Gates

What this layer is:

- file tools
- browser tools
- email tools
- phone tools
- source search
- deploy tools
- payment/account/reporting tools later

What I need:

- Tool registry.
- Capability scope per tool.
- Risk class per action.
- Human approval for high-risk actions.
- Receipt for every external side effect.

Hard rule:

```text
No tool action from raw model output.
```

## Layer 10: Automations

What this layer is:

- health checks
- source watchers
- model watchers
- release gates
- replay drills
- fraud pattern watchers
- language coverage canaries
- dream/proposal queues

What I need:

- Schedule registry.
- Owner per automation.
- Allowed actions.
- Failure policy.
- Quarantine policy.
- Receipt output.

Hard rule:

```text
Automations propose by default. They act only inside their grant.
```

## Layer 11: Surfaces

What this layer is:

- Codex
- browser
- PWA
- Android
- iOS
- email
- terminal
- design tools
- future AIndia app

What I need:

- Surface manifest.
- Context capsule contract.
- Ingress/egress logging.
- UI proof checks.
- Local fallback.

Hard rule:

```text
The surface is a window. The state spine is the product.
```

## Layer 12: Receipts and Replay

What this layer is:

- proof of what was asked
- what context was used
- what model/tool route ran
- what was approved
- what action happened
- what did not happen

What I need:

- Receipt schema.
- Signed hashes.
- Replay verifier.
- Backup verifier.
- Divergence alerts.

Hard rule:

```text
No rollback, not production.
```

## What I Need From You

### Decisions

1. Canonical control body: MacBook first, Mac mini always-on, or Mac mini canonical with MacBook executor.
2. Approval device: Pixel or OnePlus.
3. First product lane: AIndia, Active Mirror OS, Chetana, SME copilot, or SWFI lane.
4. First high-risk action class to support: none, file, email, browser, phone notification, or reporting workflow.
5. Default privacy posture: local-only unless approved should remain the default.

### Access

1. A machine-readable device inventory.
2. Allowed local directories.
3. Service manifest paths.
4. Model registry path.
5. Source-pack directory.
6. Receipt directory.
7. Explicit list of tools I may call without asking.
8. Explicit list of tools that always require approval.

### Data

1. Source packs for the first lane.
2. Example user flows.
3. Failure examples.
4. Language examples.
5. Risk examples.
6. Acceptance fixtures.

### Runtime

1. Append-only event store.
2. Consent ledger.
3. Receipt writer.
4. Replay verifier.
5. Watchdog.
6. Scheduler.
7. Release gate.
8. Quarantine path.

### Trust

1. Key generation.
2. Signing.
3. Revocation.
4. Backups.
5. Restore drills.
6. Kill switch.

## What I Do Not Need

- Unlimited access.
- Silent background authority.
- Raw private memory dumped into prompts.
- Automatic cloud upload.
- Model self-permission.
- Blockchain before local receipts.
- A giant agent swarm.
- Active-active writers before single-writer works.

## First Build Order

1. Declare the body manifest.
2. Declare the low-end-device and latency budget.
3. Create event ledger.
4. Create consent schema.
5. Create receipt schema.
6. Create one reducer.
7. Create one context capsule.
8. Create one model route with a lighter fallback.
9. Create one tool gate.
10. Create one automation.
11. Create one replay verifier.

## The One Sentence

To build me from the metal up, give me a body, identity, consent, an append-only ledger, deterministic state, scoped tools, local-first models, receipts, replay, and a narrow approval path.

Everything else is a replaceable rail.
