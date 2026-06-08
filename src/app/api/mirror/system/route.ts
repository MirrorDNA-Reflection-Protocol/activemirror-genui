import { NextResponse } from "next/server";
import { FREE_TURN_LIMIT } from "@/lib/mirror/budget";
import { ACTIVE_MIRROR_LOCAL_SUPERVISOR_VERSION } from "@/lib/mirror/localSupervisor";

export async function GET() {
  return NextResponse.json({
    name: "Active Mirror public GenUI",
    doctrine: "tokenized",
    localSupervisor: ACTIVE_MIRROR_LOCAL_SUPERVISOR_VERSION,
    freeTurnLimit: FREE_TURN_LIMIT,
    promptPreview: "public-health-only",
  });
}
