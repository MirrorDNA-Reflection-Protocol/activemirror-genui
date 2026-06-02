import { NextResponse } from "next/server";
import {
  ACTIVE_MIRROR_PROMPT_TOKENS,
  ACTIVE_MIRROR_PUBLIC_SOURCE_ROOTS,
  buildMirrorSystemPrompt,
} from "@/lib/mirror/systemPrompt";
import { FREE_TURN_LIMIT } from "@/lib/mirror/budget";

export async function GET() {
  return NextResponse.json({
    name: "Active Mirror public GenUI system prompt",
    doctrine: "tokenized",
    freeTurnLimit: FREE_TURN_LIMIT,
    sourceRoots: ACTIVE_MIRROR_PUBLIC_SOURCE_ROOTS,
    tokens: ACTIVE_MIRROR_PROMPT_TOKENS,
    promptPreview: buildMirrorSystemPrompt(FREE_TURN_LIMIT, { includePrivate: false }),
  });
}
