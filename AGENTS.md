<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Active Mirror GenUI Reference Guard

## Active Lane

This repository is no longer the canonical Active Mirror product/front-door repo.

- Lane: Active Mirror only.
- Canonical product/front-door repo: `/Users/mirror-pro/repos/activemirror-journey`
- This repo status: research/prototype/reference for Next.js GenUI, runtime experiments, and migration candidates.
- Canonical remote: `MirrorDNA-Reflection-Protocol/activemirror-genui`

## Repo Boundary

Do not start new public homepage, BrainScan, Mirror Seed, or consumer chat implementation here. Start in:

```text
/Users/mirror-pro/repos/activemirror-journey
```

Use this repo only to recover specific GenUI/runtime ideas, inspect experiments, or migrate specific files into the product repo.

## Migration Rule

When useful work exists outside this repo:

1. Identify the source path and current branch.
2. Copy only the needed source/design/doc into `/Users/mirror-pro/repos/activemirror-journey`.
3. Rebuild and verify there.
4. Leave the source repo intact unless Paul explicitly asks for archival/deletion.

Do not delete, reset, or rewrite legacy/prototype repos while canonicalizing.

## Required Build-Scope Reads

Before changing product scope, runtime architecture, model routing, memory, receipts, SWFI boundaries, or agent authority, read:

- `docs/MIRROROS_BUILD_SCOPE.md`
- `docs/BUILD_PACK_INTAKE_2026-06-25.md`
- `docs/SWFI_SEPARATION_RULE.md`
- `docs/REPO_CANONICALIZATION_2026-06-25.md`
- `docs/PENDING_MIGRATIONS_2026-06-25.md`

## Product Rule

Consumer-facing copy should start with the user job:

> Start with one real thing. Get one useful next move. Keep control of what is remembered or shared.

Trust/technical copy can use:

> One kernel. Many models. Same rules every turn.

Avoid leading with internal architecture, model names, receipt machinery, sovereignty jargon, or old project labels unless the target page is explicitly technical.
