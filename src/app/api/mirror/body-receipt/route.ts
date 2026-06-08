import { NextResponse } from "next/server";
import {
  bodyReceiptTokenConfigured,
  isAuthorizedBodyReceiptRequest,
  readPublicBodyReceiptSummary,
  validatePublicBodyReceipt,
  writePublicBodyReceipt,
} from "@/lib/mirror/bodyReceipt";

export const runtime = "nodejs";

export async function GET() {
  const summary = await readPublicBodyReceiptSummary();
  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!bodyReceiptTokenConfigured()) {
    return NextResponse.json(
      {
        status: "sync_not_configured",
        note: "Set MIRROR_BODY_RECEIPT_TOKEN or MIRROR_BODY_SYNC_TOKEN before accepting body receipts.",
      },
      { status: 503 },
    );
  }

  if (!isAuthorizedBodyReceiptRequest(request)) {
    return NextResponse.json(
      {
        status: "unauthorized",
        note: "Body receipt writes require a scoped bearer token.",
      },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "invalid_json",
        note: "Body receipt payload must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const validated = validatePublicBodyReceipt(payload);
  if (!validated.ok) {
    return NextResponse.json(
      {
        status: "rejected",
        reason: validated.error,
        note: "Only sanitized public-safe body receipts are accepted.",
      },
      { status: 400 },
    );
  }

  const result = await writePublicBodyReceipt(validated.receipt);
  return NextResponse.json(
    {
      status: "accepted",
      payloadHash: result.payloadHash,
      bodyReceipt: result.summary,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
