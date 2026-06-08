import { NextResponse } from "next/server";
import { getMirrorKernelPublicStatus } from "@/lib/mirror/mirrorKernel";

export async function GET() {
  const status = await getMirrorKernelPublicStatus();
  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
