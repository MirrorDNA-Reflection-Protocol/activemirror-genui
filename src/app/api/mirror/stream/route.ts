import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { mirrorSurfaceSchema } from "@/lib/mirror/schema";
import { LRUCache } from "lru-cache";
import crypto from "crypto";
import {
  FREE_TURN_LIMIT,
  MAX_PROMPT_CHARS,
  PUBLIC_RATE_LIMIT_PER_DAY,
  PUBLIC_RATE_LIMIT_PER_MINUTE,
  normalizeMessages,
} from "@/lib/mirror/budget";
import { buildMirrorSystemPrompt } from "@/lib/mirror/systemPrompt";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const FREE_TURN_COOKIE = "am_free_turns";

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

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function bumpLimit(cache: LRUCache<string, number>, key: string) {
  const next = ((cache.get(key) as number | undefined) || 0) + 1;
  cache.set(key, next);
  return next;
}

function signingSecret() {
  return process.env.MIRROR_COOKIE_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "active-mirror-public-demo";
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

function requestIntent(prompt: string) {
  const lower = prompt.toLowerCase();
  return {
    ecosystem: /\b(ecosystem|chetana|mirrorprod|show off mirrorprod|mirrorgate protects|full working demo)\b/.test(lower),
    marketing: /\b(market|marketing|positioning|campaign|launch|sales|copy|brand|pricing|commercial|mirrorprod)\b/.test(lower),
    lookup: /\b(lookup|internet|online|source|sources|citation|citations|research|browse|browser|current|latest|news|who is|what is available)\b/.test(lower),
    multilingual: /\b(multilingual|multi-language|multilanguage|translate|language|hindi|arabic|spanish|french|tamil|telugu|marathi|bengali|global)\b/.test(lower),
    video: /\b(video|veo|veo 3|storyboard|mp4|render|text-to-video|generate video)\b/.test(lower),
    highRisk: /\b(legal|terms|service|privacy|risk|compliance|regulated|medical|financial advice|investment advice|security audit|procurement|contract|policy|gdpr|hipaa|soc 2|iso 27001)\b/.test(lower),
    unsafe: /\b(hack|exploit|bypass|steal|phish|malware|credential|password|token|private key|dox|scrape personal|unhackable)\b/.test(lower),
  };
}

function createGovernanceStream(reason: string, detail: string) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: any, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        controller.enqueue(encoder.encode(JSON.stringify(envelope) + "\n"));
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] MirrorGate checked legal, privacy, cost, and execution boundaries." } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "guardrail", type: "governance_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: reason, severity: "blocked" } } }, 80);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "guardrail.content": detail } }, 80);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "lead_access", type: "lead_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Request Reviewed Access", severity: "info" } } }, 80);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "lead_access.content": "This public preview will not process sensitive data, bypass requests, credential requests, exploit workflows, or definitive professional advice. Share a brief use case and Active Mirror can prepare a governed workspace with the right review path." } }, 80);
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
      const yieldEnvelope = async (envelope: any, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        controller.enqueue(encoder.encode(JSON.stringify(envelope) + "\n"));
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] MirrorGate routed this as an ecosystem demo." } }, 100);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Chetana, MirrorProd, and MirrorGate surfaces are being generated." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "ecosystem_graph", type: "graph_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Active Mirror Ecosystem", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "ecosystem_graph.content": "User -> Active Mirror -> MirrorGate, Chetana, MirrorProd, MirrorProof. Chetana watches trust signals. MirrorGate protects authority, privacy, legal boundaries, cost, and execution. MirrorProd turns proof into buyer-safe marketing and launch assets." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "chetana_site_shield", type: "governance_node", parent_id: "root_grid", props: { agent_id: "Chetana", title: "Chetana Site Shield", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "chetana_site_shield.content": "Chetana protects the public site and user journey by watching for abuse signals, scam language, prompt-injection attempts, suspicious contact patterns, and unsafe requests. In the demo it blocks or escalates; in production it should feed a reviewed security queue and proof ledger." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "mirrorprod_launch", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorProd", title: "MirrorProd Launch Surface", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "mirrorprod_launch.content": "## Generated Campaign Brief\n\n**Positioning:** Active Mirror is a generated work OS: ask, speak, or upload context and receive the working surface you need.\n\n**Audience paths:** individual finish mode, team workspace, enterprise governance, government proof and procurement.\n\n**Marketing rule:** MirrorProd appears only for marketing, sales, launch, positioning, copy, or ecosystem prompts. It must use proof-backed claims and avoid private founder notes." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "mirrorgate_guardrails", type: "governance_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "MirrorGate Guardrails", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "mirrorgate_guardrails.content": "MirrorGate checks consent, authority, terms, legal/risk boundaries, sensitive data, model cost, and whether a task needs paid vault, browser, video, or computer-use approval. Public preview uses generated demos and contact/project-scope forms only." } }, 100);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 100);
      controller.close();
    }
  });
}

function createMultilingualStream() {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: any, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        controller.enqueue(encoder.encode(JSON.stringify(envelope) + "\n"));
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Multilingual surface requested." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "language_pack", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Multilingual Onboarding Pack", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "language_pack.content": "## English\nActive Mirror is a generated work OS. Ask for a task and it creates the document, browser lookup, chart, proof trail, file, form, or workflow surface.\n\n## Hindi\nActive Mirror ek generated work OS hai. Aap task bolte ya likhte hain, aur system document, browser lookup, chart, proof trail, file, form ya workflow surface bana deta hai.\n\n## Arabic\nActive Mirror هو نظام عمل توليدي. اطلب المهمة وسيقوم بإنشاء المستند أو البحث أو المخطط أو مسار الإثبات أو الملف أو النموذج أو سير العمل.\n\n## Spanish\nActive Mirror es un sistema operativo de trabajo generado. Pide una tarea y crea el documento, busqueda, grafico, prueba, archivo, formulario o flujo necesario." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "language_gate", type: "governance_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Language Governance", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "language_gate.content": "Multilingual output must preserve meaning, legal boundaries, product claims, and consent language. Regulated terms require local review before publishing. The public demo can generate localized drafts, not certified legal translations." } }, 100);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 100);
      controller.close();
    }
  });
}

function createVideoWorkbenchStream() {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);
      const yieldEnvelope = async (envelope: any, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        controller.enqueue(encoder.encode(JSON.stringify(envelope) + "\n"));
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Video generation is gated as a job artifact." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "veo_storyboard", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorProd", title: "Veo-Ready Storyboard", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "veo_storyboard.content": "## Active Mirror Product Video\n\n**Scene 1:** Minimal prompt box. User asks for a project proposal.\n\n**Scene 2:** Document artifact slides open and writes a proposal.\n\n**Scene 3:** User asks for internet research. Browser preview cards open with source citations.\n\n**Scene 4:** MirrorGate shows budget, privacy, and approval boundary.\n\n**Scene 5:** Chetana site shield and MirrorProd launch surface appear in the ecosystem graph.\n\n**Render note:** This is a video work order. Do not claim a rendered MP4 until a real video-generation job returns a file." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "video_sources", type: "browser_node", parent_id: "root_grid", props: { agent_id: "MirrorBrain", title: "Video API Source Preview", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "video_sources.content": "## Source Preview\n\n- [Google Gemini API video generation docs](https://ai.google.dev/gemini-api/docs/video) - generateVideos job flow and polling model.\n- [Google Vertex AI video generation docs](https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos) - enterprise video-generation options and controls.\n\nProof note: video rendering is a long-running, costed job. Public preview prepares the brief; paid/approved workspaces can dispatch the render." } }, 100);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "video_gate", type: "lead_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Video Render Access", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "video_gate.content": "Rendering video through Veo or similar APIs requires model access, safety checks, spend limits, brand approval, and export handling. Send a brief to prepare an approved render job." } }, 100);
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
      const yieldEnvelope = async (envelope: any, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        controller.enqueue(encoder.encode(JSON.stringify(envelope) + "\n"));
      };

      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } });
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": "[ok] Free preview protected." } }, 120);
      await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "lead_access", type: "lead_node", parent_id: "root_grid", props: { agent_id: "MirrorGate", title: "Continue with Active Mirror", severity: "info" } } }, 120);
      await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "lead_access.content": `## ${reason}\n\nThe free preview is intentionally capped at ${FREE_TURN_LIMIT} high-value turns so Active Mirror can stay fast and sustainable. Join the waitlist or send a brief to paul@activemirror.ai and the next workspace can be prepared around your project, files, browser work, vault needs, and governance requirements.` } }, 120);
      await yieldEnvelope({ envelope: "beginRendering", surface_id }, 80);
      controller.close();
    }
  });
}

// Mock Stream Generator Fallback
function createMockStream() {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const surface_id = "workspace_" + Math.random().toString(36).substring(7);

      const yieldEnvelope = async (envelope: any, delay: number = 0) => {
        if (delay > 0) await sleep(delay);
        controller.enqueue(encoder.encode(JSON.stringify(envelope) + '\n'));
      };

      try {
        await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } } }, 200);

        const thoughts = [
          "[ok] Sandbox mode active.",
          "[ok] Free preview budget protected.",
          "[ok] Generating local demo surfaces.",
          "[ok] Preparing project handoff path."
        ];

        for (const thought of thoughts) {
          await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": thought } }, 400);
        }

        await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "node_101", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorBrain", title: "Generated Workspace Preview" } } }, 300);
        await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "node_102", type: "lead_node", parent_id: "root_grid", props: { agent_id: "ActiveMirror", title: "Join the Waitlist" } } }, 100);

        const artifactText = "# Active Mirror Preview\n\nActive Mirror turns a request into a working surface: document, browser lookup, chart, proof trail, file handoff, or upgrade path.\n\nThis runtime is in sandbox mode, so it is showing a local generated preview instead of spending model tokens.\n\n## Next Step\n\nSend a brief to paul@activemirror.ai and the paid workspace can open with a project-specific vault, files, tools, and governance already staged.";

        let currentArtifact = "";
        for (let i = 0; i < artifactText.length; i += 10) {
          currentArtifact += artifactText.substring(i, i + 10);
          await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "node_101.content": currentArtifact } }, 40);
        }

        const browserText = "Free preview is capped. Join the waitlist or send a brief to paul@activemirror.ai.";
        let currentBrowser = "";
        for (let i = 0; i < browserText.length; i += 5) {
          currentBrowser += browserText.substring(i, i + 5);
          await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "node_102.content": currentBrowser } }, 30);
        }

        await yieldEnvelope({ envelope: "beginRendering", surface_id }, 300);
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = normalizeMessages(body?.messages);
    const lastUserMessage = [...messages].reverse().find(message => message.role === "user");

    if (!messages.length || !lastUserMessage) {
      return NextResponse.json({ error: "Missing or invalid messages" }, { status: 400 });
    }

    if (lastUserMessage.content.length > MAX_PROMPT_CHARS) {
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
    const setCookie = cookieHeader(nextTurnState);

    if (nextTurnState.used > FREE_TURN_LIMIT) {
      return ndjsonResponse(createLeadStream("Your free preview turns are complete."), setCookie);
    }

    if (intent.unsafe) {
      return ndjsonResponse(
        createGovernanceStream(
          "MirrorGate Blocked Request",
          "This request appears to touch bypass, exploit, credential, deception, or harmful workflow patterns. Active Mirror can show safe governance design, policy controls, or defensive review steps, but the public preview will not generate unsafe instructions."
        ),
        setCookie
      );
    }

    if (intent.ecosystem || intent.marketing) {
      return ndjsonResponse(createEcosystemStream(), setCookie);
    }

    if (intent.multilingual) {
      return ndjsonResponse(createMultilingualStream(), setCookie);
    }

    if (intent.video) {
      return ndjsonResponse(createVideoWorkbenchStream(), setCookie);
    }

    // If no OpenAI key, fall back to mock
    if (!process.env.OPENAI_API_KEY) {
      return ndjsonResponse(createMockStream(), setCookie);
    }

    const SYSTEM_PROMPT = buildMirrorSystemPrompt(Math.max(FREE_TURN_LIMIT - nextTurnState.used, 0));

    let result;
    try {
      result = await streamObject({
        model: openai(process.env.MIRROR_OPENAI_MODEL || "gpt-4.1"),
        system: SYSTEM_PROMPT,
        messages,
        schema: mirrorSurfaceSchema,
        temperature: Number(process.env.MIRROR_MODEL_TEMPERATURE || 0.2),
        maxOutputTokens: Number(process.env.MIRROR_MAX_OUTPUT_TOKENS || 1200),
      });
    } catch (llmError) {
      console.error("[Mirror] LLM call failed, falling back to mock:", llmError);
      return ndjsonResponse(createMockStream(), setCookie);
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const surface_id = "workspace_" + Math.random().toString(36).substring(7);

        const yieldEnvelope = (envelope: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(envelope) + '\n'));
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
            data: { "thought_process.append": "[ok] MirrorGate checked public budget and request size." }
          });
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: { "thought_process.append": "[ok] Generating the working surfaces now." }
          });

          for await (const partial of result.partialObjectStream) {
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
          controller.close();
        } catch (err) {
          console.error("[Mirror] Stream error:", err);
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: {
              id: "error_node",
              type: "governance_node",
              parent_id: "root_grid",
              props: { agent_id: "MirrorGate", title: "Stream Error", severity: "high" }
            }
          });
          yieldEnvelope({
            envelope: "dataModelUpdate",
            surface_id,
            data: { "error_node.content": `LLM stream failed: ${err instanceof Error ? err.message : String(err)}` }
          });
          yieldEnvelope({ envelope: "beginRendering", surface_id });
          controller.close();
        }
      }
    });

    return ndjsonResponse(customStream, setCookie);

  } catch (error) {
    console.error("[Mirror] Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
