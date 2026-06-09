import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { getFunnelSnapshot } from "@/lib/funnelAnalytics";
import { OPS_COOKIE_NAME, authorizedOpsAccess } from "@/lib/opsAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Funnel",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ days?: string; auth?: string }>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function pct(value: number) {
  return `${value.toFixed(value % 1 ? 1 : 0)}%`;
}

function LoginPanel({ failed }: { failed: boolean }) {
  return (
    <main className="ops-page">
      <section className="ops-login">
        <div className="ops-kicker">Active Mirror operations</div>
        <h1>Funnel dashboard</h1>
        <p>This view is private. Use a localhost tunnel or the analytics admin token to inspect traffic, conversion, and lead capture.</p>
        <form action="/api/ops/session" method="post" className="ops-login__form">
          <label>
            <span>Admin token</span>
            <input name="token" type="password" autoComplete="current-password" />
          </label>
          <button className="btn btn--primary" type="submit">Open dashboard</button>
        </form>
        {failed ? <div className="ops-login__error">Token did not match.</div> : null}
      </section>
    </main>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="ops-card">
      <span>{label}</span>
      <b>{value}</b>
      <p>{sub}</p>
    </div>
  );
}

function RankedList({ title, rows }: { title: string; rows: { key: string; count: number }[] }) {
  return (
    <section className="ops-panel">
      <h2>{title}</h2>
      <div className="ops-list">
        {rows.length ? rows.map((row) => (
          <div className="ops-list__row" key={row.key}>
            <span>{row.key}</span>
            <b>{row.count}</b>
          </div>
        )) : <div className="ops-empty">No data yet.</div>}
      </div>
    </section>
  );
}

export default async function FunnelPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const headerStore = await headers();
  const cookieStore = await cookies();
  const authorized = authorizedOpsAccess({
    host: headerStore.get("host"),
    authorization: headerStore.get("authorization"),
    cookie: cookieStore.get(OPS_COOKIE_NAME)?.value,
  });

  if (!authorized) return <LoginPanel failed={params.auth === "failed"} />;

  const days = Number(params.days || 14);
  const snapshot = await getFunnelSnapshot(days);
  const { summary } = snapshot;

  return (
    <main className="ops-page">
      <nav className="ops-nav">
        <Link href="/">Active Mirror</Link>
        <div>
          <Link href="/mirror">Workspace</Link>
          <Link href="/intake">Intake</Link>
          <form action="/api/ops/session" method="post">
            <input type="hidden" name="action" value="logout" />
            <button type="submit">Log out</button>
          </form>
        </div>
      </nav>

      <header className="ops-hero">
        <div>
          <div className="ops-kicker">Revenue front door</div>
          <h1>Funnel dashboard</h1>
          <p>First-party signal for the storefront: who stopped, what they touched, whether they tried the workspace, and whether the proof-sprint path captured a lead.</p>
        </div>
        <div className="ops-window">
          <Link className={summary.days === 7 ? "active" : ""} href="/ops/funnel?days=7">7d</Link>
          <Link className={summary.days === 14 ? "active" : ""} href="/ops/funnel?days=14">14d</Link>
          <Link className={summary.days === 30 ? "active" : ""} href="/ops/funnel?days=30">30d</Link>
        </div>
      </header>

      {snapshot.storeUnavailable ? (
        <section className="ops-alert">
          <b>Analytics store unavailable.</b>
          <span>The site is still usable, but funnel decisions are blocked until the database is reachable.</span>
        </section>
      ) : null}

      <section className="ops-metrics">
        <MetricCard label="Visitors" value={summary.visitors} sub={`${summary.pageViews} page views · ${summary.sessions} sessions`} />
        <MetricCard label="72h sprint clicks" value={summary.sprintClicks} sub={`${pct(summary.clickRate)} of public visitors`} />
        <MetricCard label="Workspace starts" value={summary.workspaceStarts} sub={`${summary.artifacts} delivered artifacts`} />
        <MetricCard label="Intake submits" value={summary.intakeSubmits} sub={`${pct(summary.intakeRate)} of public visitors`} />
        <MetricCard label="Captured leads" value={summary.leads} sub={`${pct(summary.leadRate)} of public visitors`} />
        <MetricCard label="Qualified leads" value={summary.qualifiedLeads} sub={`${summary.priorityLeads} priority · avg score ${summary.avgLeadScore}`} />
      </section>

      <section className="ops-panel ops-panel--decision">
        <div>
          <span>Next adjustment</span>
          <h2>{snapshot.nextAdjustment.title}</h2>
          <p>{snapshot.nextAdjustment.body}</p>
        </div>
        <b>Since {formatDate(summary.since)}</b>
      </section>

      <section className="ops-funnel">
        {snapshot.funnel.map((step) => (
          <div className="ops-funnel__step" key={step.label}>
            <div>
              <span>{step.label}</span>
              <b>{step.value}</b>
            </div>
            <i><em style={{ width: `${Math.max(2, Math.min(step.rate, 100))}%` }} /></i>
            <small>{pct(step.rate)}</small>
          </div>
        ))}
      </section>

      <section className="ops-grid">
        <RankedList title="Top CTAs" rows={snapshot.topCtas} />
        <RankedList title="Top sources" rows={snapshot.topSources} />
        <RankedList title="Top paths" rows={snapshot.topPaths} />
        <RankedList title="Devices" rows={snapshot.devices} />
      </section>

      <section className="ops-panel">
        <h2>Recent leads</h2>
        <div className="ops-leads">
          {snapshot.recentLeads.length ? snapshot.recentLeads.map((lead) => (
            <article className="ops-lead" key={`${lead.email}-${lead.createdAt}`}>
              <div>
                <b>{lead.name || "Unnamed lead"}</b>
                <span>{lead.company || lead.emailDomain || "No organization"}</span>
                <span className={`ops-grade ops-grade--${lead.qualification.grade}`}>
                  {lead.qualification.grade} · {lead.qualification.score}
                </span>
              </div>
              <p>{lead.useCasePreview || "No use case preview."}</p>
              {lead.proofTargetPreview ? <p className="ops-lead__proof">Proof target: {lead.proofTargetPreview}</p> : null}
              <p className="ops-lead__next">{lead.qualification.nextAction}</p>
              <footer>
                <span>{lead.sensitivity || "sensitivity unknown"}</span>
                <span>{lead.infrastructure || "infra unknown"}</span>
                <span>{lead.timeline || "timeline unknown"}</span>
                <span>{lead.decisionRole || "owner unknown"}</span>
                {lead.qualification.reasons.map((reason) => <span key={reason}>{reason}</span>)}
                <time>{formatDate(lead.createdAt)}</time>
              </footer>
            </article>
          )) : <div className="ops-empty">No captured leads in this window.</div>}
        </div>
      </section>
    </main>
  );
}
