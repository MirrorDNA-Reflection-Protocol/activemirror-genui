import { NextResponse } from "next/server";
import {
  compileLocalOperatorPacket,
  localOperatorContract,
  sampleLocalOperatorPayload,
} from "@/lib/mirror/localOperator";

export async function GET() {
  const result = compileLocalOperatorPacket(sampleLocalOperatorPayload());
  return NextResponse.json(
    {
      ...localOperatorContract(),
      samplePacket: result.ok ? result.packet : null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "invalid_json",
        reason: "operator_payload_must_be_json",
      },
      { status: 400 },
    );
  }

  const result = compileLocalOperatorPacket(payload);
  if (!result.ok) {
    return NextResponse.json(
      {
        status: "rejected",
        reason: result.error,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(result.packet, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
