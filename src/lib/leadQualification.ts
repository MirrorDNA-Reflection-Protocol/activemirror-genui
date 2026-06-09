export type LeadQualificationInput = {
  name?: string;
  email?: string;
  company?: string;
  sensitivity?: string;
  infrastructure?: string;
  timeline?: string;
  decisionRole?: string;
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
    ["urgent timeline", 1],
    ["success proof named", 2],
    ["specific workflow detail", 3],
    ["matches proof-sprint shape", 4],
    ["control-sensitive workflow", 5],
    ["internal champion", 6],
    ["near-term timeline", 7],
    ["work email", 8],
    ["organization named", 9],
    ["workflow too vague", 10],
    ["research stage", 11],
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

  if (useCase.length < 40) {
    score -= 12;
    reasons.push("workflow too vague");
  }

  const finalScore = clampScore(score);
  const grade =
    finalScore >= 78 ? "priority" :
    finalScore >= 58 ? "qualified" :
    finalScore >= 38 ? "nurture" :
    "low_fit";

  const nextAction =
    grade === "priority" ? "Reply today with a scoped proof-sprint question." :
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
