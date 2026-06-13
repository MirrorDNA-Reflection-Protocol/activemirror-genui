import { NextResponse } from "next/server";
import {
  aindiaDeterminismPrinciples,
  canonicalizeAIndiaInput,
  decideAIndiaHarness,
  type AIndiaModelProposal,
} from "@/lib/aindia/determinism";
import { makeAIndiaEnvelope } from "@/lib/aindia/wrapperProtocol";

export function GET() {
  const canonicalInput = canonicalizeAIndiaInput({
    text: "Urgent UPI refund link. Click and enter OTP to receive money.",
    languageCode: "hi",
    inputKind: "message",
    riskClass: "money",
    sourceLabels: ["user-shared-message", "whatsapp"],
  });
  const envelope = makeAIndiaEnvelope({
    requestId: "determinism-upi-check",
    target: "pwa",
    inputKind: "message",
    hookId: "share-hook",
    languageCode: "hi",
    riskClass: "money",
    consent: {
      purpose: "Check a user-shared payment/refund message",
      dataClasses: ["message text", "visible payment content"],
      localOnly: true,
      mayUpload: false,
      retention: "local-receipt",
      userApproved: false,
    },
    payloadRef: {
      storage: "memory",
      uri: "memory://aindia/current-message",
    },
  });
  const proposal: AIndiaModelProposal = {
    summary: "This looks like a refund scam asking for OTP.",
    risk: "risky",
    nextStep: "Do not click. Open your bank or UPI app directly and check.",
    citations: ["user-shared-message"],
    asksForAction: false,
    wantsUpload: false,
    confidence: "high",
  };

  const first = decideAIndiaHarness({ canonicalInput, envelope, proposal });
  const second = decideAIndiaHarness({ canonicalInput, envelope, proposal });

  return NextResponse.json(
    {
      product: "AIndia",
      kernel: "deterministic-harness-v1",
      principle: "The LLM proposes; the harness decides.",
      principles: aindiaDeterminismPrinciples,
      canonicalInput,
      envelope,
      proposal,
      first,
      second,
      deterministic: JSON.stringify(first) === JSON.stringify(second),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}

