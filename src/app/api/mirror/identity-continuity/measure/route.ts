import { NextResponse } from "next/server";
import {
  identityContinuityMeasureContract,
  measureIdentityContinuity,
} from "@/lib/mirror/identityContinuityMeasure";

export async function GET() {
  return NextResponse.json(identityContinuityMeasureContract(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "invalid_json",
        reason: "measurement_payload_must_be_json",
      },
      { status: 400 },
    );
  }

  const result = measureIdentityContinuity(payload);
  if (!result.ok) {
    return NextResponse.json(
      {
        status: "rejected",
        reason: result.error,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(result.measurement, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
