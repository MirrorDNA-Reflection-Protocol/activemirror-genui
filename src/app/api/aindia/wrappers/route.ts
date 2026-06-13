import { NextResponse } from "next/server";
import { aindiaHardeningControls, validateAIndiaRuntimeEnvelope } from "@/lib/aindia/hardening";
import {
  aindiaNativeCapabilities,
  aindiaWrapperMilestones,
  makeAIndiaEnvelope,
  summarizeWrapperReadiness,
} from "@/lib/aindia/wrapperProtocol";

export function GET() {
  const sampleEnvelope = makeAIndiaEnvelope({
    requestId: "sample-upi-screenshot",
    target: "android",
    inputKind: "photo",
    hookId: "photo-hook",
    languageCode: "hi",
    riskClass: "money",
    consent: {
      purpose: "Check a payment screenshot for fraud risk",
      dataClasses: ["screenshot", "visible payment text"],
      localOnly: true,
      mayUpload: false,
      retention: "local-receipt",
      userApproved: false,
    },
    payloadRef: {
      storage: "native-sandbox",
      uri: "aindia://local/screenshot/current",
    },
  });
  const blockedEnvelope = makeAIndiaEnvelope({
    requestId: "blocked-provider-upload",
    target: "provider",
    inputKind: "document",
    hookId: "source-pack-hook",
    languageCode: "hi",
    riskClass: "identity",
    consent: {
      purpose: "Analyze identity document",
      dataClasses: ["identity document", "visible personal data"],
      localOnly: true,
      mayUpload: true,
      retention: "provider-policy",
      userApproved: false,
    },
    payloadRef: {
      storage: "provider",
      uri: "https://example.invalid/document",
    },
  });

  return NextResponse.json(
    {
      product: "AIndia",
      protocol: "aindia-runtime-v1",
      spine: "bootloader -> hooks -> harness -> wrappers",
      capabilities: aindiaNativeCapabilities,
      milestones: aindiaWrapperMilestones,
      hardening: aindiaHardeningControls,
      readiness: ["pwa", "android", "ios", "provider", "enterprise"].map((target) =>
        summarizeWrapperReadiness(target as Parameters<typeof summarizeWrapperReadiness>[0]),
      ),
      sampleEnvelope,
      sampleValidation: validateAIndiaRuntimeEnvelope(sampleEnvelope),
      blockedEnvelope,
      blockedValidation: validateAIndiaRuntimeEnvelope(blockedEnvelope),
      failClosedRule: "Native wrappers expose capability, but only the AIndia harness can approve sensitive actions or cloud routes.",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
