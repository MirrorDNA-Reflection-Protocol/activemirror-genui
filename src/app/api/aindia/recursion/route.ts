import { NextResponse } from "next/server";
import {
  aindiaMacAbsorption,
  aindiaPerfectionDoctrine,
  aindiaForeverLoop,
  aindiaHundredRecursions,
  aindiaHundredRecursionSummary,
  aindiaLearningCycle,
  aindiaLearningPromotionGates,
  aindiaLearningReceipt,
  aindiaLearningSignals,
  aindiaRecursionLoop,
  aindiaRecursionScenarios,
  aindiaRecursionScoreLabels,
  aindiaRecursionWinner,
  aindiaSelfLearningBoundary,
} from "@/lib/aindia/recursion";

export function GET() {
  const updated = aindiaMacAbsorption.verifiedAt.slice(0, 10);

  return NextResponse.json(
    {
      product: "AIndia",
      protocol: "aindia-recursion-harness-v1",
      doctrine: aindiaPerfectionDoctrine,
      macAbsorption: aindiaMacAbsorption,
      scoreLabels: aindiaRecursionScoreLabels,
      scenarios: aindiaRecursionScenarios,
      winner: aindiaRecursionWinner,
      loop: aindiaRecursionLoop,
      foreverLoop: aindiaForeverLoop,
      selfLearning: {
        boundary: aindiaSelfLearningBoundary,
        cycle: aindiaLearningCycle,
        promotionGates: aindiaLearningPromotionGates,
        signals: aindiaLearningSignals,
        receipt: aindiaLearningReceipt,
      },
      hundredRecursions: {
        summary: aindiaHundredRecursionSummary,
        ledger: aindiaHundredRecursions,
      },
      updated,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
