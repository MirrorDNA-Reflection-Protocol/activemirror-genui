export type MirrorMode =
  | "explain"
  | "demo"
  | "audit"
  | "build"
  | "sales"
  | "red_team";

export type AutonomyLevel =
  | "observe"
  | "advise"
  | "act_with_approval"
  | "autonomous_blocked";

export type LeadIntent = "low" | "medium" | "high";

export type MemoryBoundary = {
  session: boolean;
  vault: boolean;
  client_data: boolean;
  proof_trail: boolean;
  sales_memory: boolean;
};

export type AgentIdentity = {
  acting_as: string;
  delegated_by: string;
  scope: string;
  expires: string;
};

export type EvidenceItem = {
  claim: string;
  source: string;
  confidence: "low" | "medium" | "high";
  last_updated: string;
  model_used: string;
  policy_check: string;
  approval_state: "not_required" | "required" | "approved" | "blocked";
  audit_event_id: string;
};

export type MirrorAction = {
  label: string;
  action_type:
    | "suggest_prompt"
    | "open_drawer"
    | "generate_spec"
    | "capture_lead"
    | "book_demo"
    | "blocked_demo";
  payload?: Record<string, unknown>;
  requires_approval?: boolean;
};

export type MirrorComponent = {
  id: string;
  type:
    | "explain_card"
    | "workflow_card"
    | "risk_card"
    | "governance_card"
    | "source_card"
    | "comparison_card"
    | "pricing_card"
    | "lead_card"
    | "spec_card"
    | "memory_boundary_card"
    | "authority_boundary_card"
    | "agent_identity_card"
    | "proof_card"
    | "data_table_card"
    | "chart_card"
    | "form_card"
    | "proof_map_card"
    | "kyc_risk_card";
  title: string;
  body: string;
  severity?: "info" | "low" | "medium" | "high" | "blocked";
  icon?: string;
  bullets?: string[];
  metadata?: Record<string, unknown>;
};

export type MirrorSurfaceSpec = {
  thought_process?: string[];
  surface_id: string;
  mode: MirrorMode;
  title: string;
  summary: string;
  autonomy_level: AutonomyLevel;
  authority_boundary: string[];
  memory_boundary: MemoryBoundary;
  agent_identity: AgentIdentity;
  components: MirrorComponent[];
  evidence: EvidenceItem[];
  actions: MirrorAction[];
  suggested_prompts: string[];
  next_best_step: string;
  lead_intent: LeadIntent;
  render_targets: Array<
    | "react"
    | "a2ui_future"
    | "ag_ui_future"
    | "flutter_future"
    | "telegram_future"
    | "obsidian_future"
    | "cli_future"
  >;
};
