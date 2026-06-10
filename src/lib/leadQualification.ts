export type LeadQualificationInput = {
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

export type LeadQualification = {
  score: number;
  grade: "priority" | "qualified" | "nurture" | "low_fit";
  reasons: string[];
  nextAction: string;
};

const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "icloud.com",
  "me.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "proton.me",
  "protonmail.com",
]);

function emailDomain(email = "") {
  return email.includes("@") ? email.split("@").pop()?.toLowerCase() || "" : "";
}

function hasWorkEmail(email = "") {
  const domain = emailDomain(email);
  return Boolean(domain && !PERSONAL_EMAIL_DOMAINS.has(domain));
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function rankReasons(reasons: string[]) {
  const priority = new Map([
    ["budget owner", 0],
    ["workspace handoff", 1],
    ["current AI failure named", 2],
    ["input boundary named", 3],
    ["first deliverable named", 4],
    ["urgent timeline", 5],
    ["success proof named", 6],
    ["specific workflow detail", 7],
    ["matches proof-sprint shape", 8],
    ["control-sensitive workflow", 9],
    ["internal champion", 10],
    ["near-term timeline", 11],
    ["work email", 12],
    ["organization named", 13],
    ["workflow too vague", 14],
    ["research stage", 15],
  ]);

  return [...new Set(reasons)]
    .sort((a, b) => (priority.get(a) ?? 99) - (priority.get(b) ?? 99))
    .slice(0, 5);
}

export function qualifyLead(input: LeadQualificationInput): LeadQualification {
  const reasons: string[] = [];
  const useCase = input.useCase?.trim() || "";
  const proofTarget = input.proofTarget?.trim() || "";
  const combinedText = `${useCase} ${proofTarget}`.toLowerCase();
  const timeline = (input.timeline || "").toLowerCase();
  const decisionRole = (input.decisionRole || "").toLowerCase();
  const sensitivity = (input.sensitivity || "").toLowerCase();
  const infrastructure = (input.infrastructure || "").toLowerCase();
  const focus = (input.focus || "").toLowerCase();
  const failureMode = (input.failureMode || "").toLowerCase();
  const approvedInputs = (input.approvedInputs || "").toLowerCase();
  const desiredArtifact = (input.desiredArtifact || "").toLowerCase();
  let score = 20;

  if (input.company?.trim()) {
    score += 10;
    reasons.push("organization named");
  }

  if (hasWorkEmail(input.email)) {
    score += 10;
    reasons.push("work email");
  }

  if (useCase.length >= 180) {
    score += 12;
    reasons.push("specific workflow detail");
  } else if (useCase.length >= 80) {
    score += 7;
    reasons.push("some workflow detail");
  }

  if (proofTarget.length >= 40) {
    score += 10;
    reasons.push("success proof named");
  }

  if (/source|evidence|assumption|approval|review|private|sensitive|context|handoff|workflow|repeatable|action/.test(failureMode)) {
    score += 8;
    reasons.push("current AI failure named");
  }

  if (/public|sanitized|sample|limited|approved|local|private|on-prem|no private/.test(approvedInputs)) {
    score += 7;
    reasons.push("input boundary named");
  }

  if (/evidence|brief|workspace|review|checklist|board|decision|deployment|source|workflow|export|packet/.test(desiredArtifact)) {
    score += 8;
    reasons.push("first deliverable named");
  }

  if (/urgent|production/.test(timeline)) {
    score += 18;
    reasons.push("urgent timeline");
  } else if (/month/.test(timeline)) {
    score += 14;
    reasons.push("near-term timeline");
  } else if (/quarter/.test(timeline)) {
    score += 7;
    reasons.push("planning window");
  }

  if (/own|sponsor|approve/.test(decisionRole)) {
    score += 16;
    reasons.push("budget owner");
  } else if (/influence|recommend/.test(decisionRole)) {
    score += 9;
    reasons.push("internal champion");
  } else if (/research/.test(decisionRole)) {
    score -= 4;
    reasons.push("research stage");
  }

  if (/regulated|confidential|private files|local-only/.test(sensitivity)) {
    score += 8;
    reasons.push("control-sensitive workflow");
  }

  if (/managed pilot|on-prem|local/.test(infrastructure)) {
    score += 5;
    reasons.push("deployment preference present");
  }

  if (/\b(board|vendor|procurement|deployment|regulated|audit|approval|customer|workflow|automation|evidence|source|private|files|decision)\b/.test(combinedText)) {
    score += 8;
    reasons.push("matches proof-sprint shape");
  }

  if (/workspace-proof|pilot|challenge/.test(focus)) {
    score += 6;
    reasons.push("workspace handoff");
  }

  if (useCase.length < 40) {
    score -= 12;
    reasons.push("workflow too vague");
  }

  if (!desiredArtifact && proofTarget.length < 40) {
    score -= 5;
  }

  const finalScore = clampScore(score);
  const grade =
    finalScore >= 78 ? "priority" :
    finalScore >= 58 ? "qualified" :
    finalScore >= 38 ? "nurture" :
    "low_fit";

  const nextAction =
    grade === "priority" ? "Reply today with fit, first deliverable, and allowed-input route." :
    grade === "qualified" ? "Reply with fit, scope, and the first proof surface." :
    grade === "nurture" ? "Ask for one sharper workflow, owner, and deadline." :
    "Do not sell yet; request a concrete workflow and business owner.";

  return {
    score: finalScore,
    grade,
    reasons: rankReasons(reasons),
    nextAction,
  };
}
