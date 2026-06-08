import { NextResponse } from "next/server";
import { decisionCritiqueToNdjson, getDecisionCritiqueStream } from "@/lib/mirror/decisionCritique";

export async function GET(request: Request) {
  const stream = getDecisionCritiqueStream();
  const url = new URL(request.url);

  if (url.searchParams.get("format") === "ndjson") {
    return new NextResponse(decisionCritiqueToNdjson(stream), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-ndjson; charset=utf-8",
      },
    });
  }

  return NextResponse.json(stream, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
