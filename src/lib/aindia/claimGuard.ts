export type AIndiaClaimKind =
  | "current_fact"
  | "statistic"
  | "future_scenario"
  | "product_claim"
  | "founder_claim"
  | "risk_warning"
  | "unknown";

export type AIndiaClaimGuardStatus = "pass" | "needs_source" | "assumption_only" | "block";

export type AIndiaClaimGuardInput = {
  claim: string;
  evidenceRefs?: string[];
  userProvided?: boolean;
  implementedReceipt?: boolean;
  allowScenarioAssumption?: boolean;
};

export type AIndiaClaimGuardResult = {
  kind: AIndiaClaimKind;
  status: AIndiaClaimGuardStatus;
  reason: string;
  requiredAction: string;
};

function clean(value: unknown, max = 1200) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function hasEvidence(input: AIndiaClaimGuardInput) {
  return Boolean(input.evidenceRefs?.filter(Boolean).length);
}

export function guardAIndiaClaim(input: AIndiaClaimGuardInput): AIndiaClaimGuardResult {
  const claim = clean(input.claim);
  const lower = claim.toLowerCase();
  const evidence = hasEvidence(input);
  const isCurrentFact = /\b(today|latest|current|as of|now|2026|2027|2028|2029|2030)\b/i.test(claim);
  const isStatistic = /\b(\d+(\.\d+)?%|\d+(\.\d+)?\s*(million|billion|crore|lakh|m|bn)|most indians|all indians|majority of indians)\b/i.test(claim);

  if (!claim) {
    return {
      kind: "unknown",
      status: "block",
      reason: "No claim was supplied.",
      requiredAction: "Ask for the claim before answering.",
    };
  }

  if (/\b(hallucination[- ]free|bulletproof|guaranteed|always|never wrong|cannot fail|100% accurate|only option)\b/i.test(claim)) {
    return {
      kind: "product_claim",
      status: "block",
      reason: "Absolute reliability or monopoly claims are not allowed.",
      requiredAction: "Replace with source-bounded, assumption-labeled, fail-closed wording.",
    };
  }

  if (/\b(paul thinks|paul believes|paul said|paul will|paul promises)\b/i.test(claim) && !input.userProvided) {
    return {
      kind: "founder_claim",
      status: "block",
      reason: "Founder claims require explicit user-provided text or a cited public source.",
      requiredAction: "Say AIndia view, or ask Paul, instead of simulating Paul.",
    };
  }

  if (isStatistic) {
    if (!evidence) {
      return {
        kind: "statistic",
        status: "needs_source",
        reason: "Statistics and population claims need a sourced basis.",
        requiredAction: "Attach the source, year, and calculation or mark as estimate.",
      };
    }
    return {
      kind: "statistic",
      status: "pass",
      reason: "Statistic has evidence reference.",
      requiredAction: "State the source, year, and calculation boundary.",
    };
  }

  if (isCurrentFact) {
    if (!evidence) {
      return {
        kind: "current_fact",
        status: "needs_source",
        reason: "Current or date-specific claims need source evidence.",
        requiredAction: "Search or cite a source with date before answering.",
      };
    }
    return {
      kind: "current_fact",
      status: "pass",
      reason: "Current or date-specific claim has evidence reference.",
      requiredAction: "State the source date and avoid extending beyond it.",
    };
  }

  if (/\b(will|future|in five years|by 2030|2030\+|eventually)\b/i.test(lower) && !input.allowScenarioAssumption) {
    return {
      kind: "future_scenario",
      status: "assumption_only",
      reason: "Future statements must be framed as scenarios, not facts.",
      requiredAction: "Rewrite as: If this happens, AIndia should...",
    };
  }

  if (/\b(live|implemented|verified|passed|working|built|shipped)\b/i.test(claim) && !input.implementedReceipt) {
    return {
      kind: "product_claim",
      status: "needs_source",
      reason: "Product-state claims need a receipt, test result, or code reference.",
      requiredAction: "Attach a build/test/API receipt before making the claim.",
    };
  }

  if (/\b(upi|otp|kyc|fraud|scam|payment|bank|identity|document)\b/i.test(claim)) {
    return {
      kind: "risk_warning",
      status: evidence || input.userProvided ? "pass" : "needs_source",
      reason: evidence || input.userProvided ? "Risk warning is allowed with user context or evidence." : "Risk claims need user context or source evidence.",
      requiredAction: evidence || input.userProvided ? "Give a safe next step and avoid certainty beyond evidence." : "Ask for non-sensitive context or cite a fraud source.",
    };
  }

  return {
    kind: "unknown",
    status: "pass",
    reason: "No blocked pattern detected.",
    requiredAction: "Keep wording modest and mark unknowns clearly.",
  };
}

export const aindiaClaimGuardRules = [
  "No source, no factual claim.",
  "No date/current/latest claim without freshness evidence.",
  "No statistics without source, year, and calculation boundary.",
  "No future certainty; scenarios only.",
  "No Paul simulation without user-provided or public cited source.",
  "No absolute reliability claims.",
  "No product-state claim without build, test, API, or receipt evidence.",
];
