import { z } from "zod";

export const mirrorSurfaceSchema = z.object({
  thought_process: z.array(z.string()).describe("List of sequential reasoning steps or actions taken by the AI. Generate these FIRST before other fields."),
  surface_id: z.string(),
  mode: z.enum(["explain", "demo", "audit", "build", "sales", "red_team"]),
  title: z.string(),
  summary: z.string(),
  autonomy_level: z.enum(["observe", "advise", "act_with_approval", "autonomous_blocked"]),
  authority_boundary: z.array(z.string()),
  memory_boundary: z.object({
    session: z.boolean(),
    vault: z.boolean(),
    client_data: z.boolean(),
    proof_trail: z.boolean(),
    sales_memory: z.boolean(),
  }),
  agent_identity: z.object({
    acting_as: z.string(),
    delegated_by: z.string(),
    scope: z.string(),
    expires: z.string(),
  }),
  components: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "explain_card", "workflow_card", "risk_card", "governance_card", 
        "source_card", "comparison_card", "pricing_card", "lead_card", 
        "spec_card", "memory_boundary_card", "authority_boundary_card", 
        "agent_identity_card", "proof_card", "data_table_card", 
        "chart_card", "form_card", "proof_map_card", "kyc_risk_card"
      ]),
      title: z.string(),
      body: z.string(),
      severity: z.enum(["info", "low", "medium", "high", "blocked"]).nullable(),
      icon: z.string().nullable(),
      bullets: z.array(z.string()).nullable(),
      metadata: z.object({
        columns: z.array(z.string()).nullable(),
        rows: z.array(z.array(z.string())).nullable(),
        data: z.array(z.object({ name: z.string(), value: z.number() })).nullable(),
        fields: z.array(z.object({ name: z.string(), type: z.string(), placeholder: z.string() })).nullable(),
        nodes: z.array(z.object({ hash: z.string(), timestamp: z.string(), label: z.string(), verified: z.boolean() })).nullable(),
        delegated_by: z.string().nullable(),
        scope: z.string().nullable(),
        expires: z.string().nullable(),
        entity_id: z.string().nullable(),
        risk_score: z.string().nullable(),
        lead_id: z.string().nullable(),
        price: z.string().nullable(),
        beta: z.string().nullable(),
        code: z.string().nullable(),
        signature: z.string().nullable(),
      }).nullable(),
    })
  ),
  evidence: z.array(
    z.object({
      claim: z.string(),
      source: z.string(),
      confidence: z.enum(["low", "medium", "high"]),
      last_updated: z.string(),
      model_used: z.string(),
      policy_check: z.string(),
      approval_state: z.enum(["not_required", "required", "approved", "blocked"]),
      audit_event_id: z.string(),
    })
  ),
  actions: z.array(
    z.object({
      label: z.string(),
      action_type: z.enum(["suggest_prompt", "open_drawer", "generate_spec", "capture_lead", "book_demo", "blocked_demo"]),
      requires_approval: z.boolean(),
    })
  ),
  suggested_prompts: z.array(z.string()),
  next_best_step: z.string(),
  lead_intent: z.enum(["low", "medium", "high"]),
  render_targets: z.array(z.string()),
});
