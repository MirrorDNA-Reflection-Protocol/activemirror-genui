import { NextResponse } from "next/server";
import { getRevocationCascadeStatus } from "@/lib/mirror/revocationCascade";

export async function GET() {
  return NextResponse.json(getRevocationCascadeStatus(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
