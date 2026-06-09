import { NextRequest, NextResponse } from "next/server";
import { OPS_COOKIE_NAME, hasOpsTokenConfigured, opsCookieValue, validOpsToken } from "@/lib/opsAuth";

export const dynamic = "force-dynamic";

function redirectTo(request: NextRequest, suffix = "") {
  return NextResponse.redirect(new URL(`/ops/funnel${suffix}`, request.url), { status: 303 });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const action = String(form.get("action") || "");

  if (action === "logout") {
    const response = redirectTo(request);
    response.cookies.set(OPS_COOKIE_NAME, "", { path: "/ops", maxAge: 0 });
    return response;
  }

  const token = String(form.get("token") || "");
  if (!hasOpsTokenConfigured() || !validOpsToken(token)) {
    return redirectTo(request, "?auth=failed");
  }

  const response = redirectTo(request);
  response.cookies.set(OPS_COOKIE_NAME, opsCookieValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 12 * 60 * 60,
    path: "/ops",
  });
  return response;
}
