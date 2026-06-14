import { NextResponse } from "next/server";
import {
  aindiaAudienceMath,
  aindiaCompetitorClasses,
  aindiaDoctrine,
  aindiaOptionScenarios,
  aindiaOperatingPriorities,
  aindiaResearchSources,
  aindiaSovereigntyDefinition,
  aindiaSovereigntyTests,
} from "@/lib/aindia/sovereignty";
import { aindiaFiveYearBets, aindiaFuturePrimitives, aindiaFutureThesis, aindiaFutureThreats } from "@/lib/aindia/futureProof";
import { activeMirrorIndiaPosition, aindiaAntiStar, aindiaDecisionRules, aindiaOwnStar, aindiaStarAxioms } from "@/lib/aindia/ownStar";
import {
  aindiaForeverLoop,
  aindiaHundredRecursions,
  aindiaHundredRecursionSummary,
  aindiaMacAbsorption,
  aindiaPerfectionDoctrine,
  aindiaRecursionLoop,
  aindiaRecursionScenarios,
  aindiaRecursionWinner,
} from "@/lib/aindia/recursion";

export function GET() {
  const updated = aindiaMacAbsorption.verifiedAt.slice(0, 10);

  return NextResponse.json(
    {
      product: "AIndia",
      claimBoundary:
        "AIndia should not claim sovereignty as branding. It earns the claim only when the wrapper, local rails, consent gates, deterministic policy, receipts, and replay checks pass.",
      definition: aindiaSovereigntyDefinition,
      audienceMath: aindiaAudienceMath,
      doctrine: aindiaDoctrine,
      ownStar: {
        activeMirrorIndiaPosition,
        definition: aindiaOwnStar,
        axioms: aindiaStarAxioms,
        antiStar: aindiaAntiStar,
        decisionRules: aindiaDecisionRules,
      },
      operatingPriorities: aindiaOperatingPriorities,
      tests: aindiaSovereigntyTests,
      futureProof: {
        thesis: aindiaFutureThesis,
        threats: aindiaFutureThreats,
        primitives: aindiaFuturePrimitives,
        fiveYearBets: aindiaFiveYearBets,
      },
      competitorClasses: aindiaCompetitorClasses,
      optionSpace: aindiaOptionScenarios,
      recursion: {
        doctrine: aindiaPerfectionDoctrine,
        macAbsorption: aindiaMacAbsorption,
        scenarios: aindiaRecursionScenarios,
        winner: aindiaRecursionWinner,
        loop: aindiaRecursionLoop,
        foreverLoop: aindiaForeverLoop,
        hundredRecursions: {
          summary: aindiaHundredRecursionSummary,
          ledger: aindiaHundredRecursions,
        },
      },
      researchSources: aindiaResearchSources,
      updated,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
