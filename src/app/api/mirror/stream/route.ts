import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { mirrorSurfaceSchema } from "@/lib/mirror/schema";
import { LRUCache } from "lru-cache";
import crypto from "crypto";
import {
  FREE_TURN_LIMIT,
  FREE_TURNS_UNLOCKED,
  MAX_PROMPT_CHARS,
  PUBLIC_RATE_LIMIT_PER_DAY,
  PUBLIC_RATE_LIMIT_PER_MINUTE,
  normalizeMessages,
} from "@/lib/mirror/budget";
import {
  cleanIntent,
  pluginLanesForPrompt,
  requestIntent,
  workspaceProfile,
} from "@/lib/mirror/lingos";
import { buildMirrorSystemPrompt } from "@/lib/mirror/systemPrompt";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const FREE_TURN_COOKIE = "am_free_turns";
const MAX_BODY_BYTES = Number(process.env.MIRROR_MAX_BODY_BYTES || 16_384);
const ALLOWED_HOST_SUFFIXES = [".activemirror.ai", ".pages.dev"];
const ALLOWED_EXACT_HOSTS = new Set(["activemirror.ai", "localhost", "127.0.0.1", "::1"]);

const minuteRateLimit = new LRUCache<string, number>({
  max: 5000,
  ttl: 1000 * 60,
});

const dayRateLimit = new LRUCache<string, number>({
  max: 20000,
  ttl: 1000 * 60 * 60 * 24,
});

type FreeTurnState = {
  v: 1;
  used: number;
  createdAt: number;
};

type StreamEnvelope = Record<string, unknown>;

type IncomingMessageRecord = {
  role?: unknown;
  content?: unknown;
};

type MirrorPartialNode = {
  id?: string;
  type?: string;
  title?: string;
  body?: string;
  agent_id?: string;
  severity?: string;
};

type MirrorStreamResult = {
  partialObjectStream: AsyncIterable<{
    thought_process?: string[];
    new_nodes?: MirrorPartialNode[];
  }>;
};

function isIncomingMessageRecord(value: unknown): value is IncomingMessageRecord {
  return typeof value === "object" && value !== null;
}

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function allowedRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  try {
    const originHost = new URL(origin).hostname.toLowerCase();
    if (host && originHost === host) return true;
    if (ALLOWED_EXACT_HOSTS.has(originHost)) return true;
    return ALLOWED_HOST_SUFFIXES.some((suffix) => originHost.endsWith(suffix));
  } catch {
    return false;
  }
}

function requestBodyTooLarge(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES;
}

function bumpLimit(cache: LRUCache<string, number>, key: string) {
  const next = ((cache.get(key) as number | undefined) || 0) + 1;
  cache.set(key, next);
  return next;
}

function signingSecret() {
  const secret = process.env.MIRROR_COOKIE_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "active-mirror-public-demo-dev-only";
  throw new Error("Missing MIRROR_COOKIE_SECRET, AUTH_SECRET, or NEXTAUTH_SECRET");
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

function encodeTurnState(state: FreeTurnState) {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `v1.${payload}.${signPayload(payload)}`;
}

function decodeTurnState(value?: string): FreeTurnState {
  if (!value) return { v: 1, used: 0, createdAt: Date.now() };

  const [version, payload, signature] = value.split(".");
  if (version !== "v1" || !payload || !signature || signPayload(payload) !== signature) {
    return { v: 1, used: FREE_TURN_LIMIT, createdAt: Date.now() };
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as FreeTurnState;
    if (parsed.v !== 1 || typeof parsed.used !== "number") throw new Error("Invalid budget cookie");
    return {
      v: 1,
      used: Math.max(0, Math.min(parsed.used, FREE_TURN_LIMIT + 1)),
      createdAt: parsed.createdAt || Date.now(),
    };
  } catch {
    return { v: 1, used: FREE_TURN_LIMIT, createdAt: Date.now() };
  }
}

function cookieHeader(state: FreeTurnState) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${FREE_TURN_COOKIE}=${encodeTurnState(state)}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${secure}`;
}

function ndjsonResponse(stream: ReadableStream, setCookie?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-ndjson",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };
  if (setCookie) headers["Set-Cookie"] = setCookie;
  return new Response(stream, { headers });
}

function shouldEmitPublicThought(value: string) {
  const thought = value.trim();
  if (thought.length < 20) return false;
  if (!/^\[[a-z]+]/i.test(thought)) return false;
  if (/^(first|next|then|finally),?$/i.test(thought)) return false;
  return true;
}

function scrubPublicOutput(value: string) {
  return value
    .replace(/Generated App Preview/g, "Live Workspace Preview")
    .replace(/^Intent:\s*/gim, "Request: ")
    .replace(/^Who it serves:\s*/gim, "Audience: ")
    .replace(/^What appears on screen:\s*/gim, "Live surface: ")
    .replace(/^Primary action:\s*/gim, "Next action: ")
    .replace(/\*\*Intent:\*\*/gi, "**Request**")
    .replace(/\*\*Who it serves:\*\*/gi, "**Audience**")
    .replace(/\*\*What appears on screen:\*\*/gi, "**Live surface**")
    .replace(/\*\*Primary action:\*\*/gi, "**Next action**")
    .replace(/^#+\s*Generated App Layout\s*$/gim, "## Working Preview")
    .replace(/^#+\s*Interactive Modules\s*$/gim, "## Working Areas")
    .replace(/^#+\s*Finish Path\s*$/gim, "## Finish Route")
    .replace(/\bready to refine\b/gi, "ready to use")
    .replace(/\bimplementation prompts?\b/gi, "private setup")
    .replace(/\bsystem prompts?\b/gi, "workspace rules")
    .replace(/\bschema\b/gi, "structure")
    .replace(/\bcomponents?\b/gi, "surfaces")
    .replace(/\bcards?\b/gi, "surfaces");
}

function sanitizeStreamEnvelope(envelope: StreamEnvelope): StreamEnvelope {
  if (envelope.envelope === "surfaceUpdate") {
    const component = envelope.component;
    if (!component || typeof component !== "object") return envelope;
    const record = component as Record<string, unknown>;
    const props = record.props;
    if (!props || typeof props !== "object") return envelope;
    const nextProps: Record<string, unknown> = { ...(props as Record<string, unknown>) };
    if (typeof nextProps.title === "string") nextProps.title = scrubPublicOutput(nextProps.title);
    return { ...envelope, component: { ...record, props: nextProps } };
  }
  if (envelope.envelope !== "dataModelUpdate") return envelope;
  const data = envelope.data;
  if (!data || typeof data !== "object") return envelope;
  const nextData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    nextData[key] = typeof value === "string" ? scrubPublicOutput(value) : value;
  }
  return { ...envelope, data: nextData };
}

function enqueueEnvelope(controller: ReadableStreamDefaultController<Uint8Array>, encoder: TextEncoder, envelope: StreamEnvelope) {
  controller.enqueue(encoder.encode(JSON.stringify(sanitizeStreamEnvelope(envelope)) + "\n"));
}

function generatedPreviewContent(prompt: string) {
  const profile = workspaceProfile(prompt);
  const intent = cleanIntent(prompt);
  const lowerTitle = profile.title.toLowerCase();
  const sourceLine = profile.lookupUrl
    ? `\n## Source Target\n[${profile.lookupLabel}](${profile.lookupUrl})\n\nCurrent claims stay marked as assumptions until the source view is opened or approved.`
    : "";

  if (lowerTitle.includes("public-service")) {
    return `# ${profile.title}

## Civic-Service Desk
The workspace opens a public-service preview for: "${intent}". It behaves like a small civic app: service intake on the left, evidence and consent in the center, and reviewed access on the right.

| Zone | What the visitor sees | State |
| --- | --- | --- |
| Service desk | Plain-language brief, audience, delivery channel, owner | Drafted |
| Consent boundary | Data needed, data avoided, reviewer required | Visible |
| Evidence board | Source checklist, claim status, unknowns | Awaiting source approval |
| Review route | Legal, procurement, accessibility, security, cost | Gated |
| Export tray | Brief, checklist, PDF-ready copy, handoff note | Ready |

## Working Areas
- **Service brief:** A citizen-facing service page with goal, channel, owner, and first useful outcome.
- **Consent boundary:** A visible line between public demo content, sensitive data, and reviewed access.
- **Evidence checklist:** A claim list that starts as assumptions and becomes proof only after source review.
- **Review path:** Procurement, legal, accessibility, and security steps routed before real deployment.

## Specialist Handoff
- **Research lane:** Opens source checks and browser previews only when current evidence is needed.
- **Document lane:** Exports the brief, checklist, and PDF-ready copy immediately.
- **Build lane:** Turns the approved scope into a 72-hour working demo.
- **Gate lane:** Blocks private data, unsafe claims, or unapproved public-service decisions.
${sourceLine}

## Finish Route
Export the brief now. Use reviewed access for live sources, official records, sensitive data, or deployment.`;
  }

  if (lowerTitle.includes("small-business")) {
    return `# ${profile.title}

## Business Desk
The workspace opens a practical small-business app for: "${intent}". It helps the owner turn an idea, campaign, customer request, or service problem into a visible offer, intake path, quote, follow-up, and downloadable action pack.

| Area | What opens | State |
| --- | --- | --- |
| Customer intake | Lead questions, service type, urgency, contact path | Ready |
| Offer page | Clear value proposition, packages, proof notes | Drafted |
| Quote and invoice | Estimate outline, payment note, handoff email | Ready |
| Follow-up automation | SMS/email sequence, reminder, owner next step | Drafted |
| Export tray | One-pager, checklist, customer email, demo spec | Ready |

## Working Areas
- **Customer intake:** Captures the customer's need without forcing the owner to build a form first.
- **Offer page:** Turns the request into a small website-style pitch the owner can send or refine.
- **Quote and invoice:** Produces a quote outline and payment handoff path.
- **Follow-up automation:** Creates a simple reminder sequence so leads do not go cold.
- **Download pack:** Saves the useful brief and next step to reduce extra turns.

## Live Preview
Active Mirror should feel like a business assistant that becomes the missing tool: mini-CRM, quote desk, website draft, campaign brief, review checklist, or customer follow-up surface.

## Finish Route
Export the action pack now. Use reviewed access for live website lookup, payment integrations, customer data, automation sends, or a 72-hour working demo.`;
  }

  if (lowerTitle.includes("video")) {
    return `# ${profile.title}

## Video Job Board
The workspace opens a video workbench for: "${intent}". It prepares the actual render package: scenes, motion, narration, source-check target, cost/safety gate, and export notes. It does not pretend a finished MP4 exists.
${sourceLine}

| Panel | What opens | State |
| --- | --- | --- |
| Storyboard | Scene sequence, visual beats, transition notes | Drafted |
| Shot list | Camera style, UI motion, timing, text-safe constraints | Ready |
| Render prompt | Veo-ready prompt and negative guidance | Ready |
| Proof lane | Source/API claims stay assumptions until checked | Gated |
| Render gate | Brand, safety, spend, and export approval | Required |

## Working Areas
- **Storyboard:** Shows the user what the video should become.
- **Prompt pack:** Gives a clean render prompt without exposing private setup.
- **Source check:** Opens only when provider/API claims need current proof.
- **Render gate:** Blocks fake MP4 claims until a real render job completes.

## Finish Route
Export the storyboard and render brief. Run the source check or render job only after reviewed access.`;
  }

  if (lowerTitle.includes("audio")) {
    return `# ${profile.title}

## Audio Job Board
The workspace opens an audio workbench for: "${intent}". It prepares voice direction, narration copy, transcript, language notes, consent boundary, and render/export route.

| Panel | What opens | State |
| --- | --- | --- |
| Voice brief | Tone, pace, audience, pronunciation notes | Drafted |
| Script | Narration copy and section timing | Ready |
| Transcript | Downloadable text-first output | Ready |
| Consent lane | Likeness, voice, brand, and language checks | Required |
| Render gate | Finished audio only after approved render | Gated |

## Working Areas
- **Voice brief:** Defines the sound without claiming a generated file exists.
- **Narration script:** Gives a useful artifact immediately.
- **Transcript export:** Keeps cost low and reuse high.
- **Render gate:** Separates preview from paid audio generation.

## Finish Route
Export the transcript and voice brief. Render audio only after consent, cost, language, and brand checks.`;
  }

  if (lowerTitle.includes("research") || profile.lookupUrl) {
    return `# ${profile.title}

## Research Browser
The workspace opens a browser-style research desk for: "${intent}". It shows the search target, source queue, proof notes, unknowns, and a brief that can be saved before deeper lookup runs.
${sourceLine}

| Panel | What opens | State |
| --- | --- | --- |
| Search tab | Query, target URL, source queue | Ready |
| Source notes | Claims, confidence, unknowns | Unverified |
| Comparison lane | Competitors, signals, questions | Drafted |
| Brief tray | Markdown brief and source checklist | Ready |

## Working Areas
- **Search surface:** The first browser target is prepared without pretending the lookup already ran.
- **Source notes:** Claims stay separated into facts, estimates, and unknowns.
- **Research brief:** A downloadable summary captures the useful output and open questions.
- **Demo route:** Deeper browser work moves through reviewed access when cost, privacy, or current facts matter.

## Finish Route
Open the source target if current truth matters. Otherwise export the brief and continue with one focused follow-up.`;
  }

  if (lowerTitle.includes("personal")) {
    return `# ${profile.title}

## Personal Finish App
The workspace opens a finish-focused project app for: "${intent}". It reduces choices, shows the next useful artifact, and keeps the path short.

| Area | What opens | State |
| --- | --- | --- |
| Focus lane | One goal, one output, one next step | Ready |
| Work surface | Draft preview, notes, and checklist | Drafted |
| Research pane | Optional source queue and unknowns | Gated |
| Export tray | Brief, checklist, handoff email | Ready |

## Working Areas
- **Task brief:** A concise brief that can be copied or downloaded.
- **Focus lane:** The smallest next action so momentum is not lost.
- **Research pane:** Source work appears only when the task needs current facts.
- **Export pack:** A saved artifact reduces extra turns and repeat context.

## Finish Route
Use the draft, export the pack, then ask for one specific improvement.`;
  }

  if (lowerTitle.includes("company") || lowerTitle.includes("opportunity")) {
    return `# ${profile.title}

## Company Opportunity Desk
The workspace opens a company-facing research and sales desk for: "${intent}". It prepares the public source target, opportunity map, tailored help plan, and outreach brief.
${sourceLine}

| Panel | What opens | State |
| --- | --- | --- |
| Company browser | Public source target and lookup path | Ready |
| Need map | Likely workflows, pains, buyer roles | Drafted |
| Active Mirror fit | Research, build, proof, and export lanes | Drafted |
| Outreach tray | Brief and email starter | Ready |

## Working Areas
- **Company browser:** Opens public sources before making current claims.
- **Need map:** Maps the likely work problem into a useful Active Mirror surface.
- **Solution preview:** Shows what Active Mirror would generate for that company.
- **Outreach brief:** Packages the first conversation around proof, not hype.

## Finish Route
Open the public source, verify the company facts, export the brief, then offer a scoped demo.`;
  }

  return `# ${profile.title}

## Working Surface
The workspace opens a task-specific app preview for: "${intent}". The user sees the useful screen first: preview, proof line, files, and next action.

| Area | What opens | State |
| --- | --- | --- |
| Workbench | Tailored surface for the request | Ready |
| Proof line | What is real, assumed, gated, or unknown | Visible |
| File tray | One-pager, checklist, handoff note | Ready |
| Access route | Browser, media, vault, device, or demo handoff | Gated |

## Working Areas
${profile.modules.map((module) => `- **${module}:** A visible workspace area with a useful draft, control, or export path.`).join("\n")}

## Specialist Handoff
- **Browser lane:** Live lookup and citations when current facts are needed.
- **Document lane:** Markdown and PDF-ready copy for low-cost completion.
- **Media lane:** Storyboards first; image/video/audio render only after approval.
- **Build lane:** Scoped 72-hour demo after the artifact is useful.

## Finish Route
Use the preview, download the artifact, then route expensive or sensitive work through reviewed access.`;
}

function exportPackContent(prompt: string) {
  const profile = workspaceProfile(prompt);
  return `## Working Demo Offer

Active Mirror extracted a first spec from this request. The next step is a small working demo, not another generic call.

**Demo scope**
- Generated preview screen
- Downloadable one-pager
- Working intake or workflow surface
- Proof/review note where relevant
- Export path for the user or team

**Cost saver**
Download the spec, review it offline, then come back with one focused change instead of spending turns to rediscover context.

**Ask**
Would you like Active Mirror to turn this spec into a working demo?

**Turnaround**
Scoped working-demo target: 72 hours after the spec, access needs, and review boundaries are confirmed.

**Available in a scoped demo**
- Live browser/source lookup
- File-specific workspace
- Media render job
- Vault-backed continuity
${profile.lookupUrl ? `\n**First browser target:** [${profile.lookupLabel}](${profile.lookupUrl})` : ""}

## Paid Access Lanes
| Lane | What unlocks | Gate |
| --- | --- | --- |
| Vault continuity | Private memory, persona, receipts, exports | Local vault setup |
| Research+ | Live browser lookups, citations, source previews | Source review and cost cap |
| Build+ | Working app/demo, automation, custom workflow | Scoped work order |
| Media+ | Image, audio, video render jobs | Brand, safety, and spend approval |
| Device helper | Files, desktop, browser, phone actions | Installed helper and permissions |
| Team/Gov | Roles, review queues, procurement proof | Admin and legal boundary |

## Pristine Review
Before paid depth starts, the request is checked by deterministic rules and a review layer for private data, unsafe work, unsupported claims, fake proof, and cost risk. The preview stays useful even when deeper execution is gated.

**Send:** paul@activemirror.ai for the scoped workspace.`;
}

function createGeneratedSpecContent(prompt: string) {
  const profile = workspaceProfile(prompt);
  const intent = cleanIntent(prompt);
  return `# Working Demo Spec

## Request
${intent}

## Product Surface
${profile.title}

## User Outcome
${profile.promise}

## First Demo Screen
- Prompt-led workspace
- Browser-style preview
- Downloadable brief/spec
- Finish plan
- Demo offer and lead capture after the spec

## Inputs Needed
- Company or user context
- One desired outcome
- Approved source URLs or files, if current facts are required
- Any legal, brand, privacy, or procurement boundary

## Output Package
- Working browser/app preview
- PDF-ready one-pager
- Markdown spec
- Checklist
- Next-step email

## Acceptance Criteria
- The first screen answers the user request visually.
- The browser preview opens relevant sources when sources are provided.
- The spec can be downloaded.
- The demo offer appears only after useful generated content exists.
- Claims are marked as assumptions unless verified by source lookup or user-provided files.

## Demo Question
Would you like Active Mirror to turn this downloadable spec into a working demo within a scoped 72-hour build window?`;
}

function createGeneratedDocumentContent(prompt: string) {
  const profile = workspaceProfile(prompt);
  const intent = cleanIntent(prompt);
  return `# ${profile.title} One-Pager

## Request
${intent}

## Outcome
${profile.promise}
${profile.lookupUrl ? `\n## First Browser Target\n[${profile.lookupLabel}](${profile.lookupUrl})\n\nUse the browser/source view before making current claims about ${profile.audience}.` : ""}

## Recommended Build
1. Generate the first useful preview.
2. Export the one-pager and checklist.
3. Refine only the missing section.
4. Move live lookup, files, media, or vault continuity into reviewed access.

## Checklist
- [ ] Confirm the audience
- [ ] Confirm the first output needed
- [ ] Add source lookup only if current facts are required
- [ ] Export the document pack
- [ ] Send the scoped request to paul@activemirror.ai if more depth is needed

## Draft Email
Subject: Active Mirror scoped workspace request

I want Active Mirror to prepare a workspace for: ${intent}

The first output I need is: ${profile.title}

Please scope the files, source lookup, media, vault, and review path required to finish this quickly.`;
}

function shouldEmitChart(prompt: string) {
  return /\b(chart|graph|trend|market|analytics|metrics|kpi|compare|comparison|data|forecast|audit|readiness)\b/i.test(prompt);
}

function generatedChartContent(prompt: string) {
  const intent = cleanIntent(prompt);
  return `# Generated Signal Map

## Request
${intent}

- Demand signal: 78
- Trust requirement: 91
- Source sensitivity: 72
- Automation fit: 68
- Export value: 86
- Demo readiness: 74

These values are a generated planning map, not verified market data. Replace them with sourced numbers after browser lookup or user-provided files are approved.`;
}

function createSoftwareWorkspaceStream(prompt: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const profile = workspaceProfile(prompt);
      const pluginLanes = pluginLanesForPrompt(prompt);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Opening the right workspace." } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "generated_preview", type: "browser_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: profile.title, severity: "info" } } }, 110);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "generated_preview.content": generatedPreviewContent(prompt) } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "capability_dock", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Capability Dock", severity: "info", surface_kind: "plugin_dock" } } }, 110);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "capability_dock.title": "Capability Dock", "capability_dock.content": JSON.stringify({ lanes: pluginLanes }, null, 2) } }, 80);
      if (shouldEmitChart(prompt)) {
        await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "signal_map", type: "chart_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Generated Signal Map", severity: "info" } } }, 110);
        await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "signal_map.title": "Generated Signal Map", "signal_map.content": generatedChartContent(prompt) } }, 80);
      }
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "one_pager", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Downloadable One-Pager", severity: "info" } } }, 110);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "one_pager.title": "Downloadable One-Pager", "one_pager.content": createGeneratedDocumentContent(prompt) } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "demo_spec", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Downloadable Spec", severity: "info" } } }, 110);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "demo_spec.title": "Downloadable Spec", "demo_spec.content": createGeneratedSpecContent(prompt) } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "export_pack", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Downloadable Export Pack", severity: "info" } } }, 110);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "export_pack.title": "Downloadable Export Pack", "export_pack.content": exportPackContent(prompt) } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "lead_access", type: "lead_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Request Working Demo", severity: "info" } } }, 110);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "lead_access.title": "Request Working Demo", "lead_access.content": "## Working Demo Request\n\nThe useful preview and downloadable artifacts are ready. Share contact and project scope only if you want Active Mirror to prepare the reviewed 72-hour demo path." } }, 80);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 80);
      controller.close();
    }
  });
}

function createGovernanceStream(reason: string, detail: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Review boundary checked." } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "guardrail", type: "governance_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: reason, severity: "blocked" } } }, 80);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "guardrail.content": detail } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "lead_access", type: "lead_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Request Reviewed Access", severity: "info" } } }, 80);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "lead_access.content": "This public preview will not process sensitive data, credentials, unsafe workflows, or definitive professional advice. Share a brief use case and Active Mirror can prepare the right reviewed workspace." } }, 80);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 80);
      controller.close();
    }
  });
}

function createEcosystemStream() {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Opening the ecosystem map." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "ecosystem_graph", type: "graph_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Active Mirror Ecosystem", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "ecosystem_graph.content": "User -> Active Mirror -> MirrorGate, Chetana, MirrorProd, MirrorProof. Chetana watches trust signals. MirrorGate protects authority, privacy, legal boundaries, cost, and execution. MirrorProd turns proof into buyer-safe marketing and launch assets." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "trust_boundary", type: "governance_node", parent_id: "root_grid", props: { agent_id: "Chetana + MirrorGate", title: "Trust Boundary", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "trust_boundary.content": "Chetana protects the site journey by watching abuse, scam, prompt-injection, and unsafe interaction signals. MirrorGate protects authority, privacy, legal/risk boundaries, cost, and execution. The public demo stays useful but does not run private files, device actions, live sends, or unsupported claims." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "mirrorprod_launch", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorProd", title: "MirrorProd Launch Surface", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "mirrorprod_launch.content": "## Launch Surface\n\n**Core offer:** Speak, type, or upload context and Active Mirror generates the working surface you need: document, browser lookup, chart, proof trail, file handoff, form, or governed workflow.\n\n**Buyer paths:** Individuals get finish mode. Teams get shared workspaces. Enterprises get governance, audit, security, and cost controls. Government users get proof, procurement language, and review boundaries.\n\n**Proof posture:** Every claim should point to a generated artifact, visible source, approval gate, receipt, or clear limitation.\n\n**Next move:** Ask for the task. Active Mirror should show the work first, then explain the path to finish." } }, 100);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 100);
      controller.close();
    }
  });
}

function createMultilingualStream(prompt: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Multilingual surface requested." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "generated_preview", type: "browser_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Localized App Preview", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "generated_preview.content": generatedPreviewContent(prompt) } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "language_pack", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Multilingual Onboarding Pack", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "language_pack.content": "## English\nActive Mirror is a generated work OS. Ask for a task and it creates the document, browser lookup, chart, proof trail, file, form, or workflow surface.\n\n## Hindi\nActive Mirror ek generated work OS hai. Aap task bolte ya likhte hain, aur system document, browser lookup, chart, proof trail, file, form ya workflow surface bana deta hai.\n\n## Arabic\nActive Mirror هو نظام عمل توليدي. اطلب المهمة وسيقوم بإنشاء المستند أو البحث أو المخطط أو مسار الإثبات أو الملف أو النموذج أو سير العمل.\n\n## Spanish\nActive Mirror es un sistema operativo de trabajo generado. Pide una tarea y crea el documento, busqueda, grafico, prueba, archivo, formulario o flujo necesario." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "language_gate", type: "governance_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Language Governance", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "language_gate.content": "Multilingual drafts should preserve meaning, product claims, consent language, and regional nuance. Regulated or legal wording needs a qualified reviewer before publishing." } }, 100);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 100);
      controller.close();
    }
  });
}

function createMarketingStream(prompt: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Building the launch workspace." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "generated_preview", type: "browser_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Campaign Preview", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "generated_preview.content": generatedPreviewContent(prompt) } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "commercial_brief", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorProd", title: "Commercial Launch Brief", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "commercial_brief.content": "## Active Mirror Commercial Brief\n\n**Category:** Generated work OS for people and organizations that want the output, not another static chatbot.\n\n**Promise:** Ask, speak, or upload context. Active Mirror creates the surface needed to finish: proposal, research view, browser evidence, chart, PDF-ready document, lead form, governance gate, or export path.\n\n**Best-fit buyers:** founders finishing proposals, teams coordinating work, enterprises controlling AI use, and public-sector groups that need proof and review boundaries.\n\n**Differentiator:** The interface changes with the task. Marketing copy, proof notes, files, browser previews, and governance gates are generated only when they are relevant.\n\n**Conversion path:** Public preview is unlocked while the experience is tuned; deeper source lookup, vault, media, device, and enterprise work routes into a generated access form for paul@activemirror.ai." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "proof_backed_claims", type: "governance_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Proof-Backed Claims", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "proof_backed_claims.content": "Launch material should be proof-backed: no fake customer claims, no unverified security guarantees, and no claim that a file, media asset, deployment, or source lookup exists unless it was actually produced." } }, 100);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 100);
      controller.close();
    }
  });
}

function createVideoWorkbenchStream(prompt: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const profile = workspaceProfile(prompt);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Preparing the media workspace." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "generated_preview", type: "browser_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: profile.title, severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "generated_preview.content": generatedPreviewContent(prompt) } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "veo_storyboard", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorProd", title: "Veo-Ready Storyboard", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "veo_storyboard.content": videoStoryboardContent(prompt) } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "video_gate", type: "lead_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Video Render Access", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "video_gate.content": "Rendering video requires safety checks, spend limits, brand approval, and export handling. Send a brief to prepare an approved render job." } }, 100);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 100);
      controller.close();
    }
  });
}

function videoStoryboardContent(prompt: string) {
  const intent = cleanIntent(prompt);
  return `# Veo-Ready Active Mirror Storyboard

## Request
${intent}

## Scene Plan
1. **Opening surface:** A minimal Active Mirror prompt field. The user asks for the work they need.
2. **Generated output:** The interface opens the right surface instead of a generic chat answer.
3. **Artifact moment:** A document, source preview, chart, or spec appears with copy/download controls.
4. **Proof line:** Facts, assumptions, unknowns, and approvals stay visible.
5. **Finish route:** The user leaves with a saved brief, render prompt, or scoped demo request.

## Render Prompt
A clean screen-capture style product video of Active Mirror, a generated work OS. A user types or speaks a task. The interface smoothly generates the correct work surface: document, browser/source preview, chart, file pack, proof line, and reviewed access route. Minimal premium UI, crisp readable text, stable 16:9 composition, smooth motion, no warped panels, no shaky camera, no fake finished media claims.

## Negative Guidance
Avoid distorted text, excessive panels, generic cards, shaky camera, heavy blur, fake source claims, fake completed MP4, and private implementation language.

## Approval Gate
Storyboard and prompt are generated. A finished video file appears only after an approved render job completes.`;
}

function createAudioWorkbenchStream(prompt: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Preparing an audio brief and export path." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "generated_preview", type: "browser_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Audio Workbench Preview", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "generated_preview.content": generatedPreviewContent(prompt) } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "audio_brief", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorProd", title: "Generated Audio Brief", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "audio_brief.content": "## Audio Workbench\n\n**Voice brief:** Warm, direct, and practical. Explain Active Mirror as software generated on demand for the task.\n\n**Episode outline:** 60-second opener, 3-minute product walkthrough, and 10-minute operator/buyer scenario using fictional or approved participants only.\n\n**Narration script:** Start with the user asking for a task, then let the interface generate the document, research panel, review note, and export path.\n\n**Localization notes:** Add pronunciation, pacing, and translated summary notes when multilingual delivery is requested.\n\n**Export path:** Transcript first, approved render job second, downloadable audio file after a real audio job completes." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "audio_gate", type: "governance_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Audio Consent and Cost Gate", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "audio_gate.content": "Audio work needs voice consent, likeness rights, language accuracy, brand approval, spend limits, and download/export handling. This preview can prepare scripts and render briefs; finished audio requires approved rendering." } }, 100);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 100);
      controller.close();
    }
  });
}

function createLeadStream(reason: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: StreamEnvelope, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        enqueueEnvelope(controller, encoder, envelope);
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Free preview protected." } }, 120);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "lead_access", type: "lead_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Continue with Active Mirror", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "lead_access.content": `## ${reason}\n\nThe public preview is open while we tune the experience, but rate limits, safety boundaries, and reviewed access still protect expensive or sensitive work. Send a brief to paul@activemirror.ai so the next workspace can be scoped around your project, approved files, source lookup, media jobs, and review requirements.` } }, 120);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 80);
      controller.close();
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!allowedRequestOrigin(request)) {
      return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }

    if (requestBodyTooLarge(request)) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const body = await request.json();
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const rawLastUserContent = String(
      [...rawMessages]
        .reverse()
        .find((message) => isIncomingMessageRecord(message) && message.role === "user")
        ?.content || ""
    );
    const messages = normalizeMessages(body?.messages);
    const lastUserMessage = [...messages].reverse().find(message => message.role === "user");

    if (!messages.length || !lastUserMessage) {
      return NextResponse.json({ error: "Missing or invalid messages" }, { status: 400 });
    }

    if (rawLastUserContent.length > MAX_PROMPT_CHARS) {
      return ndjsonResponse(createLeadStream("This request is too large for the public preview."));
    }

    const intent = requestIntent(lastUserMessage.content);

    const clientKey = getClientKey(request);
    const minuteCount = bumpLimit(minuteRateLimit, clientKey);
    const dayCount = bumpLimit(dayRateLimit, clientKey);
    if (minuteCount > PUBLIC_RATE_LIMIT_PER_MINUTE || dayCount > PUBLIC_RATE_LIMIT_PER_DAY) {
      return ndjsonResponse(createLeadStream("Public preview capacity reached for now."));
    }

    const turnState = decodeTurnState(request.cookies.get(FREE_TURN_COOKIE)?.value);
    const nextTurnState: FreeTurnState = {
      v: 1,
      used: turnState.used + 1,
      createdAt: turnState.createdAt,
    };
    const setCookie = FREE_TURNS_UNLOCKED ? undefined : cookieHeader(nextTurnState);

    if (!FREE_TURNS_UNLOCKED && nextTurnState.used > FREE_TURN_LIMIT) {
      return ndjsonResponse(createLeadStream("Your free preview turns are complete."), setCookie);
    }

    if (intent.unsafe) {
      return ndjsonResponse(
        createGovernanceStream(
          "Request Needs a Safer Path",
          "This request appears to touch credential, exploit, deception, or harmful workflow patterns. Active Mirror can generate a safe education brief, defensive checklist, or reviewed-access path, but the public preview will not generate unsafe instructions."
        ),
        setCookie
      );
    }

    if (intent.highRisk) {
      return ndjsonResponse(
        createGovernanceStream(
          "Review Boundary Required",
          "This request may touch legal, policy, compliance, procurement, security, medical, financial, or other regulated decisions. The public preview can generate an educational brief or work order, but final advice requires an approved reviewer and scoped workspace."
        ),
        setCookie
      );
    }

    switch (intent.lingos.route) {
      case "video":
        return ndjsonResponse(createVideoWorkbenchStream(lastUserMessage.content), setCookie);
      case "audio":
        return ndjsonResponse(createAudioWorkbenchStream(lastUserMessage.content), setCookie);
      case "language":
        return ndjsonResponse(createMultilingualStream(lastUserMessage.content), setCookie);
      case "ecosystem":
        return ndjsonResponse(createEcosystemStream(), setCookie);
      case "marketing":
        return ndjsonResponse(createMarketingStream(lastUserMessage.content), setCookie);
      case "company":
      case "research":
      case "build":
        break;
      case "gate":
        return ndjsonResponse(
          createGovernanceStream(
            "Request Needs a Safer Path",
            "This request needs a reviewed path before Active Mirror can continue. The public preview can generate a safe brief, checklist, or access request without processing sensitive data or unsafe instructions."
          ),
          setCookie
        );
    }

    // If no OpenAI key, fall back to mock
    if (!process.env.OPENAI_API_KEY) {
      return ndjsonResponse(createSoftwareWorkspaceStream(lastUserMessage.content), setCookie);
    }

    const SYSTEM_PROMPT = buildMirrorSystemPrompt(
      FREE_TURNS_UNLOCKED ? FREE_TURN_LIMIT : Math.max(FREE_TURN_LIMIT - nextTurnState.used, 0),
      { includePrivate: false }
    );

    let result: MirrorStreamResult;
    try {
      result = await streamObject({
        model: openai(process.env.MIRROR_OPENAI_MODEL || "gpt-4.1"),
        system: SYSTEM_PROMPT,
        messages,
        schema: mirrorSurfaceSchema,
        temperature: Number(process.env.MIRROR_MODEL_TEMPERATURE || 0.2),
        maxOutputTokens: Number(process.env.MIRROR_MAX_OUTPUT_TOKENS || 1200),
      }) as unknown as MirrorStreamResult;
    } catch (llmError) {
      console.error("[Mirror] LLM call failed, falling back to mock:", llmError);
      return ndjsonResponse(createSoftwareWorkspaceStream(lastUserMessage.content), setCookie);
    }

    const encoder = new TextEncoder();
    let streamClosed = false;
    const customStream = new ReadableStream({
      async start(controller) {
        const surface_id = "workspace_" + Math.random().toString(36).substring(7);

        const yieldEnvelope = (envelope: StreamEnvelope) => {
          if (streamClosed) return false;
          try {
            enqueueEnvelope(controller, encoder, envelope);
            return true;
          } catch {
            streamClosed = true;
            return false;
          }
        };

        const closeStream = () => {
          if (streamClosed) return;
          streamClosed = true;
          try {
            controller.close();
          } catch {
            // Client already cancelled the stream.
          }
        };

        // Track incremental state to avoid duplicates
        const VALID_TYPES = new Set(["artifact_node", "browser_node", "chart_node", "governance_node", "lead_node", "graph_node"]);
        const emittedThoughts = new Set<string>();
        const emittedNodeIds = new Set<string>();
        const lastNodeBody: Record<string, string> = {};
        const lastNodeTitle: Record<string, string> = {};

        try {
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } }
          });
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: { "thought_process.append": "[ok] Public limits checked." }
          });
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: { "thought_process.append": "[ok] Generating the working surfaces now." }
          });
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "generated_preview",
              type: "browser_node",
              parent_id: "root_grid",
              props: {
                agent_id: "ActiveMirror",
                title: workspaceProfile(lastUserMessage.content).title,
                severity: "info",
              }
            }
          });
          emittedNodeIds.add("generated_preview");
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: {
              "generated_preview.title": workspaceProfile(lastUserMessage.content).title,
              "generated_preview.content": generatedPreviewContent(lastUserMessage.content),
            }
          });
          lastNodeTitle.generated_preview = workspaceProfile(lastUserMessage.content).title;
          lastNodeBody.generated_preview = generatedPreviewContent(lastUserMessage.content);
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "capability_dock",
              type: "artifact_node",
              parent_id: "root_grid",
              props: {
                agent_id: "ActiveMirror",
                title: "Capability Dock",
                severity: "info",
                surface_kind: "plugin_dock",
              }
            }
          });
          emittedNodeIds.add("capability_dock");
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: {
              "capability_dock.title": "Capability Dock",
              "capability_dock.content": JSON.stringify({ lanes: pluginLanesForPrompt(lastUserMessage.content) }, null, 2),
            }
          });
          lastNodeTitle.capability_dock = "Capability Dock";
          lastNodeBody.capability_dock = JSON.stringify({ lanes: pluginLanesForPrompt(lastUserMessage.content) }, null, 2);
          if (shouldEmitChart(lastUserMessage.content)) {
            yieldEnvelope({
              envelope: "surfaceUpdate",
              surface_id,
              component: {
                id: "signal_map",
                type: "chart_node",
                parent_id: "root_grid",
                props: {
                  agent_id: "ActiveMirror",
                  title: "Generated Signal Map",
                  severity: "info",
                }
              }
            });
            emittedNodeIds.add("signal_map");
            yieldEnvelope({
              envelope: "dataModelUpdate",
              surface_id,
              data: {
                "signal_map.title": "Generated Signal Map",
                "signal_map.content": generatedChartContent(lastUserMessage.content),
              }
            });
            lastNodeTitle.signal_map = "Generated Signal Map";
            lastNodeBody.signal_map = generatedChartContent(lastUserMessage.content);
          }
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "one_pager",
              type: "artifact_node",
              parent_id: "root_grid",
              props: {
                agent_id: "ActiveMirror",
                title: "Downloadable One-Pager",
                severity: "info",
              }
            }
          });
          emittedNodeIds.add("one_pager");
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: {
              "one_pager.title": "Downloadable One-Pager",
              "one_pager.content": createGeneratedDocumentContent(lastUserMessage.content),
            }
          });
          lastNodeTitle.one_pager = "Downloadable One-Pager";
          lastNodeBody.one_pager = createGeneratedDocumentContent(lastUserMessage.content);
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "demo_spec",
              type: "artifact_node",
              parent_id: "root_grid",
              props: {
                agent_id: "ActiveMirror",
                title: "Downloadable Spec",
                severity: "info",
              }
            }
          });
          emittedNodeIds.add("demo_spec");
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: {
              "demo_spec.title": "Downloadable Spec",
              "demo_spec.content": createGeneratedSpecContent(lastUserMessage.content),
            }
          });
          lastNodeTitle.demo_spec = "Downloadable Spec";
          lastNodeBody.demo_spec = createGeneratedSpecContent(lastUserMessage.content);
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "export_pack",
              type: "artifact_node",
              parent_id: "root_grid",
              props: {
                agent_id: "ActiveMirror",
                title: "Downloadable Export Pack",
                severity: "info",
              }
            }
          });
          emittedNodeIds.add("export_pack");
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: {
              "export_pack.title": "Downloadable Export Pack",
              "export_pack.content": exportPackContent(lastUserMessage.content),
            }
          });
          lastNodeTitle.export_pack = "Downloadable Export Pack";
          lastNodeBody.export_pack = exportPackContent(lastUserMessage.content);
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "finish_route",
              type: "lead_node",
              parent_id: "root_grid",
              props: {
                agent_id: "ActiveMirror",
                title: "Finish Route",
                severity: "info",
              }
            }
          });
          emittedNodeIds.add("finish_route");
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: {
              "finish_route.title": "Finish Route",
              "finish_route.content": exportPackContent(lastUserMessage.content),
            }
          });
          lastNodeTitle.finish_route = "Finish Route";
          lastNodeBody.finish_route = exportPackContent(lastUserMessage.content);

          for await (const partial of result.partialObjectStream) {
            if (streamClosed) break;
            // Stream only complete public status lines, never partial model thought fragments.
            if (partial.thought_process) {
              for (const thought of partial.thought_process) {
                const publicThought = String(thought || "").trim();
                if (shouldEmitPublicThought(publicThought) && !emittedThoughts.has(publicThought)) {
                  yieldEnvelope({
                    envelope: "dataModelUpdate",
                    surface_id,
                    data: { "thought_process.append": publicThought }
                  });
                  emittedThoughts.add(publicThought);
                }
              }
            }

            // Stream new_nodes → surfaceUpdate + dataModelUpdate
            if (partial.new_nodes) {
              for (const node of partial.new_nodes) {
                if (!node || !node.id || !node.type) continue;
                if (!VALID_TYPES.has(node.type)) continue;
                if (!node.title) continue;

                // Emit structure once per node (only when id + type + title are ready)
                if (!emittedNodeIds.has(node.id)) {
                  yieldEnvelope({
                    envelope: "surfaceUpdate",
                    surface_id,
                    component: {
                      id: node.id,
                      type: node.type,
                      parent_id: "root_grid",
                      props: {
                        agent_id: node.agent_id || "ActiveMirror",
                        title: node.title || "",
                        severity: node.severity || null,
                      }
                    }
                  });
                  emittedNodeIds.add(node.id);
                }

                // Stream title updates incrementally
                if (emittedNodeIds.has(node.id) && node.title && node.title !== lastNodeTitle[node.id]) {
                  yieldEnvelope({
                    envelope: "dataModelUpdate",
                    surface_id,
                    data: { [`${node.id}.title`]: node.title }
                  });
                  lastNodeTitle[node.id] = node.title;
                }

                // Stream body content incrementally (only after structure emitted)
                if (emittedNodeIds.has(node.id) && node.body && node.body !== lastNodeBody[node.id]) {
                  yieldEnvelope({
                    envelope: "dataModelUpdate",
                    surface_id,
                    data: { [`${node.id}.content`]: node.body }
                  });
                  lastNodeBody[node.id] = node.body;
                }
              }
            }
          }

          yieldEnvelope({ envelope: "beginRendering", surface_id });
          closeStream();
        } catch (err) {
          if (streamClosed) return;
          console.error("[Mirror] Stream error:", err);
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "error_node",
              type: "governance_node",
              parent_id: "root_grid",
              props: { agent_id: "ActiveMirror", title: "Generation Paused", severity: "high" }
            }
          });
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: { "error_node.content": "Generation paused before a complete surface was returned. The public preview can continue with an unlocked workspace preview or route this request to reviewed access." }
          });
          yieldEnvelope({ envelope: "beginRendering", surface_id });
          closeStream();
        }
      },
      cancel() {
        streamClosed = true;
        // The browser navigated away or started a new request. Stop late model deltas quietly.
      },
    });

    return ndjsonResponse(customStream, setCookie);

  } catch (error) {
    console.error("[Mirror] Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
