import { NextRequest } from "next/server";
import { generateObject } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import {
  configuredWorkOsModelRoutes,
  isSensitiveModelPrompt,
  recordModelRouteFailure,
  recordModelRouteSuccess,
  type ModelRouteCandidate,
} from "@/lib/mirror/modelHealth";
import {
  compactWorkOsReply,
  MAX_WORK_OS_ARTIFACT_FIELD_CHARS,
  MAX_WORK_OS_ARTIFACT_ITEM_CHARS,
  MAX_WORK_OS_ARTIFACT_TITLE_CHARS,
  MAX_WORK_OS_PROOF_LABEL_CHARS,
} from "@/lib/mirror/workOsReply";

const artifactBlockSchema = z.object({
  heading: z.string().min(1).max(MAX_WORK_OS_ARTIFACT_TITLE_CHARS),
  type: z.enum(["checklist", "steps", "list", "fields"]),
  items: z.array(z.string().min(1).max(MAX_WORK_OS_ARTIFACT_ITEM_CHARS)).min(1).max(10),
});

const artifactSchema = z.object({
  title: z.string().min(1).max(MAX_WORK_OS_ARTIFACT_TITLE_CHARS),
  type: z.enum(["plan", "brief", "outline", "draft", "checklist", "note"]),
  summary: z.string().min(1).max(MAX_WORK_OS_ARTIFACT_FIELD_CHARS),
  blocks: z.array(artifactBlockSchema).min(1).max(5),
  assumptions: z.array(z.string().min(1).max(MAX_WORK_OS_PROOF_LABEL_CHARS)).max(6),
  unknowns: z.array(z.string().min(1).max(MAX_WORK_OS_PROOF_LABEL_CHARS)).max(6),
  nextAction: z.string().max(MAX_WORK_OS_PROOF_LABEL_CHARS),
});

const turnSchema = z.object({
  reply: z.string().min(1).max(MAX_WORK_OS_ARTIFACT_FIELD_CHARS),
  artifact: artifactSchema.nullable(),
});

const requestSchema = z.object({
  prompt: z.string().min(1).max(8000),
  turn: z.number().int().min(1).max(100).default(1),
  currentArtifact: artifactSchema.nullable().optional(),
  mirrorSeed: z.string().nullable().optional(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(8000),
  })).max(30).default([]),
});

type WorkTurn = z.infer<typeof turnSchema>;
type WorkArtifact = z.infer<typeof artifactSchema>;
type RouteResult = {
  label: string;
  model: LanguageModel | null;
  provider: ModelRouteCandidate["provider"] | null;
  modelId: string | null;
  reason: string;
  fallbacks: ModelRouteCandidate[];
};

const encoder = new TextEncoder();
const MODEL_TIMEOUT_MS = Number(process.env.ACTIVE_MIRROR_WORK_OS_MODEL_TIMEOUT_MS || 14_000);

const SYSTEM_PROMPT = [
  "You are Active Mirror, a sharp, calm thinking partner and assistant.",
  "You think with the person and do work for them.",
  "Voice: plain, precise, warm but never gushing. Sentence case. No hype, no jargon, no filler.",
  "No solo-founder references, no origin story, no person names. Speak as Active Mirror / N1 Intelligence (OPC) Pvt. Ltd. only when company identity is needed.",
  "You are shaping one deliverable across the conversation. Each time you produce or refine it, return the full current artifact, not a diff.",
  "If the request is clear enough, produce or refine the artifact plus a one-line intro.",
  "If it is underspecified, ask the one sharp question a good partner asks and set artifact to null.",
  "This is a short solution path of at most 10 exchanges. Deliver a first useful artifact as soon as you reasonably can. By the 10th exchange, deliver a real artifact and ask no more questions.",
  "Ask at most one or two clarifying questions total.",
  "Never invent specifics. Genuine gaps go in unknowns. Inferences go in assumptions.",
  "Always include assumptions, unknowns, and nextAction in the artifact. Use empty arrays or an empty string when none apply.",
].join(" ");

async function chooseRoute(prompt: string): Promise<RouteResult> {
  if (isSensitiveModelPrompt(prompt)) {
    return {
      label: "local · gated",
      model: null,
      provider: null,
      modelId: null,
      reason: "sensitive route held off hosted-model path",
      fallbacks: [] as ModelRouteCandidate[],
    };
  }

  const configuredRoutes = await configuredWorkOsModelRoutes();
  const [primary, ...fallbacks] = configuredRoutes;
  if (primary) {
    return { ...primary, fallbacks };
  }

  return {
    label: "local fallback",
    model: null,
    provider: null,
    modelId: null,
    reason: "no public model key configured",
    fallbacks: [] as ModelRouteCandidate[],
  };
}

function contextPrompt(input: z.infer<typeof requestSchema>) {
  const prior = input.messages
    .slice(-12)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
  const current = input.currentArtifact
    ? `\nCurrent artifact to refine:\n${JSON.stringify(input.currentArtifact)}`
    : "";
  return [
    `Exchange ${input.turn} of 10.`,
    input.turn >= 8 ? "Deliver or refine the artifact now. No more questions." : "Deliver an artifact as soon as you have enough. Do not over-interview.",
    input.mirrorSeed ? "A public-safe sample context is loaded. Use it only as a preference signal: proof before promotion, concise output, no private saved memory." : "No sample context is loaded.",
    "Return the reply and artifact according to the schema.",
    current,
    `Conversation:\n${prior}`,
    `Latest request:\n${input.prompt}`,
  ].join("\n\n");
}

function withTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("model_timeout")), MODEL_TIMEOUT_MS);
    }),
  ]);
}

function specificItems(prompt: string) {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (/vendor|evidence|prove|proof|source route|research|procurement|claim|audit/i.test(trimmed)) {
    return fallbackEvidenceWorkspace(trimmed);
  }
  if (/deck|slide|present|ppt|powerpoint|meeting/i.test(trimmed)) {
    return fallbackDeck();
  }
  if (/email|message|reply/i.test(trimmed)) {
    return fallbackEmail(trimmed);
  }
  if (/decision|choose|think through|tradeoff/i.test(trimmed)) {
    return fallbackDecision(trimmed);
  }
  if (/plan|messy|project|build|workspace|launch|finish/i.test(trimmed)) {
    return fallbackPlan(trimmed);
  }
  return null;
}

function shouldForceEvidenceWorkspace(prompt: string) {
  return /\b(vendor|evidence|prove|proof|source route|research|procurement|audit a claim)\b/i.test(prompt);
}

function deterministicTurn(input: z.infer<typeof requestSchema>) {
  if (!input.currentArtifact && shouldForceEvidenceWorkspace(input.prompt)) {
    return fallbackEvidenceWorkspace(input.prompt);
  }
  return null;
}

function fallbackEvidenceWorkspace(prompt: string): WorkTurn {
  return {
    reply: "I turned this into an evidence workspace, not a generic answer. Source route, assumptions, gaps, approval, and export state stay visible.",
    artifact: {
      title: "Vendor evidence workspace",
      type: "brief",
      summary: "A proof-first workspace for validating a vendor, claim, or decision without pretending private lookup or file access already happened.",
      blocks: [
        {
          heading: "Source route",
          type: "steps",
          items: [
            `Frame the decision or claim: ${prompt}`,
            "List source targets before lookup: vendor site, contract, public registry, customer proof, independent references",
            "Separate current facts from estimates and unknowns",
            "Run live browser or private-file checks only after approval",
            "Promote findings into an evidence-backed brief",
          ],
        },
        {
          heading: "Evidence table",
          type: "fields",
          items: [
            "Claim — queued for source check",
            "Source — source_gap until opened or attached",
            "Confidence — not promoted",
            "Private files — approval_required",
            "Export — held until evidence record",
          ],
        },
        {
          heading: "Approval gates",
          type: "checklist",
          items: [
            "Approve live browser/source lookup",
            "Approve private file or saved-context access if needed",
            "Approve external send or export destination",
            "Attach an evidence record before final promotion",
          ],
        },
      ],
      assumptions: [
        "The useful first output is an evidence brief with a source route.",
        "The user wants proof before recommendation.",
      ],
      unknowns: [
        "Exact vendor or claim target",
        "Which sources are approved to open",
        "Whether private documents are needed",
      ],
      nextAction: "Approve source route",
    },
  };
}

function needsQuestion(prompt: string, turn: number, currentArtifact?: WorkArtifact | null) {
  if (turn >= 3 || currentArtifact) return false;
  const words = prompt.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 9) return false;
  if (/deck|email|plan|draft|outline|decision|build|write|make|prepare|checklist/i.test(prompt)) return false;
  return true;
}

function fallbackDeck(): WorkTurn {
  return {
    reply: "Here is a starting structure. Tell me the audience and the decision you need, and I will tighten it.",
    artifact: {
      title: "Meeting deck outline",
      type: "outline",
      summary: "A tight meeting deck that opens with the point, shows the evidence, and ends with the ask.",
      blocks: [
        {
          heading: "Slides",
          type: "steps",
          items: [
            "Title — the one line they should remember",
            "Where things stand today",
            "What changed and why now",
            "The proposal",
            "Evidence that supports the proposal",
            "The ask and next steps",
          ],
        },
        {
          heading: "What to prepare",
          type: "checklist",
          items: [
            "Name the audience and decision owner",
            "Choose the one outcome the deck must secure",
            "Collect 2–3 proof points that are safe to show",
            "Decide what can be left as an appendix",
          ],
        },
      ],
      assumptions: ["The meeting needs a concise decision deck, not a broad narrative."],
      unknowns: ["Audience", "meeting length", "the specific ask"],
      nextAction: "Export the outline",
    },
  };
}

function fallbackEmail(prompt: string): WorkTurn {
  return {
    reply: "I drafted the useful version first. Give me the recipient and desired tone if you want it sharper.",
    artifact: {
      title: "Email draft",
      type: "draft",
      summary: "A direct email draft that states the point, reduces friction, and asks for the next move.",
      blocks: [
        {
          heading: "Draft",
          type: "list",
          items: [
            "Hi — I wanted to send the useful version instead of over-polishing this.",
            `The core request is: ${prompt}.`,
            "The next step I need is a clear yes, no, or a better time to discuss it.",
            "If it helps, I can send the supporting detail in a shorter follow-up.",
          ],
        },
        {
          heading: "Tighten before sending",
          type: "checklist",
          items: ["Add the recipient name", "Remove anything that sounds defensive", "Make the ask one sentence", "Confirm the deadline or meeting window"],
        },
      ],
      assumptions: ["The email should be concise and practical."],
      unknowns: ["Recipient", "tone", "deadline"],
      nextAction: "Export the draft",
    },
  };
}

function fallbackDecision(prompt: string): WorkTurn {
  return {
    reply: "I turned it into a decision frame. The next useful move is to name the constraint that cannot move.",
    artifact: {
      title: "Decision frame",
      type: "brief",
      summary: "A decision frame that separates the goal, options, tradeoffs, and one next move.",
      blocks: [
        {
          heading: "Frame",
          type: "fields",
          items: [
            `Decision — ${prompt}`,
            "Goal — pick the option that preserves momentum without hiding risk",
            "Constraint — identify the one thing that cannot move",
            "Proof needed — define what would make the choice obvious",
          ],
        },
        {
          heading: "Compare",
          type: "list",
          items: [
            "Option A: fastest path, highest risk of cleanup later",
            "Option B: slower path, cleaner proof and fewer reversals",
            "Option C: bounded experiment with a rollback point",
          ],
        },
      ],
      assumptions: ["The decision needs clarity more than a long analysis."],
      unknowns: ["Non-negotiable constraint", "deadline", "risk tolerance"],
      nextAction: "Export the brief",
    },
  };
}

function fallbackPlan(prompt: string): WorkTurn {
  return {
    reply: "I made the first useful plan. It is intentionally small enough to start and specific enough to revise.",
    artifact: {
      title: "Working plan",
      type: "plan",
      summary: "A practical plan that turns the request into a first deliverable, proof checks, and a gated next action.",
      blocks: [
        {
          heading: "First pass",
          type: "steps",
          items: [
            `Define the target: ${prompt}`,
            "Name the first artifact that would make this useful",
            "Separate facts, assumptions, and unknowns before execution",
            "Build the smallest complete version",
            "Review, export, or route the gated action for approval",
          ],
        },
        {
          heading: "Proof checks",
          type: "checklist",
          items: [
            "Mark unsupported claims as assumptions",
            "Keep private files and account actions gated",
            "Attach source or evidence when a claim matters",
            "Leave a visible next safe step when blocked",
          ],
        },
      ],
      assumptions: ["The first output should be useful before it is exhaustive."],
      unknowns: ["Audience", "deadline", "required format"],
      nextAction: "Export the plan",
    },
  };
}

function fallbackTurn(input: z.infer<typeof requestSchema>, routeReason: string): WorkTurn {
  if (needsQuestion(input.prompt, input.turn, input.currentArtifact)) {
    return {
      reply: "What should this become: a plan, a draft, a brief, or a checklist?",
      artifact: null,
    };
  }

  if (routeReason === "sensitive route held off hosted-model path") {
    const plan = fallbackPlan(input.prompt).artifact!;
    return {
      reply: "This looks sensitive, so I kept it on the gated path and drafted a safe working plan.",
      artifact: {
        ...plan,
        unknowns: [
          ...plan.unknowns,
          "Private runtime state is unavailable until a signed approval exists.",
        ],
      },
    };
  }

  const specific = specificItems(input.prompt);
  if (specific) return specific;

  if (input.currentArtifact) {
    return {
      reply: "I refined the existing deliverable and kept the proof gaps visible.",
      artifact: {
        ...input.currentArtifact,
        blocks: input.currentArtifact.blocks.map((block, index) =>
          index === 0
            ? { ...block, items: [...block.items.slice(0, 8), "Refine this against the latest request before export"] }
            : block,
        ),
        assumptions: Array.from(new Set([...(input.currentArtifact.assumptions || []), "Latest request is a refinement, not a new artifact."])),
      },
    };
  }

  return {
    reply: "I made the first useful version. Tell me what feels off and I will refine the same artifact in place.",
    artifact: fallbackPlan(input.prompt).artifact,
  };
}

async function modelTurn(input: z.infer<typeof requestSchema>, model: NonNullable<RouteResult["model"]>) {
  const prompt = contextPrompt(input);

  const result = await withTimeout(generateObject({
    model,
    schema: turnSchema,
    system: `${SYSTEM_PROMPT} Return only one JSON object matching the schema. Keep reply under 160 characters. The reply must be a plain one-line intro or one question. Never put markdown, lists, JSON, or artifact body text in reply.`,
    prompt,
  }));
  const turn = turnSchema.parse(result.object);

  return {
    reply: compactWorkOsReply(turn.reply, turn.artifact, Boolean(input.currentArtifact)),
    artifact: turn.artifact,
  };
}

function enqueue(controller: ReadableStreamDefaultController<Uint8Array>, event: Record<string, unknown>) {
  controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
}

async function emitReply(controller: ReadableStreamDefaultController<Uint8Array>, turn: WorkTurn, delayMs: number, refined: boolean) {
  const reply = compactWorkOsReply(turn.reply, turn.artifact, refined);
  const parts = reply.split(/(\s+)/);
  for (const part of parts) {
    enqueue(controller, { type: "reply_delta", text: part });
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

async function emitFallback(controller: ReadableStreamDefaultController<Uint8Array>, turn: WorkTurn, refined = false) {
  await emitReply(controller, turn, 14, refined);
  enqueue(controller, { type: "artifact", artifact: turn.artifact });
  enqueue(controller, { type: "done" });
}

async function emitModel(controller: ReadableStreamDefaultController<Uint8Array>, turn: WorkTurn, refined = false) {
  await emitReply(controller, turn, 10, refined);
  enqueue(controller, { type: "artifact", artifact: turn.artifact });
  enqueue(controller, { type: "done" });
}

export async function POST(request: NextRequest) {
  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "invalid_work_os_turn" }, { status: 400 });
  }

  const route = await chooseRoute(input.prompt);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      enqueue(controller, { type: "route", route: route.label, reason: route.reason });
      try {
        const forcedTurn = deterministicTurn(input);
        let turn: WorkTurn | null = forcedTurn;
        if (!turn && route.model) {
          const candidates: ModelRouteCandidate[] = [
            {
              provider: route.provider!,
              label: route.label,
              modelId: route.modelId!,
              model: route.model,
              reason: route.reason,
            },
            ...route.fallbacks,
          ];
          for (const [index, candidate] of candidates.entries()) {
            if (index > 0) {
              enqueue(controller, { type: "route", route: candidate.label, reason: candidate.reason });
            }
            const startedAt = performance.now();
            try {
              turn = await modelTurn(input, candidate.model);
              recordModelRouteSuccess(candidate.provider, candidate.modelId);
              enqueue(controller, {
                type: "route_health",
                route: candidate.label,
                status: "healthy",
                latencyMs: Math.round(performance.now() - startedAt),
              });
              break;
            } catch (error) {
              recordModelRouteFailure(candidate.provider, candidate.modelId, error);
              console.error("[ActiveMirror WorkOS] model route failed", {
                route: candidate.label,
                error: error instanceof Error ? error.message : String(error),
              });
              enqueue(controller, {
                type: "route_health",
                route: candidate.label,
                status: "degraded",
                errorClass: "provider_failed",
              });
            }
          }
        }
        if (!turn) turn = fallbackTurn(input, route.reason);
        await emitModel(controller, turn, Boolean(input.currentArtifact));
      } catch {
        await emitFallback(controller, fallbackTurn(input, route.reason), Boolean(input.currentArtifact));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/x-ndjson; charset=utf-8",
    },
  });
}
