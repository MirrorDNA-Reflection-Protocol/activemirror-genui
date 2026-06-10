import Image from "next/image";
import Link from "next/link";
import SiteTelemetry from "./SiteTelemetry";

const frontDoorRoutes = [
  {
    title: "Try the workspace",
    body: "Open a public sample workspace with sources, assumptions, gaps, and next steps visible.",
    action: "Try the workspace",
    href: `/mirror?prompt=${encodeURIComponent("Build a vendor evidence workspace with sources, assumptions, gaps, and next steps")}`,
    analytics: "frontdoor_try_workspace",
  },
  {
    title: "Apply with one workflow",
    body: "Bring one workflow that must become a reviewed decision, plan, or repeatable process.",
    action: "Apply with one workflow",
    href: "/intake?focus=pilot",
    analytics: "frontdoor_apply_workflow",
  },
];

const trustChecks = [
  "Shows what it used",
  "Names what is missing",
  "Asks before sensitive steps",
  "Gives you the next move",
];

const sprintStages = [
  {
    label: "Scope",
    title: "Fit before build",
    body: "We confirm the business result, owner, inputs, deadline, and decision maker before building.",
  },
  {
    label: "Route",
    title: "Evidence trail",
    body: "Sources, assumptions, gaps, and approval points are separated so the work can be reviewed.",
  },
  {
    label: "Build",
    title: "Working workspace",
    body: "You get a usable brief, checklist, form, board, or handoff pack around the real workflow.",
  },
  {
    label: "Decide",
    title: "Deploy or pause",
    body: "The output names what worked, what is missing, and the smallest responsible deployment path.",
  },
];

const proofSources = [
  "Vendor website or published documentation",
  "Security, privacy, or compliance page",
  "Approved public materials or sanitized contract notes",
  "Independent reference or customer proof signal",
];

const proofAssumptions = [
  "The first useful output is an evidence brief, not a final recommendation.",
  "The team wants proof before promotion into a decision.",
];

const proofGaps = [
  "Current pricing, SLA, or contractual terms need approved source lookup.",
  "Private files and account data were not used in this public sample.",
];

const useCases = [
  {
    label: "Teams",
    title: "Turn AI output into work people can review.",
    body: "Decision briefs, plans, checklists, and handoffs stay attached to an evidence trail.",
  },
  {
    label: "Companies",
    title: "Move faster without losing control.",
    body: "Sensitive context, model routes, approvals, and next actions stay visible before rollout.",
  },
  {
    label: "Public sector",
    title: "Use AI with public accountability.",
    body: "Service workflows can preserve sources, review boundaries, and local trust requirements.",
  },
  {
    label: "National programs",
    title: "Build capacity beyond one vendor.",
    body: "Local workflows, local records, and national-language work can be routed without pretending models are magic.",
  },
];

const starterRoutes = [
  {
    tag: "Best first step",
    title: "72-hour proof sprint",
    body: "Send one serious workflow. If it fits, we build the workspace and evidence trail around that exact workflow.",
    href: "/intake?focus=pilot",
    action: "Apply with one workflow",
    featured: true,
  },
  {
    tag: "Self-serve preview",
    title: "Public workspace",
    body: "Try the generated workspace with public-safe sample input before sharing private context.",
    href: "/mirror",
    action: "Try the workspace",
    featured: false,
  },
  {
    tag: "Sensitive work",
    title: "Private-context plan",
    body: "Use this route when files, accounts, saved context, or external actions may be needed later.",
    href: "/intake?focus=pilot",
    action: "Apply with one workflow",
    featured: false,
  },
];

function BrandLink() {
  return (
    <Link className="brand" href="#top" aria-label="Active Mirror">
      <Image className="mk" src="/am-mark-bone.png" alt="" width={24} height={24} priority />
      <b>Active Mirror</b>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow">
      <span className="tick">⟡</span>
      {children}
    </span>
  );
}

function FrontDoorPanel() {
  return (
    <div className="frontdoor" data-testid="front-door-panel">
      <div className="frontdoor__head">
        <span>Choose a route</span>
        <b>What should happen first?</b>
      </div>
      <div className="frontdoor__routes">
        {frontDoorRoutes.map((route) => (
          <Link
            className="frontdoor__route"
            data-analytics={route.analytics}
            href={route.href}
            key={route.title}
          >
            <span className="frontdoor__title">{route.title}</span>
            <span className="frontdoor__body">{route.body}</span>
            <span className="frontdoor__action">{route.action} →</span>
          </Link>
        ))}
      </div>
      <div className="trust-strip" aria-label="Trust boundaries">
        {trustChecks.map((check) => (
          <span key={check}><i></i>{check}</span>
        ))}
      </div>
    </div>
  );
}

function ProofArtifact() {
  return (
    <article className="proof-artifact" data-testid="homepage-proof-artifact">
      <div className="proof-artifact__head">
        <span>Sanitized sample</span>
        <b>Vendor evidence workspace</b>
      </div>
      <div className="proof-artifact__body">
        <section>
          <h3>Source targets</h3>
          <ul>
            {proofSources.map((source) => <li key={source}>{source}</li>)}
          </ul>
        </section>
        <div className="proof-artifact__split">
          <section>
            <h3>Assumptions</h3>
            <ul>
              {proofAssumptions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
          <section>
            <h3>Gaps</h3>
            <ul>
              {proofGaps.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </div>
        <div className="proof-artifact__gate">
          <span>Approval gate</span>
          <b>Live browser/source lookup · approval required</b>
        </div>
      </div>
    </article>
  );
}

export default function ActiveMirrorSite() {
  return (
    <main className="site" id="top">
      <SiteTelemetry surface="public_site" />
      <nav className="nav">
        <div className="wrap">
          <BrandLink />
          <div className="nav__links">
            <a href="#how-it-works">How it works</a>
            <a href="#proof">Proof</a>
            <a href="#start">Start</a>
          </div>
          <div className="nav__r">
            <span className="nav__status"><span className="dot"></span>Review before action</span>
            <Link className="btn btn--primary" data-analytics="nav_try_workspace" href="/mirror">Try the workspace <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <header className="hero hero--compressed">
        <div className="hero__grid"></div>
        <div className="wrap">
          <div className="hero__front">
            <div className="hero__copy">
              <h1>Active Mirror</h1>
              <p className="hero__claim">Trust by Design</p>
              <p className="hero__promise">Bring one AI workflow. Leave with a reviewable workspace.</p>
              <p className="hero__lede">
                We scope the workflow first. If it fits, Active Mirror builds a working proof that shows sources,
                gaps, approvals, and the next deployment decision.
              </p>
              <p className="hero__trust">Made in India by N1 Intelligence (OPC) Pvt. Ltd. Public preview first; private access waits for approval.</p>
              <div className="hero__cta">
                <Link className="btn btn--primary btn--lg" data-analytics="hero_apply_workflow" href="/intake?focus=pilot">Apply with one workflow <span className="arr">→</span></Link>
                <Link className="btn btn--ghost btn--lg" data-analytics="hero_try_workspace" href="/mirror">Try the workspace <span className="arr">→</span></Link>
              </div>
            </div>
            <FrontDoorPanel />
          </div>
        </div>
      </header>

      <section className="band sprint" id="how-it-works" data-analytics-section="how-it-works">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>How the sprint works</Eyebrow>
            <h2>A useful proof or a responsible stop.</h2>
            <p className="band__sub">
              The proof sprint has four stages. Each stage leaves something your team can inspect: scope, route, workspace, and decision.
            </p>
          </div>
          <div className="sprint__grid">
            {sprintStages.map((item) => (
              <div className="sprint__item" key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="band">
        <div className="wrap">
          <div className="proof-split">
            <div className="band__head">
              <Eyebrow>Proof on the page</Eyebrow>
              <h2>The evidence trail is visible before you leave the homepage.</h2>
              <p className="band__sub">
                Evidence trail means source targets, assumptions, gaps, and approval gates stay attached to the output.
              </p>
              <div className="proof-links">
                <Link className="btn btn--ghost" href="/proof-sprint">Proof sprint details</Link>
                <Link className="btn btn--ghost" href="/trust">Trust boundary</Link>
                <Link className="btn btn--ghost" href="/api/mirror/proof-ledger?format=markdown">Download sample</Link>
              </div>
            </div>
            <ProofArtifact />
          </div>
        </div>
      </section>

      <section id="start" className="band" data-analytics-section="start">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>Who should start</Eyebrow>
            <h2>Bring work that has to survive review.</h2>
            <p className="band__sub">
              Active Mirror is for decisions, briefs, plans, and workflows where the team needs useful output and a clear evidence trail.
            </p>
          </div>
          <div className="usecases">
            {useCases.map((item) => (
              <div className="usecase" key={item.title}>
                <div className="usecase__label">{item.label}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <div className="engage">
            {starterRoutes.map((item) => (
              <div className={item.featured ? "eng eng--feature" : "eng"} key={item.title}>
                <span className="eng__tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="eng__foot">
                  <span className="eng__price">{item.featured ? "Recommended first" : "Available now"}</span>
                  <Link
                    className="eng__go"
                    data-analytics={`start_${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`}
                    href={item.href}
                  >
                    {item.action} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <div className="foot__brand">
            <BrandLink />
            <p>AI workspaces for decisions, briefs, plans, and workflows that need review before action.</p>
          </div>
          <div className="foot__col">
            <h5>Product</h5>
            <a href="#how-it-works">How it works</a>
            <Link href="/mirror">Workspace</Link>
            <Link href="/trust">Trust boundary</Link>
            <Link href="/proof-sprint">Proof sprint</Link>
          </div>
          <div className="foot__col">
            <h5>Start</h5>
            <Link href="/intake?focus=pilot">Apply with one workflow</Link>
            <Link href="/mirror">Try the workspace</Link>
            <a href="#proof">Evidence trail</a>
            <Link href="/compare">Compare</Link>
          </div>
          <div className="foot__col">
            <h5>Evidence</h5>
            <Link href="/api/mirror/proof-ledger?format=markdown">Download sample</Link>
            <Link href="/glass">Technical examples</Link>
            <Link href="/intake">General intake</Link>
          </div>
        </div>
        <div className="wrap foot__legal">
          <div className="foot__bottom">
            <span className="cp">© 2026 N1 Intelligence (OPC) Pvt Ltd</span>
            <span className="sov"><span className="gl">⟡</span> Made in India. Built for owner-controlled AI work.</span>
          </div>
          <p className="foot__tm">
            Active Mirror™ and Trust by Design™ are trademarks of N1 Intelligence (OPC) Pvt. Ltd.
            Technical details live behind the public evidence examples.
          </p>
        </div>
      </footer>
    </main>
  );
}
