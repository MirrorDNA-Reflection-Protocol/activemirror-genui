import { NextResponse } from "next/server";
import { FREE_TURN_LIMIT } from "@/lib/mirror/budget";

export async function GET() {
  return NextResponse.json({
    name: "Active Mirror public GenUI",
    doctrine: "tokenized",
    freeTurnLimit: FREE_TURN_LIMIT,
    promptPreview: "public-health-only",
  });
}
