import type { LeadQualification, LeadQualificationInput } from "./leadQualification";

export type LeadFollowUp = {
  schemaVersion: "active_mirror.lead_followup.v1";
  responseWindow: "same_day" | "next_business_day" | "fit_review";
  operatorNextAction: string;
  proofSurface: string;
  riskBoundary: string;
  scopeQuestions: string[];
  firstReplySubject: string;
  firstReplyBody: string;
  buyerStatus: string;
};

export function followUpReplyMailto(email = "", followUp?: LeadFollowUp) {
  if (!email || !followUp) return "";
  const subject = encodeURIComponent(followUp.firstReplySubject);
  const body = encodeURIComponent(followUp.firstReplyBody);
  return `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
}

function compact(value = "", fallback = "the workflow") {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 220) : fallback;
}

function firstName(value = "") {
  return value.trim().split(/\s+/)[0] || "";
}

function proofSurfaceFor(input: LeadQualificationInput) {
  const text = `${input.focus || ""} ${input.useCase || ""} ${input.proofTarget || ""} ${input.desiredArtifact || ""}`.toLowerCase();
  if (/vendor|procurement|board|source|evidence|brief/.test(text)) return "reviewable evidence workspace";
  if (/private|file|confidential|local|on-prem/.test(text)) return "private-context review workspace";
  if (/automation|repeatable|workflow|handoff/.test(text)) return "repeatable workflow workspace";
  if (/platform|routing|memory|permission|control/.test(text)) return "controlled AI workspace layer";
  return "72-hour proof workspace";
}

function responseWindowFor(qualification: LeadQualification) {
  if (qualification.grade === "priority") return "same_day";
  if (qualification.grade === "qualified") return "next_business_day";
  return "fit_review";
}

export function buildLeadFollowUp(input: LeadQualificationInput, qualification: LeadQualification): LeadFollowUp {
  const proofSurface = proofSurfaceFor(input);
  const responseWindow = responseWindowFor(qualification);
  const name = firstName(input.name);
  const companyOrWorkflow = compact(input.company || input.useCase, "your workflow");
  const workflow = compact(input.useCase);
  const failureMode = compact(input.failureMode, "the current AI gap");
  const approvedInputs = compact(input.approvedInputs, "the first approved input boundary");
  const desiredArtifact = compact(input.desiredArtifact || proofSurface, proofSurface);
  const proofTarget = compact(input.proofTarget, "a proof target we can inspect");
  const riskBoundary = `No private files, account access, device access, or external sends before explicit approval. First-pass input boundary: ${approvedInputs}.`;
  const scopeQuestions = [
    `Can we confirm the first deliverable is ${desiredArtifact}?`,
    `What exactly may we use in the first 72 hours: ${approvedInputs}?`,
    "Who approves the result before it is reused, shared, or sent?",
  ];
  const greeting = name ? `Hi ${name},` : "Hi,";

  return {
    schemaVersion: "active_mirror.lead_followup.v1",
    responseWindow,
    operatorNextAction: qualification.nextAction,
    proofSurface,
    riskBoundary,
    scopeQuestions,
    firstReplySubject: `Active Mirror scope: ${companyOrWorkflow}`,
    firstReplyBody: [
      greeting,
      "",
      `I saw the workflow you sent: ${workflow}`,
      "",
      `The current AI gap I have is: ${failureMode}.`,
      "",
      `The strongest first proof looks like a ${proofSurface}. The success target I have is: ${proofTarget}.`,
      "",
      "Before I call it a fit, I need three things:",
      `1. ${scopeQuestions[0]}`,
      `2. ${scopeQuestions[1]}`,
      `3. ${scopeQuestions[2]}`,
      "",
      `Boundary: ${riskBoundary}`,
      "",
      "If those answers line up, the next step is a scoped 72-hour proof sprint around one real workflow.",
      "",
      "Paul",
    ].join("\n"),
    buyerStatus:
      responseWindow === "same_day"
        ? "Captured. This looks like a high-fit proof-sprint request; we review the workflow and reply with the first scope question."
        : "Captured. We review the workflow for fit and reply with the smallest proof surface worth building.",
  };
}
