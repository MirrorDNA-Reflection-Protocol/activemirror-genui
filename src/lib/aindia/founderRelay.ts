export type AIndiaFounderRelayIntent =
  | "lost"
  | "trust"
  | "sovereignty"
  | "sme"
  | "fraud"
  | "build"
  | "general";

export type AIndiaFounderRelayInput = {
  message: string;
  name?: string;
  email?: string;
  languageCode?: string;
  consentToRelay?: boolean;
};

export type AIndiaFounderRelayResponse = {
  intent: AIndiaFounderRelayIntent;
  answer: string;
  nextStep: string;
  relayDraft: string;
  needsHuman: boolean;
  receiptId: string;
};

function clean(value: unknown, max = 900) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

export function classifyFounderRelayIntent(message: string): AIndiaFounderRelayIntent {
  const lower = message.toLowerCase();
  if (/\b(lost|confused|don't know|dont know|stuck|where do i start|help me|समझ|भटक|फंस)\b/.test(lower)) return "lost";
  if (/\b(trust|privacy|data|safe|upload|consent|bharosa|भरोसा|private)\b/.test(lower)) return "trust";
  if (/\b(sovereign|india|language|bhasha|hindi|tamil|telugu|marathi|सॉवरेन|भाषा)\b/.test(lower)) return "sovereignty";
  if (/\b(shop|sme|business|dukaan|invoice|gst|order|catalog|seller|दुकान)\b/.test(lower)) return "sme";
  if (/\b(upi|otp|kyc|fraud|scam|link|refund|bank|payment|फ्रॉड|धोखा)\b/.test(lower)) return "fraud";
  if (/\b(build|pilot|demo|app|workflow|automation|deploy|बनाना)\b/.test(lower)) return "build";
  return "general";
}

export function buildFounderRelayResponse(input: AIndiaFounderRelayInput): AIndiaFounderRelayResponse {
  const message = clean(input.message);
  const intent = classifyFounderRelayIntent(message);
  const receiptId = `ain_relay_${Date.now().toString(36)}`;
  const baseBoundary = "I can help you make the next step clear. I will not send anything to Paul unless you choose that.";
  const byIntent: Record<AIndiaFounderRelayIntent, { answer: string; nextStep: string; needsHuman: boolean }> = {
    lost: {
      answer:
        "You do not need the whole answer right now. Start with one safe check: what are you trying to decide, what could go wrong, and what proof would make you comfortable?",
      nextStep: "Write the situation in one line. I will turn it into one clear question and one next step.",
      needsHuman: false,
    },
    trust: {
      answer:
        "Trust by design means no hidden upload, no silent action, and no pressure to share more than needed. The first pass should work with public or local information.",
      nextStep: "Say what data you are worried about. I will mark what can stay local and what would need approval.",
      needsHuman: false,
    },
    sovereignty: {
      answer:
        "AIndia's view is simple: language first, local first, consent first. Models can help, but the harness decides what is allowed.",
      nextStep: "Tell me the language, device, and task. I will map the lightest route before any heavy model route.",
      needsHuman: false,
    },
    sme: {
      answer:
        "For a small business, the useful answer is not a long chat. It is one customer reply, one safer payment step, one catalog update, or one form made easier.",
      nextStep: "Describe the shop task. I will compress it into a small workflow Paul can judge quickly if needed.",
      needsHuman: true,
    },
    fraud: {
      answer:
        "Pause before acting. Do not share OTPs, click refund links, or move money because a message sounds urgent. Check through the official app or a trusted source.",
      nextStep: "Paste only the non-sensitive message text or describe the screenshot. I will keep the response to safe next steps.",
      needsHuman: false,
    },
    build: {
      answer:
        "The right build starts with one workflow, one user, one risky moment, and one proof that would make it worth continuing.",
      nextStep: "I can package this into a short note for Paul: problem, user, risk, first proof, and what not to touch.",
      needsHuman: true,
    },
    general: {
      answer:
        "I hear you. The AIndia philosophy is to reduce confusion without taking control away from the person.",
      nextStep: "Tell me what you want to understand or build. I will answer small, then offer a clean relay note if Paul should see it.",
      needsHuman: false,
    },
  };

  const selected = byIntent[intent];
  const relayDraft = [
    "AIndia Founder Relay",
    "",
    `Intent: ${intent}`,
    `Name: ${clean(input.name, 120) || "not provided"}`,
    `Email: ${clean(input.email, 160) || "not provided"}`,
    `Language: ${clean(input.languageCode, 24) || "not provided"}`,
    "",
    "User message:",
    message || "not provided",
    "",
    "AIndia first response:",
    selected.answer,
    "",
    "Suggested next step:",
    selected.nextStep,
    "",
    `Consent to relay: ${input.consentToRelay ? "yes" : "no"}`,
    `Receipt: ${receiptId}`,
  ].join("\n");

  return {
    intent,
    answer: `${selected.answer} ${baseBoundary}`,
    nextStep: selected.nextStep,
    relayDraft,
    needsHuman: selected.needsHuman,
    receiptId,
  };
}
