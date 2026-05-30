import { NextRequest, NextResponse } from "next/server";
import { getDemoSurfaceSpec } from "@/lib/mirror/demo-surfaces";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, mode } = body as {
      query?: string;
      mode?: string;
      visitor_context?: {
        industry?: string;
        role?: string;
        company_size?: string;
        intent?: string;
      };
    };

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'query' field" },
        { status: 400 }
      );
    }

    // For v1, use canned demo responses
    const surface = getDemoSurfaceSpec(query);

    // If mode override provided, we could switch — but v1 uses query matching
    if (mode) {
      // Future: use mode to override surface selection
    }

    return NextResponse.json(surface, {
      headers: {
        "X-Mirror-Surface-Id": surface.surface_id,
        "X-Mirror-Mode": surface.mode,
        "X-Mirror-Autonomy": surface.autonomy_level,
        "X-Mirror-Schema-Rendered": "true",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
