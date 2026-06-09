import { NextResponse } from "next/server";
import { getMirrorRuntimeContractRegistry } from "@/lib/mirror/runtimeContractRegistry";

export async function GET() {
  return NextResponse.json(getMirrorRuntimeContractRegistry(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
