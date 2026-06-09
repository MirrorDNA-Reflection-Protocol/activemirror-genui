import Link from "next/link";
import SiteTelemetry from "./SiteTelemetry";

type PublicPageKind = "trust" | "compare" | "glass";

const pages = {
  trust: {
    eyebrow: "What Active Mirror will and will not do",
    title: "Useful AI work without silent access.",
    body:
      "Active Mirror can prepare useful work from a request alone. Private files, accounts, devices, saved context, and external sends wait until you approve them.",
    primary: "Scope a pilot",
    primaryHref: "/intake?focus=pilot",
  },
  compare: {
    eyebrow: "Why this is different",
    title: "A chatbot gives an answer. Active Mirror builds controlled work.",
    body:
      "The model can change. The difference is the work layer around it: what source is needed, what approval is required, what was assumed, and what can be exported.",
    primary: "See it run",
    primaryHref: "/mirror",
  },
  glass: {
    eyebrow: "Evidence examples",
    title: "Inspect the work instead of trusting the answer.",
    body:
      "These public-safe examples show the shape of evidence, approvals, and records. Private truth stays private until it has a real signed record.",
    primary: "Download evidence sample",
    primaryHref: "/api/mirror/proof-ledger?format=markdown",
  },
} satisfies Record<PublicPageKind, { eyebrow: string; title: string; body: string; primary: string; primaryHref: string }>;

const trustRows = [
  ["The request", "Used to build the visible workspace", "allowed"],
  ["The model", "Can propose text, plans, and drafts", "controlled"],
  ["Private files", "Never read from the public site", "ask first"],
  ["Saved context", "Used only when allowed and removable later", "ask first"],
  ["External actions", "Email, account, browser, and device actions wait", "blocked"],
  ["Work record", "Stores what was claimed, assumed, approved, or left open", "exportable"],
];

const compareRows = [
  ["Default chatbot", "Returns an answer", "Often hides sources, route, saved context, and action boundary"],
  ["Agent wrapper", "Calls tools", "Can act before the user sees the authority boundary"],
  ["Enterprise audit tool", "Audits fleets", "Usually points at enterprise policy, not the user's live work"],
  ["Active Mirror", "Builds the workspace", "Keeps sources, approval, saved context, evidence, and next action visible"],
];

const glassCards = [
  {
    k: "Work record",
    v: "exportable",
    body: "Every promoted claim can point to a source, an approval, a previous record, or an open gap.",
  },
  {
    k: "Decision notes",
    v: "honest states",
    body: "The system shows blocked, waiting, missing, and queued states instead of smoothing them away.",
  },
  {
    k: "Model changes",
    v: "measured drift",
    body: "When the model changes, the product should show what stayed stable and what drifted.",
  },
  {
    k: "Removal",
    v: "downstream effect",
    body: "If saved context or a source is removed, future exports should show what changed because of it.",
  },
];

function PublicNav() {
  return (
    <nav className="proofnav">
      <Link className="proofbrand" href="/">
        <span>⟡</span>
        <b>Active Mirror</b>
      </Link>
      <div className="proofnav__links">
        <Link href="/trust">Review</Link>
        <Link href="/glass">Evidence</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/intake">Talk to us</Link>
      </div>
      <Link className="proofnav__cta" href="/intake?focus=pilot">Scope a pilot</Link>
    </nav>
  );
}

function ProofCard({ k, v, body }: { k: string; v: string; body: string }) {
  return (
    <div className="proofcard">
      <div className="proofcard__k">{k}</div>
      <div className="proofcard__v">{v}</div>
      <p>{body}</p>
    </div>
  );
}

function TrustBody() {
  return (
    <>
      <section className="proofband">
        <div className="proofband__head">
          <h2>The practical boundary</h2>
          <p>No private action is implied by a polished UI. Active Mirror names what it can do before it acts.</p>
        </div>
        <div className="boundary">
          {trustRows.map(([lane, meaning, state]) => (
            <div className="boundary__row" key={lane}>
              <span>{lane}</span>
              <b>{meaning}</b>
              <i>{state}</i>
            </div>
          ))}
        </div>
      </section>
      <section className="proofband proofband--split">
        <ProofCard k="What leaves the browser" v="only the submitted task" body="The public preview sends the request needed to generate the workspace. It does not read local files, accounts, saved context, or devices." />
        <ProofCard k="What can be removed" v="context, source, export" body="Durable context must say where it came from. Removing it should show what changed downstream." />
        <ProofCard k="What backs the work" v="source or record" body="Claims are used only when they can point to a source, an approval record, or a visible open gap." />
      </section>
    </>
  );
}

function CompareBody() {
  return (
    <>
      <section className="proofband">
        <div className="proofband__head">
          <h2>The distinction</h2>
          <p>This is not an IQ claim. It is a product claim: what the system forces into view before, during, and after the model proposes.</p>
        </div>
        <div className="comparetable">
          {compareRows.map(([lane, output, limit]) => (
            <div className="comparetable__row" key={lane}>
              <span>{lane}</span>
              <b>{output}</b>
              <i>{limit}</i>
            </div>
          ))}
        </div>
      </section>
      <section className="proofband proofband--split">
        <ProofCard k="Reflect first" v="clear request" body="Goal, constraints, unknowns, and approval needs are reflected before the workspace is promoted." />
        <ProofCard k="Build the surface" v="not a wall of text" body="The output becomes a brief, board, plan, approval queue, or exportable pack." />
        <ProofCard k="Keep evidence attached" v="owned record" body="The useful work travels with its source route, assumptions, gaps, and work record." />
      </section>
    </>
  );
}

function GlassBody() {
  return (
    <>
      <section className="proofband">
        <div className="proofband__head">
          <h2>Public-safe examples</h2>
          <p>These are the evidence examples a buyer should be able to inspect without gaining private access.</p>
        </div>
        <div className="proofgrid">
          {glassCards.map((card) => <ProofCard key={card.k} {...card} />)}
        </div>
      </section>
      <section className="proofband">
        <div className="glassline">
          <span>Evidence record sample</span>
          <b>downloadable</b>
          <Link href="/api/mirror/proof-ledger?format=markdown">Download sample</Link>
        </div>
        <div className="glassline">
          <span>Technical shape for review</span>
          <b>developer view</b>
          <Link href="/api/mirror/contracts">Open technical JSON</Link>
        </div>
        <div className="glassline">
          <span>Decision notes stream</span>
          <b>developer view</b>
          <Link href="/api/mirror/critique?format=ndjson">Open technical stream</Link>
        </div>
      </section>
    </>
  );
}

export default function PublicSystemPage({ kind }: { kind: PublicPageKind }) {
  const page = pages[kind];
  return (
    <main className="proofpage">
      <SiteTelemetry surface="support_page" />
      <PublicNav />
      <header className="proofhero">
        <div className="proofhero__k">⟡ {page.eyebrow}</div>
        <h1>{page.title}</h1>
        <p>{page.body}</p>
        <div className="proofhero__actions">
          <Link className="btn btn--primary btn--lg" data-analytics={`${kind}_primary`} href={page.primaryHref}>{page.primary}</Link>
          <Link className="btn btn--ghost btn--lg" data-analytics={`${kind}_talk_to_us`} href="/intake">Talk to us</Link>
        </div>
      </header>
      {kind === "trust" ? <TrustBody /> : null}
      {kind === "compare" ? <CompareBody /> : null}
      {kind === "glass" ? <GlassBody /> : null}
    </main>
  );
}
