import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEAD_TO = "paul@activemirror.ai";

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

export async function POST(request: NextRequest) {
  try {
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

