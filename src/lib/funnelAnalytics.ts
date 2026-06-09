import { prisma } from "@/lib/prisma";
import { qualifyLead, type LeadQualification } from "@/lib/leadQualification";

type AnalyticsRecord = {
  event: string;
  path: string;
  sessionId: string;
  target: string;
  label: string;
  href: string;
  referrer: string;
  device: string;
  viewport: string;
  durationMs: number;
  createdAt: string;
  utm?: Record<string, string>;
  meta?: Record<string, unknown>;
};

type LeadRecord = {
  name: string;
  email: string;
  company: string;
  sensitivity: string;
  infrastructure: string;
  timeline: string;
  decisionRole?: string;
  proofTarget?: string;
  useCase: string;
  qualification?: LeadQualification;
  createdAt: string;
};

function parseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function topMap(map: Map<string, number>, limit = 12) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function emailDomain(email: string) {
  return email.includes("@") ? email.split("@").pop() || "" : "";
}

function sourceKey(event: AnalyticsRecord) {
  const utm = event.utm || {};
  return utm.utm_source || utm.ref || event.referrer || "direct / unknown";
}

function nextAdjustment(input: {
  visitors: number;
  sprintClicks: number;
  workspaceStarts: number;
  intakeSubmits: number;
  intakeReady: number;
  leads: number;
  priorityLeads?: number;
}) {
  if (input.visitors < 20) {
    return {
      title: "Traffic is still the constraint.",
      body: "Do not over-optimize copy from a tiny sample. Get qualified people to the page first: direct outreach, founder posts, and one proof-sprint ask.",
    };
  }
  if (input.sprintClicks === 0) {
    return {
      title: "The window is not stopping people.",
      body: "The 72-hour proof sprint CTA is not earning clicks. Tighten the hero proof, make the sample more concrete, or put the buyer problem earlier.",
    };
  }
  if (input.intakeSubmits === 0) {
    return {
      title: "The offer is interesting but the form is not converting.",
      body: "Clicks are reaching intake without submissions. Reduce fields, add a no-obligation line, or replace the form with one specific workflow question.",
    };
  }
  if (input.intakeReady > input.leads) {
    return {
      title: "The email handoff may be leaking leads.",
      body: "Intake can prepare requests without a stored lead. Make the next step obvious and consider server-side email delivery once trust and spam controls are ready.",
    };
  }
  if (input.leads > 0 && !input.priorityLeads) {
    return {
      title: "Lead quality needs sharper proof signals.",
      body: "Captured leads exist, but none look priority yet. Tighten outreach around urgent owned workflows and ask what proof would justify a paid sprint.",
    };
  }
  if (input.workspaceStarts > input.sprintClicks * 2 && input.sprintClicks < 3) {
    return {
      title: "The product is being tried, but the buying path is weak.",
      body: "Add a proof-sprint handoff after useful workspace output, not only on the homepage.",
    };
  }
  return {
    title: "Follow up and learn from the qualified leads.",
    body: "The funnel has signal. The next commercial work is fast response, clear scope, and turning each real workflow into a repeatable proof asset.",
  };
}

export async function getFunnelSnapshot(days = 14) {
  const safeDays = Math.max(1, Math.min(Math.round(days), 90));
  const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

  try {
    const rows = await prisma.auditLog.findMany({
      where: {
        action: { in: ["SITE_ANALYTICS", "LEAD_CAPTURE"] },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    const events: AnalyticsRecord[] = [];
    const leads: LeadRecord[] = [];

    for (const row of rows) {
      if (row.action === "SITE_ANALYTICS") {
        const parsed = parseJson<Omit<AnalyticsRecord, "createdAt">>(row.details);
        if (parsed?.event) events.push({ ...parsed, createdAt: row.createdAt.toISOString() });
      }
      if (row.action === "LEAD_CAPTURE") {
        const parsed = parseJson<Omit<LeadRecord, "createdAt">>(row.details);
        if (parsed?.email) leads.push({ ...parsed, createdAt: row.createdAt.toISOString() });
      }
    }

    const pageViews = events.filter((event) => event.event === "page_view");
    const publicViews = pageViews.filter((event) => event.target === "public_site" || event.path === "/");
    const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean));
    const publicSessions = new Set(publicViews.map((event) => event.sessionId).filter(Boolean));
    const ctaClicks = events.filter((event) => event.event === "cta_click");
    const sprintClicks = ctaClicks.filter((event) =>
      `${event.target} ${event.href} ${event.label}`.includes("72h_sprint") ||
      event.href.includes("/intake?focus=pilot") ||
      /72-hour sprint/i.test(event.label || "")
    );
    const workspaceStarts = events.filter((event) => event.event === "workspace_prompt_submit");
    const artifacts = events.filter((event) => event.event === "workspace_artifact_delivered");
    const intakeSubmits = events.filter((event) => event.event === "intake_submit");
    const intakeReady = events.filter((event) => event.event === "intake_ready");
    const intakeErrors = events.filter((event) => event.event === "intake_error");
    const leadsWithQualification = leads.map((lead) => ({
      ...lead,
      qualification: lead.qualification || qualifyLead(lead),
    }));
    const priorityLeads = leadsWithQualification.filter((lead) => lead.qualification.grade === "priority");
    const qualifiedLeads = leadsWithQualification.filter((lead) => lead.qualification.grade === "priority" || lead.qualification.grade === "qualified");
    const avgLeadScore = leadsWithQualification.length
      ? Math.round(leadsWithQualification.reduce((sum, lead) => sum + lead.qualification.score, 0) / leadsWithQualification.length)
      : 0;

    const byPath = new Map<string, number>();
    const bySource = new Map<string, number>();
    const byCta = new Map<string, number>();
    const byDevice = new Map<string, number>();

    for (const event of events) {
      if (event.path) byPath.set(event.path, (byPath.get(event.path) || 0) + 1);
      if (event.event === "page_view") bySource.set(sourceKey(event), (bySource.get(sourceKey(event)) || 0) + 1);
      if (event.event === "cta_click") byCta.set(event.target || event.label || event.href || "unknown", (byCta.get(event.target || event.label || event.href || "unknown") || 0) + 1);
      if (event.device) byDevice.set(event.device, (byDevice.get(event.device) || 0) + 1);
    }

    const visitorBase = publicSessions.size || publicViews.length;
    const summary = {
      days: safeDays,
      since: since.toISOString(),
      events: events.length,
      visitors: visitorBase,
      sessions: sessions.size,
      pageViews: pageViews.length,
      sprintClicks: sprintClicks.length,
      workspaceStarts: workspaceStarts.length,
      artifacts: artifacts.length,
      intakeSubmits: intakeSubmits.length,
      intakeReady: intakeReady.length,
      intakeErrors: intakeErrors.length,
      leads: leads.length,
      priorityLeads: priorityLeads.length,
      qualifiedLeads: qualifiedLeads.length,
      avgLeadScore,
      clickRate: pct(sprintClicks.length, visitorBase),
      intakeRate: pct(intakeSubmits.length, visitorBase),
      leadRate: pct(leads.length, visitorBase),
    };

    return {
      ok: true,
      storeUnavailable: false,
      summary,
      nextAdjustment: nextAdjustment(summary),
      funnel: [
        { label: "Public visitors", value: summary.visitors, rate: 100 },
        { label: "72-hour sprint clicks", value: summary.sprintClicks, rate: summary.clickRate },
        { label: "Workspace starts", value: summary.workspaceStarts, rate: pct(summary.workspaceStarts, summary.visitors) },
        { label: "Intake submits", value: summary.intakeSubmits, rate: summary.intakeRate },
        { label: "Captured leads", value: summary.leads, rate: summary.leadRate },
      ],
      topPaths: topMap(byPath),
      topSources: topMap(bySource),
      topCtas: topMap(byCta),
      devices: topMap(byDevice),
      recentLeads: leadsWithQualification.slice(0, 12).map((lead) => ({
        ...lead,
        emailDomain: emailDomain(lead.email),
        useCasePreview: lead.useCase.replace(/\s+/g, " ").slice(0, 260),
        proofTargetPreview: (lead.proofTarget || "").replace(/\s+/g, " ").slice(0, 220),
      })),
      recentEvents: events.slice(0, 20),
    };
  } catch (error) {
    console.error("[Funnel] snapshot unavailable:", error);
    return {
      ok: false,
      storeUnavailable: true,
      summary: {
        days: safeDays,
        since: since.toISOString(),
        events: 0,
        visitors: 0,
        sessions: 0,
        pageViews: 0,
        sprintClicks: 0,
        workspaceStarts: 0,
        artifacts: 0,
        intakeSubmits: 0,
        intakeReady: 0,
        intakeErrors: 0,
        leads: 0,
        priorityLeads: 0,
        qualifiedLeads: 0,
        avgLeadScore: 0,
        clickRate: 0,
        intakeRate: 0,
        leadRate: 0,
      },
      nextAdjustment: {
        title: "Analytics store is unavailable.",
        body: "The site can still run, but revenue decisions need the database connection fixed before we trust the funnel.",
      },
      funnel: [],
      topPaths: [],
      topSources: [],
      topCtas: [],
      devices: [],
      recentLeads: [],
      recentEvents: [],
    };
  }
}
