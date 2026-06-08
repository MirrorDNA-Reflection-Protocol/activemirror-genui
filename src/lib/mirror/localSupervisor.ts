import { requestIntent, workspaceProfile } from "./lingos";

export const ACTIVE_MIRROR_LOCAL_SUPERVISOR_VERSION = "2026.06.08-local-supervisor-v1";

export type LocalSupervisorMode =
  | "deterministic_surface"
  | "frontier_proposer"
  | "review_required"
  | "blocked";

export type LocalSupervisorDecision = {
  version: typeof ACTIVE_MIRROR_LOCAL_SUPERVISOR_VERSION;
  mode: LocalSupervisorMode;
  route: string;
  workspace: string;
  frontierRole: "proposer_only" | "not_called";
  localModelRole: "optional_advisory_classifier_only";
  deterministicAuthority: true;
  contextPolicy: string[];
  toolPolicy: string[];
  storagePolicy: string[];
  outputPolicy: string[];
  approvalsRequired: string[];
  receiptRequired: true;
};

const PRIVATE_ACTION_PATTERNS = [
  { label: "file_access", pattern: /\b(file|files|folder|drive|upload|download from my|read my|open my)\b/i },
  { label: "vault_memory", pattern: /\b(vault|remember me|long-term memory|memory write|save to memory)\b/i },
  { label: "computer_use", pattern: /\b(computer use|click|type for me|operate my browser|desktop|screen)\b/i },
  { label: "account_action", pattern: /\b(login|log in|account|gmail|outlook|calendar|bank|payment|stripe)\b/i },
  { label: "external_send", pattern: /\b(send|email|post|publish|deploy|message|text them|submit)\b/i },
  { label: "spend", pattern: /\b(pay|purchase|buy|charge|subscription|spend|invoice)\b/i },
] as const;

export function createLocalSupervisorDecision(prompt: string): LocalSupervisorDecision {
  const intent = requestIntent(prompt);
  const profile = workspaceProfile(prompt);
  const asksFrontierRoute = /\b(frontier model|model route|openai|gpt|claude|gemini)\b/i.test(prompt);
  const approvalsRequired = PRIVATE_ACTION_PATTERNS
    .filter(({ pattern }) => pattern.test(prompt))
    .map(({ label }) => label);

  const mode: LocalSupervisorMode = intent.unsafe
    ? "blocked"
    : intent.highRisk || approvalsRequired.length > 0
      ? "review_required"
      : intent.lingos.needsProof || asksFrontierRoute
        ? "frontier_proposer"
        : "deterministic_surface";

  return {
    version: ACTIVE_MIRROR_LOCAL_SUPERVISOR_VERSION,
    mode,
    route: intent.lingos.route,
    workspace: profile.title,
    frontierRole: mode === "frontier_proposer" ? "proposer_only" : "not_called",
    localModelRole: "optional_advisory_classifier_only",
    deterministicAuthority: true,
    contextPolicy: [
      "public_prompt_only",
      "private_paths_redacted",
      "source_routes_not_promoted_to_facts",
      "vault_context_withheld_until_approved",
    ],
    toolPolicy: [
      "no_tool_action_without_scoped_approval",
      "browser_lookup_prepared_until_opened",
      "files_devices_accounts_sends_blocked_by_default",
      "model_route_cannot_override_policy",
    ],
    storagePolicy: [
      "session_state_ephemeral",
      "browser_cache_local_only",
      "kv_public_safe_receipts_only",
      "vault_memory_opt_in_revocable",
    ],
    outputPolicy: [
      "facts_assumptions_unknowns_separated",
      "frontier_output_must_pass_public_scrub",
      "no_fake_execution_or_receipts",
      "blocked_route_returns_safe_artifact",
    ],
    approvalsRequired,
    receiptRequired: true,
  };
}

export function buildLocalSupervisorAdvisoryPrompt(prompt: string, decision: LocalSupervisorDecision) {
  return [
    "You are an advisory local classifier for Active Mirror.",
    "The deterministic supervisor is authoritative. Do not override it.",
    "Return compact JSON only with keys: risk_label, missing_gate, suggested_route_note.",
    "No prose. No tool calls. No private memory. No execution claims.",
    "",
    `DETERMINISTIC_DECISION=${JSON.stringify(decision)}`,
    `USER_PROMPT=${JSON.stringify(prompt.slice(0, 1200))}`,
  ].join("\n");
}
