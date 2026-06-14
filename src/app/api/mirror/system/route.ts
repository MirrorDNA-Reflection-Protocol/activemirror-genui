import { NextResponse } from "next/server";
import { FREE_TURN_LIMIT } from "@/lib/mirror/budget";
import { ACTIVE_MIRROR_LOCAL_SUPERVISOR_VERSION } from "@/lib/mirror/localSupervisor";
import { getMirrorKernelPublicStatus } from "@/lib/mirror/mirrorKernel";
import { getSanatanaTechHookStatus } from "@/lib/mirror/sanatanaTechHook";

export async function GET() {
  const mirrorKernel = await getMirrorKernelPublicStatus();

  return NextResponse.json({
    name: "Active Mirror public system",
    rules: "loaded",
    localSupervisor: ACTIVE_MIRROR_LOCAL_SUPERVISOR_VERSION,
    doctrineHook: getSanatanaTechHookStatus(),
    mirrorKernel,
    freeTurnLimit: FREE_TURN_LIMIT,
    promptPreview: "public-health-only",
  });
}
