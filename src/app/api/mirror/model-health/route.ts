import { NextResponse } from "next/server";
import { getModelHealthSnapshot } from "@/lib/mirror/modelHealth";

export async function GET() {
  return NextResponse.json(getModelHealthSnapshot(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
