import { NextResponse } from "next/server";
import { getMirrorRatchetStatus } from "@/lib/mirror/mirrorRatchet";

export function GET() {
  return NextResponse.json(getMirrorRatchetStatus(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
