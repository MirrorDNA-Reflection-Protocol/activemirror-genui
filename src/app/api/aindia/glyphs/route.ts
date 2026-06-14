import { NextResponse } from "next/server";
import { aindiaGlyphGrammarVersion, aindiaGlyphs, getAIndiaGlyphMirrorGraph } from "@/lib/aindia/glyphs";
import { getAIndiaReflectiveTurnContract } from "@/lib/aindia/reflectiveTurn";
import { aindiaMacAbsorption } from "@/lib/aindia/recursion";

export function GET() {
  return NextResponse.json(
    {
      protocol: "aindia-glyph-grammar-v1",
      version: aindiaGlyphGrammarVersion,
      stance: "reflection_over_prediction",
      boundary:
        "Glyphs are operational state markers. MirrorGraph stores the public grammar and consented receipts, not raw private chat.",
      glyphs: aindiaGlyphs,
      mirrorGraph: getAIndiaGlyphMirrorGraph(),
      reflectiveTurn: getAIndiaReflectiveTurnContract(),
      updated: aindiaMacAbsorption.verifiedAt.slice(0, 10),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    },
  );
}
