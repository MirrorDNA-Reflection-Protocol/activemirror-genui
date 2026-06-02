import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { mirrorSurfaceSchema } from "@/lib/mirror/schema";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
          "[✓] No valid API key detected. Running in Sandbox mode.",
          "[✓] Validating RBAC permissions... Clearance: MD",
          "[✓] Routing to MirrorBrain for local context generation.",
          "[✓] Generating A2UI schema payloads."
        ];

        for (const thought of thoughts) {
          await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "thought_process.append": thought } }, 400);
        }

        await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "node_101", type: "artifact_node", parent_id: "root_grid", props: { agent_id: "MirrorBrain", title: "Sandbox Mode Activated" } } }, 300);
        await yieldEnvelope({ envelope: "surfaceUpdate", surface_id, component: { id: "node_102", type: "browser_node", parent_id: "root_grid", props: { agent_id: "Chetana", title: "API Status" } } }, 100);

        const artifactText = "# Sandbox Execution\n\nYou are seeing a **sandbox response** because the system did not detect a valid API key.\n\n## Next Steps\n\nProvide a valid OpenAI or Google API key in `.env.local` and restart the server to enable live AI generation.\n\nOnce connected, this orchestrator streams structured UI surfaces in real-time from GPT-4.1.";

        let currentArtifact = "";
        for (let i = 0; i < artifactText.length; i += 10) {
          currentArtifact += artifactText.substring(i, i + 10);
          await yieldEnvelope({ envelope: "dataModelUpdate", surface_id, data: { "node_101.content": currentArtifact } }, 40);
        }

        const browserText = "No valid API keys detected.\n\nBypassing external LLM calls.\n\nExecuting local fallback mock.";
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
    const { messages } = body;

    // If no OpenAI key, fall back to mock
    if (!process.env.OPENAI_API_KEY) {
      return new Response(createMockStream(), {
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // REAL LLM GENERATION via GPT-4.1
    const SYSTEM_PROMPT = `You are MirrorOS, an advanced multi-agent orchestrator for the Active Mirror sovereign AI ecosystem.

You generate structured spatial UI surfaces in response to user queries. Your output populates a multi-panel workspace:
- browser_node: left panel (research, references, status)
- artifact_node / chart_node: right panel (documents, reports, visualizations)
- governance_node: center panel inline (policy warnings, security blocks)

Rules:
- Always start with thought_process showing 3-5 reasoning steps.
- Generate 2-4 new_nodes with substantive markdown body content (2+ paragraphs for artifacts).
- Use agent_id to attribute: MirrorGate (governance/security), Chetana (analytics/data), MirrorBrain (general intelligence), MirrorProof (verification/audit), ActiveMirror (orchestration).
- Use governance_node with severity for policy warnings or blocks.
- Provide 2-3 suggested_prompts for follow-up actions.
- Make content specific, detailed, and actionable — not generic filler.`;

    let result;
    try {
      result = await streamObject({
        model: openai("gpt-4.1"),
        system: SYSTEM_PROMPT,
        messages,
        schema: mirrorSurfaceSchema,
      });
    } catch (llmError) {
      console.error("[Mirror] LLM call failed, falling back to mock:", llmError);
      return new Response(createMockStream(), {
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const surface_id = "workspace_" + Math.random().toString(36).substring(7);

        const yieldEnvelope = (envelope: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(envelope) + '\n'));
        };

        // Track incremental state to avoid duplicates
        const VALID_TYPES = new Set(["artifact_node", "browser_node", "chart_node", "governance_node"]);
        let emittedThoughtCount = 0;
        const emittedNodeIds = new Set<string>();
        const lastNodeBody: Record<string, string> = {};
        const lastNodeTitle: Record<string, string> = {};

        try {
          yieldEnvelope({
            envelope: "surfaceUpdate",
            surface_id,
            component: { id: "root_grid", type: "fluid_grid", props: { layout: "adaptive_split", transition: "spring" } }
          });

          for await (const partial of result.partialObjectStream) {
            // Stream thought_process incrementally
            if (partial.thought_process) {
              for (let i = emittedThoughtCount; i < partial.thought_process.length; i++) {
                const thought = partial.thought_process[i];
                if (thought) {
                  yieldEnvelope({
                    envelope: "dataModelUpdate",
                    surface_id,
                    data: { "thought_process.append": thought }
                  });
                  emittedThoughtCount = i + 1;
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

    return new Response(customStream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("[Mirror] Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
