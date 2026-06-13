import { NextRequest, NextResponse } from "next/server";
import {
  aindiaJsonResponse,
  cleanAIndiaStringList,
  cleanAIndiaText,
  readAIndiaJsonObject,
} from "@/lib/aindia/apiHardening";
import { aindiaClaimGuardRules, guardAIndiaClaim, type AIndiaClaimGuardInput } from "@/lib/aindia/claimGuard";

export function GET() {
  const samples: AIndiaClaimGuardInput[] = [
    { claim: "AIndia is hallucination-free." },
    { claim: "By 2030 all models will be utility rails." },
    { claim: "958M active internet users in India in 2025.", evidenceRefs: ["iamai-kantar-2025"] },
    { claim: "The founder relay API is implemented.", implementedReceipt: true },
  ];

  return NextResponse.json(
    {
      product: "AIndia",
      protocol: "aindia-claim-guard-v1",
      claim: "Source-bounded, assumption-labeled, fail-closed, receipt-backed.",
      rules: aindiaClaimGuardRules,
      samples: samples.map((sample) => ({ sample, result: guardAIndiaClaim(sample) })),
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

  const claim = cleanAIndiaText(parsed.body.claim, 1_200);
  if (!claim) {
    return aindiaJsonResponse({ error: "A string claim is required." }, { status: 400 });
  }

  const result = guardAIndiaClaim({
    claim,
    evidenceRefs: cleanAIndiaStringList(parsed.body.evidenceRefs, 20, 140),
    userProvided: parsed.body.userProvided === true,
    implementedReceipt: parsed.body.implementedReceipt === true,
    allowScenarioAssumption: parsed.body.allowScenarioAssumption === true,
  });

  return aindiaJsonResponse({
    ok: true,
    result,
  });
}
