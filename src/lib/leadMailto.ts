export const LEAD_REQUEST_TO = "paul@activemirror.ai";

export type LeadRequestMailtoInput = {
  name?: string;
  email?: string;
  company?: string;
  sensitivity?: string;
  infrastructure?: string;
  timeline?: string;
  decisionRole?: string;
  focus?: string;
  failureMode?: string;
  approvedInputs?: string;
  desiredArtifact?: string;
  proofTarget?: string;
  useCase?: string;
};

function value(input?: string) {
  return String(input || "").trim();
}

function workflowOnly(input?: string) {
  const text = value(input);
  return text.split(/\n\s*\nSensitivity:/)[0].trim();
}

function subjectFor(input: LeadRequestMailtoInput) {
  const owner = value(input.company) || value(input.name);
  return owner ? `Active Mirror workflow request - ${owner}` : "Active Mirror workflow request";
}

function bodyFor(input: LeadRequestMailtoInput) {
  const workflow = workflowOnly(input.useCase) || "I want to scope one workflow for Active Mirror.";
  const proofTarget = value(input.proofTarget) || "A useful proof that shows whether this workflow is worth deploying.";
  const signer = value(input.name);

  return [
    "Hi Paul,",
    "",
    "I want Active Mirror to look at this workflow.",
    "",
    "Workflow request:",
    workflow,
    "",
    "What would make a 72-hour proof useful:",
    proofTarget,
    "",
    "First useful deliverable:",
    value(input.desiredArtifact) || "Evidence workspace",
    "",
    "Current AI failure:",
    value(input.failureMode) || "Sources, gaps, approvals, or handoff quality are unclear.",
    "",
    "Inputs approved for the first pass:",
    value(input.approvedInputs) || "Public or sanitized inputs only",
    "",
    "Boundary:",
    `Sensitivity: ${value(input.sensitivity) || "public-safe first"}`,
    `Where it should run: ${value(input.infrastructure) || "not sure yet"}`,
    `Timeline: ${value(input.timeline) || "this month"}`,
    `Decision role: ${value(input.decisionRole) || "I can sponsor or approve it"}`,
    `Focus: ${value(input.focus) || "general"}`,
    "",
    "Contact:",
    `Name: ${value(input.name)}`,
    `Email: ${value(input.email)}`,
    `Organization: ${value(input.company)}`,
    "",
    "Please reply with the fit/no-fit view, the first scope question, and what you would need to start.",
    "",
    "Thanks,",
    signer,
  ].join("\n");
}

export function buildLeadRequestMailto(input: LeadRequestMailtoInput, to = LEAD_REQUEST_TO) {
  const subject = encodeURIComponent(subjectFor(input));
  const body = encodeURIComponent(bodyFor(input));
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
