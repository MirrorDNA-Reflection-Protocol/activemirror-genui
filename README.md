# Active Mirror GenUI

## Canonical Status

- Status: reference/prototype repo for GenUI and runtime experiments.
- Canonical product/front-door repo: `/Users/mirror-pro/repos/activemirror-journey`
- Canonical remote: `MirrorDNA-Reflection-Protocol/activemirror-genui`
- Active lane: Active Mirror only

New public homepage, BrainScan, Mirror Seed, and consumer reflection work should start in `/Users/mirror-pro/repos/activemirror-journey`. This repo remains useful for Next.js GenUI experiments and migration candidates.

## Product Lock

The public product should be understandable without internal language:

> Start with one real thing. Get one useful next move. Keep control of what is remembered or shared.

The technical trust thesis is:

> One kernel. Many models. Same rules every turn.

Do not lead consumer pages with provider names, receipt machinery, route internals, or architecture diagrams. Use those on trust/system pages when they help a buyer verify the claim.

Core build-scope docs:

- [MirrorOS build scope](docs/MIRROROS_BUILD_SCOPE.md)
- [Build-pack intake](docs/BUILD_PACK_INTAKE_2026-06-25.md)
- [SWFI separation rule](docs/SWFI_SEPARATION_RULE.md)
- [Repo canonicalization](docs/REPO_CANONICALIZATION_2026-06-25.md)
- [Pending migrations](docs/PENDING_MIGRATIONS_2026-06-25.md)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Common checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run ops:browser-canary
```

## Repository Hygiene

- Keep SWFI and other client work out of this repo.
- Do not expose provider keys in browser code.
- Migrate old homepage/design work into this repo deliberately; do not keep editing duplicate repos.
- Preserve legacy repos until their useful source has been reviewed and migrated.

## Framework Note

This project uses Next.js. This local Next version has breaking changes; read `node_modules/next/dist/docs/` before relying on framework assumptions.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
