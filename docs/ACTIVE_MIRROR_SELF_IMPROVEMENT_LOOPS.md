# Active Mirror Self-Improvement Loops

This is the Active Mirror version of the anti-circle loop.

It does not promise that software never breaks. It makes broken work hard to
miss, hard to explain away, and hard to ship without proof.

## Commands

Local/static loop:

```bash
npm run self:loop
```

Public route loop:

```bash
npm run self:loop:public
```

Public route plus browser/service-worker proof:

```bash
npm run self:loop:browser
```

ML loop registry only:

```bash
npm run ml:loops
```

Receipts:

```text
output/active-mirror-self-improvement-loop-latest.json
output/active-mirror-self-improvement-loop-latest.md
output/active-mirror-ml-loop-registry-latest.json
output/active-mirror-ml-loop-registry-latest.md
```

## Active Mirror Loop Law

```text
1. Public proof beats local assumption.
2. 200 is not green.
3. sw.js HTTP green is not browser service-worker green.
4. A route exists is not the same as a workflow works.
5. Private paths must never leak into the public surface.
6. Stream output must be a workspace/proof envelope, not a chat-only endpoint.
7. Proof panels must match API receipts.
8. One failing receipt creates one patch slice.
9. Patch only that slice.
10. Do not share a public proof claim unless the loop receipt is PASS.
```

## ML Loop Families

| Loop | Family | Purpose |
| --- | --- | --- |
| public_surface_canary | route classifier | Verify public route and API contracts. |
| service_worker_controller | browser state detector | Prove browser service-worker control. |
| stream_contract_evaluator | protocol classifier | Verify workspace stream envelopes. |
| proof_ledger_consistency | consistency checker | Compare proof panels, ledger, body receipt, contracts. |
| body_receipt_signature | cryptographic verifier | Verify signed public-safe body receipts. |
| local_operator_policy | policy classifier | Enforce private-body boundary. |
| private_path_leak_detector | safety classifier | Catch local/private path leaks. |
| front_door_relevance_ranker | ranking model | Keep the homepage proof-led and buyer-relevant. |
| mirror_route_workflow_gate | interaction model | Verify the Work OS route is usable. |
| manifest_pwa_loop | PWA checker | Queue manifest/service-worker/icon proof. |
| model_health_drift_loop | time-series monitor | Watch model route/order drift. |
| ratchet_regression_loop | regression detector | Catch reliability proof regressions. |
| lead_quality_loop | text classifier | Validate deterministic lead follow-up packets. |
| deployment_parity_loop | canary classifier | Compare local, public, build, and deploy proof. |
| watchdog_uptime_loop | uptime anomaly detector | Require product-contract uptime, not just process uptime. |
| copy_promise_guard | claim classifier | Stop unsupported public claims. |
| accessibility_smoke_loop | UI quality classifier | Queue click/keyboard/mobile proof. |
| api_schema_loop | schema validator | Catch public API shape drift. |
| feedback_to_test_loop | active-learning sampler | Convert feedback into tests first. |
| repair_priority_ranker | cost-impact ranker | Pick the smallest highest-impact failing slice. |

## Mutation Boundary

The loops classify, rank, queue, and gate. They do not deploy, restart
production, train models, write private memory, or edit Cloudflare. Deployment
still goes through the deploy gate.
