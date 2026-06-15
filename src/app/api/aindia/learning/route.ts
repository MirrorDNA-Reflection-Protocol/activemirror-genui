import { NextResponse } from "next/server";
import {
  aindiaLearningCycle,
  aindiaLearningPromotionGates,
  aindiaLearningReceipt,
  aindiaLearningSignals,
  aindiaMacAbsorption,
  aindiaSelfLearningBoundary,
} from "@/lib/aindia/recursion";

export function GET() {
  return NextResponse.json(
    {
      product: "AIndia",
      protocol: "aindia-self-learning-recursion-v1",
      boundary: aindiaSelfLearningBoundary,
      cycle: aindiaLearningCycle,
      promotionGates: aindiaLearningPromotionGates,
      signals: aindiaLearningSignals,
      receipt: aindiaLearningReceipt,
      updated: aindiaMacAbsorption.verifiedAt.slice(0, 10),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
