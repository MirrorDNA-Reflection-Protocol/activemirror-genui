import { NextRequest, NextResponse } from "next/server";
import {
  aindiaJsonResponse,
  cleanAIndiaText,
  isAIndiaRelayEmail,
  readAIndiaJsonObject,
} from "@/lib/aindia/apiHardening";
import { buildFounderRelayResponse } from "@/lib/aindia/founderRelay";
import { buildLeadRequestMailto } from "@/lib/leadMailto";

export function GET() {
  return NextResponse.json(
    {
      product: "AIndia",
      protocol: "aindia-founder-relay-v1",
      boundary:
        "This is a public-safe relay. It can answer from AIndia doctrine and draft a message to Paul. It does not impersonate Paul, send silently, or store private content.",
      gates: ["public_safe_message", "contact_optional", "explicit_relay_consent", "user_sends_email"],
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const parsed = await readAIndiaJsonObject(request);
  if (!parsed.ok) return parsed.response;

  const message = cleanAIndiaText(parsed.body.message, 900);
  const name = cleanAIndiaText(parsed.body.name, 120);
  const email = cleanAIndiaText(parsed.body.email, 160).toLowerCase();
  const languageCode = cleanAIndiaText(parsed.body.languageCode, 24) || "auto";
  const consentToRelay = parsed.body.consentToRelay === true;

  if (!message) {
    return aindiaJsonResponse({ error: "A message is required." }, { status: 400 });
  }

  if (email && !isAIndiaRelayEmail(email)) {
    return aindiaJsonResponse({ error: "A valid email is required when provided." }, { status: 400 });
  }

  if (consentToRelay && !isAIndiaRelayEmail(email)) {
    return aindiaJsonResponse({ error: "A valid email and explicit consent are required before relay." }, { status: 400 });
  }

  const relay = buildFounderRelayResponse({ message, name, email, languageCode, consentToRelay });
  const canRelay = consentToRelay && isAIndiaRelayEmail(email);
  const mailto = canRelay
    ? buildLeadRequestMailto({
        name,
        email,
        focus: "aindia-founder-relay",
        sensitivity: "public-safe first",
        infrastructure: "AIndia relay",
        timeline: "as soon as useful",
        desiredArtifact: "Founder reply or first scope question",
        failureMode: "The user needs philosophy, trust boundary, or product direction clarified.",
        approvedInputs: "This relay note only; no private files or credentials.",
        proofTarget: relay.nextStep,
        useCase: relay.relayDraft,
      })
    : "";

  return aindiaJsonResponse({
    ok: true,
    ...relay,
    canRelay,
    mailto,
    boundary: canRelay
      ? "A ready-to-send email was prepared. The user still chooses whether to send it."
      : "Answer prepared locally. Add an email and explicit consent to prepare a relay note for Paul.",
  });
}
