import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_BODY_BYTES = Number(process.env.MIRROR_ANALYTICS_MAX_BODY_BYTES || 4_096);
const ALLOWED_HOST_SUFFIXES = [".activemirror.ai", ".pages.dev"];
const ALLOWED_EXACT_HOSTS = new Set(["activemirror.ai", "localhost", "127.0.0.1", "::1"]);
const ADMIN_TOKEN = process.env.MIRROR_ANALYTICS_ADMIN_TOKEN || "";

export const dynamic = "force-dynamic";

type AnalyticsEvent = {
  event?: string;
  path?: string;
  referrer?: string;
  sessionId?: string;
  pageId?: string;
  target?: string;
  label?: string;
  href?: string;
  section?: string;
  device?: string;
  viewport?: string;
  durationMs?: number;
  utm?: Record<string, string>;
  meta?: Record<string, unknown>;
};

function clean(value: unknown, max = 240) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanPath(value: unknown) {
  const raw = clean(value, 500);
  if (!raw) return "/";
  try {
    const url = new URL(raw, "https://activemirror.ai");
    return `${url.pathname}${url.search}`.slice(0, 500);
  } catch {
    return raw.startsWith("/") ? raw.slice(0, 500) : "/";
  }
}

function referrerHost(value: unknown) {
  const raw = clean(value, 500);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`.slice(0, 240);
  } catch {
    return "";
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

function localOrToken(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
  const auth = request.headers.get("authorization") || "";
  return Boolean(ADMIN_TOKEN && auth === `Bearer ${ADMIN_TOKEN}`);
}

function normalizeEvent(body: AnalyticsEvent, request: NextRequest) {
  const url = request.nextUrl;
  const event = clean(body?.event || "event", 80).toLowerCase().replace(/[^a-z0-9_:-]/g, "_");
  const utm = body?.utm && typeof body.utm === "object"
    ? Object.fromEntries(Object.entries(body.utm).map(([key, value]) => [clean(key, 40), clean(value, 120)]).filter(([key, value]) => key && value))
    : {};

  return {
    event,
    path: cleanPath(body?.path || `${url.pathname}${url.search}`),
    referrer: referrerHost(body?.referrer),
    sessionId: clean(body?.sessionId, 80),
    pageId: clean(body?.pageId, 80),
    target: clean(body?.target, 120),
    label: clean(body?.label, 160),
    href: cleanPath(body?.href || ""),
    section: clean(body?.section, 120),
    device: clean(body?.device, 40),
    viewport: clean(body?.viewport, 40),
    durationMs: Math.max(0, Math.min(Number(body?.durationMs || 0), 60 * 60 * 1000)),
    utm,
    meta: sanitizeMeta(body?.meta),
    userAgent: clean(request.headers.get("user-agent"), 260),
  };
}

function sanitizeMeta(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 20)
      .map(([key, item]) => {
        if (typeof item === "number") return [clean(key, 60), Math.max(-1_000_000, Math.min(item, 1_000_000))];
        if (typeof item === "boolean") return [clean(key, 60), item];
        return [clean(key, 60), clean(item, 160)];
      })
      .filter(([key]) => Boolean(key))
  );
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
    const event = normalizeEvent(body, request);

    try {
      await prisma.auditLog.create({
        data: {
          action: "SITE_ANALYTICS",
          resource: `activemirror.ai:${event.event}`,
          details: JSON.stringify(event),
          severity: "INFO",
        },
      });
      return NextResponse.json({ ok: true, stored: true });
    } catch (error) {
      console.error("[Analytics] store unavailable:", error);
      return NextResponse.json({ ok: true, stored: false }, { status: 202 });
    }
  } catch (error) {
    console.error("[Analytics] capture failed:", error);
    return NextResponse.json({ error: "Analytics capture failed." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!localOrToken(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") || 1000), 5000);
  const rows = await prisma.auditLog.findMany({
    where: { action: "SITE_ANALYTICS" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const events = rows.flatMap((row) => {
    try {
      return [{ ...JSON.parse(row.details), createdAt: row.createdAt.toISOString() }];
    } catch {
      return [];
    }
  });

  const byPath = new Map<string, number>();
  const byEvent = new Map<string, number>();
  const byTarget = new Map<string, number>();

  for (const event of events) {
    byPath.set(event.path, (byPath.get(event.path) || 0) + 1);
    byEvent.set(event.event, (byEvent.get(event.event) || 0) + 1);
    if (event.target || event.label) {
      const key = [event.event, event.target || event.label, event.path].filter(Boolean).join(" | ");
      byTarget.set(key, (byTarget.get(key) || 0) + 1);
    }
  }

  const top = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([key, count]) => ({ key, count }));

  return NextResponse.json({
    ok: true,
    count: events.length,
    byEvent: top(byEvent),
    byPath: top(byPath),
    byTarget: top(byTarget),
    recent: events.slice(0, 50),
  });
}
