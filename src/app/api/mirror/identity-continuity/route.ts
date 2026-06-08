import { NextResponse } from "next/server";
import { getIdentityContinuityStatus } from "@/lib/mirror/identityContinuity";

export async function GET() {
  return NextResponse.json(getIdentityContinuityStatus(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
