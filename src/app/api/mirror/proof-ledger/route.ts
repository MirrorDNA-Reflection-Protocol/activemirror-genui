import { NextResponse } from "next/server";
import { getProofLedger, proofLedgerToMarkdown } from "@/lib/mirror/proofLedger";

export async function GET(request: Request) {
  const ledger = await getProofLedger();
  const url = new URL(request.url);

  if (url.searchParams.get("format") === "markdown") {
    return new NextResponse(proofLedgerToMarkdown(ledger), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": 'attachment; filename="active-mirror-proof-ledger.md"',
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  }

  return NextResponse.json(ledger, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
