@AGENTS.md

# Active Mirror GenUI — Project Context

DO NOT ASK PAUL TO RE-EXPLAIN ANY OF THIS. Read it. Use it. Move.

## What This Is
- **Product**: Active Mirror GenUI — a generative UI AI workspace
- **Domain**: activemirror.ai (replaces the old marketing site)
- **Stack**: Next.js 16, Tailwind 4, motion (framer-motion), recharts, @xyflow/react (React Flow), lucide-react, react-markdown, Zod 4
- **AI Backend**: OpenAI GPT-4.1 via Vercel AI SDK (`streamObject` with Zod schema)
- **Repo**: github.com/MirrorDNA-Reflection-Protocol/activemirror-genui
- **Branch**: main
- **Local dev port**: 4005

## Architecture
- Landing = chat input that materializes (no bloat, no hero sections)
- User types → chat thread on LEFT, surfaces ghost-in on RIGHT
- Surfaces: DocumentSurface, BrowserSurface (reference panel), ChartSurface (recharts), MirrorGraph (React Flow)
- Governance warnings appear inline in chat as amber/red banners
- Stream protocol: A2UI envelopes (surfaceUpdate, dataModelUpdate, beginRendering)
- Schema: thought_process, new_nodes, new_edges, suggested_prompts

## Key Files
- `src/app/api/mirror/stream/route.ts` — streaming API route (GPT-4.1 → A2UI envelopes)
- `src/lib/mirror/schema.ts` — Zod schema for structured output
- `src/lib/mirror/useA2UIStream.ts` — client streaming hook
- `src/components/active-mirror/ActiveMirrorHomepage.tsx` — main page component
- `src/components/active-mirror/TriPanelLayout.tsx` — split chat + surfaces layout
- `src/components/active-mirror/surfaces/` — DocumentSurface, BrowserSurface, ChartSurface, MirrorGraph

## Deployment
- **Host**: Cloudflare Pages
- **Cloudflare project name**: activemirror-site
- **DNS**: Cloudflare (IPs: 104.21.86.3, 172.67.213.79)
- **Deployment method**: Cloudflare Pages connected to GitHub (setup was done by someone else, Paul manages via Cloudflare dashboard)
- **No Vercel**. Do not suggest Vercel.
- **No GitHub Actions yet** — needs to be set up
- **Environment variables needed in Cloudflare**: OPENAI_API_KEY, AUTH_SECRET, DATABASE_URL

## API Keys
- **OpenAI**: Working. In `.env.local` as OPENAI_API_KEY. Also in macOS keychain.
- **Google/Gemini**: DEAD — key was leaked and revoked by Google. Do not use until Paul generates a new one.
- **Anthropic**: In macOS keychain as ANTHROPIC_API_KEY. Not used by this app.
- **Model choice**: gpt-4.1 (best for structured JSON streaming, fast, cheap). gpt-5.5 is available but overkill.

## Design Decisions (settled — do not re-litigate)
- No fake browser chrome — links open in real browser via window.open()
- No local browser models (WebLLM) — API roundtrip is 200ms, local models add complexity for worse results
- No Flutter — this is a text-heavy web app, DOM wins
- Chat IS the landing — no hero sections, no bloat
- Surfaces materialize with ghost animations (blur + scale + spring physics)
- Back button in header to reset to landing

## Owner
Paul Desai / N1 Intelligence (OPC) Pvt Ltd
