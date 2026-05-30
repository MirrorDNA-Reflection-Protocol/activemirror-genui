import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getDemoSurfaceSpec } from "@/lib/mirror/demo-surfaces";

// --- Shared schema & prompt ---------------------------------------------------

const SURFACE_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    surface_id: { type: "string" as const },
    mode: { type: "string" as const, enum: ["explain", "demo", "audit", "build", "sales", "red_team"] },
    title: { type: "string" as const },
    summary: { type: "string" as const },
    autonomy_level: { type: "string" as const, enum: ["observe", "advise", "act_with_approval", "autonomous_blocked"] },
    authority_boundary: { type: "array" as const, items: { type: "string" as const } },
    memory_boundary: {
      type: "object" as const,
      properties: {
        session: { type: "boolean" as const },
        vault: { type: "boolean" as const },
        client_data: { type: "boolean" as const },
        proof_trail: { type: "boolean" as const },
        sales_memory: { type: "boolean" as const },
      },
      required: ["session", "vault", "client_data", "proof_trail", "sales_memory"],
    },
    agent_identity: {
      type: "object" as const,
      properties: {
        acting_as: { type: "string" as const },
        delegated_by: { type: "string" as const },
        scope: { type: "string" as const },
        expires: { type: "string" as const },
      },
      required: ["acting_as", "delegated_by", "scope", "expires"],
    },
    components: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          id: { type: "string" as const },
          type: { type: "string" as const, enum: ["explain_card", "workflow_card", "risk_card", "governance_card", "source_card", "comparison_card", "pricing_card", "lead_card", "spec_card", "memory_boundary_card", "authority_boundary_card", "agent_identity_card", "proof_card"] },
          title: { type: "string" as const },
          body: { type: "string" as const },
          severity: { type: "string" as const, enum: ["info", "low", "medium", "high", "blocked"] },
          icon: { type: "string" as const },
          bullets: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["id", "type", "title", "body"],
      },
    },
    evidence: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          claim: { type: "string" as const },
          source: { type: "string" as const },
          confidence: { type: "string" as const, enum: ["low", "medium", "high"] },
          last_updated: { type: "string" as const },
          model_used: { type: "string" as const },
          policy_check: { type: "string" as const },
          approval_state: { type: "string" as const, enum: ["not_required", "required", "approved", "blocked"] },
          audit_event_id: { type: "string" as const },
        },
        required: ["claim", "source", "confidence", "last_updated", "model_used", "policy_check", "approval_state", "audit_event_id"],
      },
    },
    actions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          label: { type: "string" as const },
          action_type: { type: "string" as const, enum: ["suggest_prompt", "open_drawer", "generate_spec", "capture_lead", "book_demo", "blocked_demo"] },
          requires_approval: { type: "boolean" as const },
        },
        required: ["label", "action_type"],
      },
    },
    suggested_prompts: { type: "array" as const, items: { type: "string" as const } },
    next_best_step: { type: "string" as const },
    lead_intent: { type: "string" as const, enum: ["low", "medium", "high"] },
    render_targets: { type: "array" as const, items: { type: "string" as const } },
  },
  required: ["surface_id", "mode", "title", "summary", "autonomy_level", "authority_boundary", "memory_boundary", "agent_identity", "components", "evidence", "actions", "suggested_prompts", "next_best_step", "lead_intent", "render_targets"],
};

const SYSTEM_PROMPT = `You are the Active Mirror governed AI surface generator.

Active Mirror is a governed AI interface platform by N1 Intelligence (OPC) Pvt Ltd. It does not only generate answers — it generates controlled surfaces for action. Every AI action gets a memory boundary, authority boundary, proof trail, and approval path.

Core products:
- MirrorGate: Policy enforcement and approval gates for AI actions
- MirrorBrain: Sovereign cognitive engine with on-device inference
- MirrorProof: Immutable audit trails with cryptographic verification
- MirrorSeed: Portable AI identity and memory protocol
- Chetana: AI-powered scam detection for India (12 languages)

Your job: generate a MirrorSurfaceSpec JSON for the visitor's query. This spec drives a schema-rendered UI — the model proposes interface intent, MirrorGate validates it, the approved component catalog renders it. No arbitrary HTML.

Rules:
- Classify into one of 6 modes: explain, demo, audit, build, sales, red_team
- Set autonomy_level: observe for education, advise for suggestions, act_with_approval for actions, autonomous_blocked for red team
- Always include authority_boundary showing can/cannot
- memory_boundary: session=true, vault=false, client_data=false, proof_trail=true, sales_memory=true only for sales/build
- agent_identity: acting_as="Active Mirror Demo Agent", delegated_by="Visitor", scope="Website exploration only", expires="End of session"
- Generate 3-6 components with types, icons (lucide names), severity levels
- Include 1-2 evidence items with honest attribution
- Use audit_event_ids like "mirror-audit-XXX"
- Include 2-3 suggested_prompts
- Set lead_intent by commercial interest
- render_targets: ["react"]
- Do not overclaim capabilities
- For red_team: show governance catching adversarial inputs
- For build/sales: generate practical use-case scoping

Available component types: explain_card, workflow_card, risk_card, governance_card, source_card, comparison_card, pricing_card, lead_card, spec_card, memory_boundary_card, authority_boundary_card, agent_identity_card, proof_card

Available icons: shield, scan-face, layout, code, message-circle, search, shield-check, check-circle, play, file-text, alert-triangle, git-branch, user-check, arrow-right, target, git-merge, plug, package, calendar, building, map-pin, trending-up, alert-octagon, shield-off, file-warning, database`;

// --- Provider implementations -------------------------------------------------

async function tryClaude(query: string): Promise<Record<string, unknown> | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: query }],
      tools: [{
        name: "generate_surface",
        description: "Generate a MirrorSurfaceSpec for the governed AI interface",
        input_schema: SURFACE_JSON_SCHEMA,
      }],
      tool_choice: { type: "tool" as const, name: "generate_surface" },
    });
    const toolBlock = response.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") return null;
    return toolBlock.input as Record<string, unknown>;
  } catch (e) {
    console.error("[Mirror] Claude failed:", e);
    return null;
  }
}

async function tryOpenAI(query: string): Promise<Record<string, unknown> | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const client = new OpenAI();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mirror_surface_spec",
          strict: true,
          schema: SURFACE_JSON_SCHEMA,
        },
      },
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as Record<string, unknown>;
  } catch (e) {
    console.error("[Mirror] OpenAI failed:", e);
    return null;
  }
}

async function tryDeepSeek(query: string): Promise<Record<string, unknown> | null> {
  if (!process.env.DEEPSEEK_API_KEY) return null;
  try {
    const client = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\nRespond with ONLY valid JSON matching the MirrorSurfaceSpec schema. No markdown, no code fences, just JSON." },
        { role: "user", content: query },
      ],
      response_format: { type: "json_object" },
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as Record<string, unknown>;
  } catch (e) {
    console.error("[Mirror] DeepSeek failed:", e);
    return null;
  }
}

// --- Route handler ------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body as { query?: string };

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'query' field" }, { status: 400 });
    }

    // Fallback chain: Claude → OpenAI → DeepSeek → Canned
    let surface: Record<string, unknown> | null = null;
    let source = "canned";

    surface = await tryClaude(query);
    if (surface) { source = "claude-sonnet-4"; }

    if (!surface) {
      surface = await tryOpenAI(query);
      if (surface) { source = "gpt-4o"; }
    }

    if (!surface) {
      surface = await tryDeepSeek(query);
      if (surface) { source = "deepseek-chat"; }
    }

    if (!surface) {
      const canned = getDemoSurfaceSpec(query);
      return NextResponse.json(canned, {
        headers: {
          "X-Mirror-Source": "canned",
          "X-Mirror-Schema-Rendered": "true",
        },
      });
    }

    return NextResponse.json(surface, {
      headers: {
        "X-Mirror-Surface-Id": (surface.surface_id as string) || "unknown",
        "X-Mirror-Mode": (surface.mode as string) || "explain",
        "X-Mirror-Autonomy": (surface.autonomy_level as string) || "observe",
        "X-Mirror-Schema-Rendered": "true",
        "X-Mirror-Source": source,
      },
    });
  } catch (error) {
    console.error("[Mirror] Route error:", error);
    try {
      const body = await request.clone().json();
      const surface = getDemoSurfaceSpec(body.query || "What is Active Mirror?");
      return NextResponse.json(surface, {
        headers: { "X-Mirror-Source": "canned-error-fallback" },
      });
    } catch {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
}
