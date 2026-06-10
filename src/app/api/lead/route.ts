import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { qualifyLead } from "@/lib/leadQualification";
import { buildLeadFollowUp, type LeadFollowUp } from "@/lib/leadFollowUp";
import { LEAD_REQUEST_TO, buildLeadRequestMailto } from "@/lib/leadMailto";

const LEAD_TO = LEAD_REQUEST_TO;
const LEAD_WEBHOOK_URL = process.env.MIRROR_LEAD_WEBHOOK_URL || "";
const LEAD_WEBHOOK_TOKEN = process.env.MIRROR_LEAD_WEBHOOK_TOKEN || "";
const MAX_BODY_BYTES = Number(process.env.MIRROR_LEAD_MAX_BODY_BYTES || 8_192);
const ALLOWED_HOST_SUFFIXES = [".activemirror.ai", ".pages.dev"];
const ALLOWED_EXACT_HOSTS = new Set(["activemirror.ai", "localhost", "127.0.0.1", "::1"]);

type Lead = {
  name: string;
  email: string;
  company: string;
  sensitivity: string;
  infrastructure: string;
  timeline: string;
  decisionRole: string;
  focus: string;
  failureMode: string;
  approvedInputs: string;
  desiredArtifact: string;
  proofTarget: string;
  useCase: string;
};

function clean(value: unknown, max = 500) {
  return String(value || "").trim().slice(0, max);
}

async function deliverLeadNotification(lead: Lead, qualification: ReturnType<typeof qualifyLead>, followUp: LeadFollowUp) {
  if (!LEAD_WEBHOOK_URL) {
    return {
      delivered: false,
      deliveryStatus: "capture_only",
      deliveryChannel: "audit_log",
    };
  }

  try {
    const url = new URL(LEAD_WEBHOOK_URL);
    if (url.protocol !== "https:") throw new Error("Webhook URL must use HTTPS.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(LEAD_WEBHOOK_TOKEN ? { authorization: `Bearer ${LEAD_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        schemaVersion: "active_mirror.lead_notification.v1",
        generatedAt: new Date().toISOString(),
        destination: LEAD_TO,
        lead,
        qualification,
        followUp,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) throw new Error(`Webhook returned ${response.status}.`);

    return {
      delivered: true,
      deliveryStatus: "webhook_delivered",
      deliveryChannel: "webhook",
    };
  } catch (error) {
    console.error("[Lead] notification failed:", error);
    return {
      delivered: false,
      deliveryStatus: "webhook_failed",
      deliveryChannel: "webhook",
    };
  }
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
      sensitivity: clean(body?.sensitivity, 120),
      infrastructure: clean(body?.infrastructure, 160),
      timeline: clean(body?.timeline, 120),
      decisionRole: clean(body?.decisionRole, 160),
      focus: clean(body?.focus, 80),
      failureMode: clean(body?.failureMode, 180),
      approvedInputs: clean(body?.approvedInputs, 180),
      desiredArtifact: clean(body?.desiredArtifact, 180),
      proofTarget: clean(body?.proofTarget, 700),
      useCase: clean(body?.useCase, 1000),
    };

    if (!lead.email || !lead.email.includes("@")) {
      return NextResponse.json({ error: "A valid work email is required." }, { status: 400 });
    }

    const qualification = qualifyLead(lead);
    const followUp = buildLeadFollowUp(lead, qualification);
    const captureId = `amlead_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
    const delivery = await deliverLeadNotification(lead, qualification, followUp);

    await prisma.auditLog.create({
      data: {
        action: "LEAD_CAPTURE",
        resource: `activemirror.ai:lead:${captureId}`,
        details: JSON.stringify({
          schemaVersion: "active_mirror.lead_capture.v2",
          captureId,
          ...lead,
          destination: LEAD_TO,
          delivered: delivery.delivered,
          deliveryStatus: delivery.deliveryStatus,
          deliveryChannel: delivery.deliveryChannel,
          source: "public_structured_intake",
          qualification,
          followUp,
        }),
        severity: "INFO",
      },
    });

    return NextResponse.json({
      ok: true,
      captured: true,
      delivered: delivery.delivered,
      deliveryStatus: delivery.deliveryStatus,
      deliveryChannel: delivery.deliveryChannel,
      destination: LEAD_TO,
      qualification,
      captureId,
      followUp: {
        responseWindow: followUp.responseWindow,
        buyerStatus: followUp.buyerStatus,
        proofSurface: followUp.proofSurface,
        riskBoundary: followUp.riskBoundary,
        scopeQuestions: followUp.scopeQuestions,
      },
      mailto: buildLeadRequestMailto(lead),
    });
  } catch (error) {
    console.error("[Lead] capture failed:", error);
    return NextResponse.json({ error: "Lead capture failed." }, { status: 500 });
  }
}
