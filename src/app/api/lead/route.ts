import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEAD_TO = "paul@activemirror.ai";
const MAX_BODY_BYTES = Number(process.env.MIRROR_LEAD_MAX_BODY_BYTES || 8_192);
const ALLOWED_HOST_SUFFIXES = [".activemirror.ai", ".pages.dev"];
const ALLOWED_EXACT_HOSTS = new Set(["activemirror.ai", "localhost", "127.0.0.1", "::1"]);

function clean(value: unknown, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function mailtoFromLead(lead: { name: string; email: string; company: string; useCase: string }) {
  const subject = encodeURIComponent("Active Mirror access request");
  const body = encodeURIComponent(
    `Name: ${lead.name}\nEmail: ${lead.email}\nCompany: ${lead.company}\nUse case: ${lead.useCase}`
  );
  return `mailto:${LEAD_TO}?subject=${subject}&body=${body}`;
}

function allowedRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  try {
    const originHost = new URL(origin).hostname.toLowerCase();
    if (host && originHost === host) return true;
    if (ALLOWED_EXACT_HOSTS.has(originHost)) return true;
    return ALLOWED_HOST_SUFFIXES.some((suffix) => originHost.endsWith(suffix));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!allowedRequestOrigin(request)) {
      return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const body = await request.json();
    const lead = {
      name: clean(body?.name, 120),
      email: clean(body?.email, 160),
      company: clean(body?.company, 160),
      useCase: clean(body?.useCase, 1000),
    };

    if (!lead.email || !lead.email.includes("@")) {
      return NextResponse.json({ error: "A valid work email is required." }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        action: "LEAD_CAPTURE",
        resource: "activemirror.ai:waitlist",
        details: JSON.stringify({
          ...lead,
          destination: LEAD_TO,
          delivered: false,
          source: "public_genui",
        }),
        severity: "INFO",
      },
    });

    return NextResponse.json({
      ok: true,
      delivered: false,
      destination: LEAD_TO,
      mailto: mailtoFromLead(lead),
    });
  } catch (error) {
    console.error("[Lead] capture failed:", error);
    return NextResponse.json({ error: "Lead capture failed." }, { status: 500 });
  }
}
