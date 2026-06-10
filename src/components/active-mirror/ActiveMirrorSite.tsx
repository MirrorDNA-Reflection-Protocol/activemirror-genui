import Image from "next/image";
import Link from "next/link";
import SiteTelemetry from "./SiteTelemetry";

const frontDoorRoutes = [
  {
    title: "Try the public workspace",
    body: "Generate a brief, source route, assumptions, gaps, and next move without sending private data.",
    action: "Open workspace",
    href: `/mirror?prompt=${encodeURIComponent("Build a vendor evidence workspace with sources, assumptions, gaps, and next steps")}`,
    analytics: "frontdoor_public_workspace",
  },
  {
    title: "Scope a real workflow",
    body: "Bring one workflow that must become a reviewed decision, plan, or repeatable process.",
    action: "Apply with one workflow",
    href: "/intake?focus=pilot",
    analytics: "frontdoor_scope_workflow",
  },
];

const trustChecks = [
  "Shows what it used",
  "Names what is missing",
  "Asks before sensitive steps",
  "Gives you the next move",
];

const outcomes = [
  {
    number: "01",
    title: "Get the thing, not a chat transcript.",
    body: "Briefs, plans, review packets, checklists, and workflows are built as usable workspaces.",
  },
  {
    number: "02",
    title: "Know what to trust.",
    body: "Sources, assumptions, and gaps are kept separate so your team can review the work quickly.",
  },
  {
    number: "03",
    title: "Move from answer to action.",
    body: "The next approval, source check, export, or handoff is visible before anything sensitive runs.",
  },
];

const challengeSteps = [
  ["1", "Send one workflow your current AI cannot safely finish."],
  ["2", "We scope it first. If it fits, we build a working proof in 72 hours."],
  ["3", "You see what works, what is missing, and what it would take to deploy."],
];

const sprintDeliverables = [
  {
    label: "Scope",
    title: "A no-nonsense fit decision",
    body: "We name the business result, the data needed, the approval points, and the reason to proceed or stop.",
  },
  {
    label: "Workspace",
    title: "A working proof on your workflow",
    body: "You get a usable surface for the task: brief, source desk, checklist, form, review lane, or workflow board.",
  },
  {
    label: "Evidence",
    title: "A visible trail of assumptions and gaps",
    body: "The proof separates what ran, what was assumed, what still needs a source, and what needs human approval.",
  },
  {
    label: "Next",
    title: "A clear deploy-or-don't plan",
    body: "You leave with the smallest real deployment path, the blockers, and the cost/risk boundary before more work starts.",
  },
];

const useCases = [
  {
    label: "Teams",
    title: "Finish the work without fighting the AI.",
    body: "Decisions, research, documents, plans, and next actions in one workspace instead of a long chat thread.",
  },
  {
    label: "Companies",
    title: "Move faster without losing control.",
    body: "Repeatable workflows, review before action, private context only when approved, and outputs teams can reuse.",
  },
  {
    label: "Public sector",
    title: "Use AI with local trust and public accountability.",
    body: "Language, data boundaries, review trails, and service workflows that can be inspected before they affect citizens.",
  },
  {
    label: "National programs",
    title: "Build capacity instead of depending on one vendor.",
    body: "A path to local models, local workflows, local records, and national-language use cases without pretending models are magic.",
  },
];

const proofSteps = [
  ["Ask for the result", "Say the business task, audience, and deadline."],
  ["Review the route", "See sources needed, assumptions made, and questions still open."],
  ["Approve sensitive steps", "Files, accounts, devices, and sends wait until the route is clear."],
  ["Use the output", "Export the brief, hand off the workflow, or continue refining the workspace."],
];

const novelty = [
  {
    title: "It works on your actual task.",
    body: "The 72-hour sprint is built around one qualified workflow you care about, not a canned prompt or a slide deck.",
  },
  {
    title: "It admits what it cannot know.",
    body: "Missing facts, blocked access, and unverified sources stay visible instead of being smoothed into a confident answer.",
  },
  {
    title: "It can route work by sensitivity.",
    body: "Public work can use hosted models. Sensitive work can move toward local or private routes when the job requires it.",
  },
  {
    title: "It creates a work surface, not just text.",
    body: "The result can become a brief, checklist, board, review lane, source queue, export, or repeatable workflow.",
  },
];

const startingPoints = [
  {
    term: "AI workflow proof sprint",
    title: "For one workflow a chatbot cannot safely finish.",
    body: "Bring a concrete process with a real owner, deadline, and review need. The sprint turns it into a working proof or a clear no.",
  },
  {
    term: "Reviewable AI workspace",
    title: "For work that needs to become usable output.",
    body: "Briefs, plans, checklists, boards, source queues, and handoff packs stay in a workspace your team can inspect.",
  },
  {
    term: "AI governance evidence trail",
    title: "For teams that need proof before action.",
    body: "Facts, assumptions, missing sources, approval points, and next steps are kept separate instead of hidden inside a chat answer.",
  },
  {
    term: "Private-context AI workflow",
    title: "For sensitive work that cannot silently run.",
    body: "Files, accounts, private knowledge, device work, and external sends wait for a reviewed route before deeper execution.",
  },
];

const engagements = [
  {
    tag: "Best first step",
    title: "72-hour proof sprint",
    body: "Send one serious workflow. We scope it first. If it fits, we build a working Active Mirror proof around that exact workflow within 72 hours.",
    items: [
      "Your workflow, not a canned example",
      "Working workspace and review path",
      "What is live, assumed, and still needed",
    ],
    action: "Start here",
    href: "/intake?focus=pilot",
    featured: true,
  },
  {
    tag: "Sensitive work",
    title: "Private-context workflow",
    body: "For work that needs files, accounts, or team knowledge without silent access.",
    items: [
      "Approval path",
      "Safe context plan",
      "Export and review rules",
    ],
    action: "Plan the workflow",
    href: "/intake?focus=pilot",
  },
  {
    tag: "Deployment",
    title: "AI rollout control",
    body: "For teams putting models into real workflows and needing review before action.",
    items: [
      "Local or cloud deployment",
      "Model and tool routing",
      "Operational handoff",
    ],
    action: "Scope the rollout",
    href: "/intake?focus=pilot",
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

export default function ActiveMirrorSite() {
  return (
    <main className="site" id="top">
      <SiteTelemetry surface="public_site" />
      <nav className="nav">
        <div className="wrap">
          <BrandLink />
          <div className="nav__links">
            <a href="#what-it-does">Results</a>
            <a href="#proof">Proof</a>
            <a href="#work-with-us">Start</a>
          </div>
          <div className="nav__r">
            <span className="nav__status"><span className="dot"></span>review before action</span>
            <Link className="btn btn--primary" data-analytics="nav_try_workspace" href="/mirror">Try workspace <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <header className="hero hero--compressed">
        <div className="hero__grid"></div>
        <div className="wrap">
          <div className="hero__front">
            <div className="hero__copy">
              <h1>Bring one AI workflow. Leave with a reviewable workspace.</h1>
              <p className="hero__lede">
                We scope the workflow first. If it fits, Active Mirror builds a working proof that shows sources,
                gaps, approvals, and the next deployment decision.
              </p>
              <div className="hero__cta">
                <Link className="btn btn--primary btn--lg" data-analytics="hero_apply_workflow" href="/intake?focus=pilot">Apply with one workflow <span className="arr">→</span></Link>
                <Link className="btn btn--ghost btn--lg" data-analytics="hero_try_workspace" href="/mirror">Try the public workspace</Link>
              </div>
            </div>
            <FrontDoorPanel />
          </div>
        </div>
      </header>

      <section className="thesis" id="what-it-does">
        <div className="wrap">
          {outcomes.map((item) => (
            <div className="col" key={item.number}>
              <div className="n">{item.number}</div>
              <div className="t">{item.title}</div>
              <p className="d">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="challenge" data-analytics-section="challenge">
        <div className="wrap">
          <div className="challenge__copy">
            <Eyebrow>The fit test</Eyebrow>
            <h2>Give us one workflow your current AI cannot safely finish.</h2>
            <p>
              We do not promise every workflow is a fit. We qualify it first. If we cannot make it clearer,
              more usable, and safer to act on, we say that early instead of wasting your time.
            </p>
          </div>
          <div className="challenge__steps">
            {challengeSteps.map(([number, body]) => (
              <div className="challenge__step" key={number}>
                <span>{number}</span>
                <b>{body}</b>
              </div>
            ))}
          </div>
          <Link className="challenge__cta" data-analytics="challenge_apply_workflow" href="/intake?focus=pilot">
            Apply with one workflow →
          </Link>
        </div>
      </section>

      <section className="band sprint" data-analytics-section="sprint-deliverables">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>What the sprint produces</Eyebrow>
            <h2>No pitch theatre. A useful proof or a clear no.</h2>
            <p className="band__sub">
              For accepted workflows, the 72-hour sprint ends with a working artifact your team can inspect. No silent data access. No slide-only demo.
            </p>
          </div>
          <div className="sprint__grid">
            {sprintDeliverables.map((item) => (
              <div className="sprint__item" key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>Where it helps</Eyebrow>
            <h2>Use it for the work people already bring to AI.</h2>
            <p className="band__sub">
              Active Mirror is for work that has to become a decision, document, workflow, or reviewed action.
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
        </div>
      </section>

      <section className="band discovery" data-analytics-section="starting-points">
        <div className="wrap discovery__wrap">
          <div className="band__head">
            <Eyebrow>Common starting points</Eyebrow>
            <h2>Find the right route by the result you need.</h2>
            <p className="band__sub">
              Active Mirror is easiest to judge when the ask is concrete: prove one workflow, build one reviewable
              workspace, preserve the evidence trail, or route private context with approval.
            </p>
          </div>
          <div className="discovery__list">
            {startingPoints.map((item) => (
              <article className="discovery__item" key={item.term}>
                <span>{item.term}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="band">
        <div className="wrap">
          <div className="proof-split">
            <div className="band__head">
              <Eyebrow>Built for review</Eyebrow>
              <h2>It shows what happened so your team can use the result.</h2>
              <p className="band__sub">
                You should not have to guess what the AI used, skipped, assumed, or still needs from you.
              </p>
              <div className="proof-links">
                <Link className="btn btn--ghost" href="/proof-sprint">See proof sprint sample</Link>
                <Link className="btn btn--ghost" href="/trust">Review boundary</Link>
                <Link className="btn btn--ghost" href="/glass">Public evidence examples</Link>
                <Link className="btn btn--ghost" href="/compare">Compare</Link>
              </div>
            </div>
            <div className="proof-steps">
              {proofSteps.map(([step, detail], index) => (
                <div className="proof-step" key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{step}</b>
                    <p>{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>Why it feels different</Eyebrow>
            <h2>Not a smarter chat box. A way to make AI work usable.</h2>
            <p className="band__sub">
              The model can be powerful and still be wrong, blocked, or unsafe to act. Active Mirror makes that visible and turns the request into work anyway.
            </p>
          </div>
          <div className="novelty">
            {novelty.map((item) => (
              <div className="novelty__item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work-with-us" className="band">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>Start</Eyebrow>
            <h2>Pick the result you want first.</h2>
            <p className="band__sub">
              Start with one real workflow. The first deliverable should be useful even before a full deployment.
            </p>
          </div>
          <div className="engage">
            {engagements.map((item) => (
              <div className={item.featured ? "eng eng--feature" : "eng"} key={item.title}>
                <span className="eng__tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <ul className="eng__list">
                  {item.items.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <div className="eng__foot">
                  <span className="eng__price">{item.featured ? "Recommended first" : "Scoped with you"}</span>
                  <Link
                    className="eng__go"
                    data-analytics={`engagement_${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`}
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

      <section className="band">
        <div className="wrap">
          <div className="founder">
            <div className="founder__card">
              <div className="founder__id">
                <div className="founder__avatar">⟡</div>
                <div className="nm">Active Mirror</div>
                <div className="ro">by N1 Intelligence (OPC) Pvt. Ltd.</div>
              </div>
              <div className="founder__meta">
                <div className="r"><span className="k">result</span><span className="vv">Usable AI work</span></div>
                <div className="r"><span className="k">deployment</span><span className="vv">Local or cloud</span></div>
                <div className="r"><span className="k">standard</span><span className="vv">Show the work</span></div>
                <div className="r"><span className="k">origin</span><span className="vv">Made in India</span></div>
              </div>
            </div>
            <div className="founder__body">
              <Eyebrow>What you get</Eyebrow>
              <p className="lead">A finished workspace your team can review, share, and keep improving.</p>
              <p>
                It can start from public information, pause for approval when private context is needed, and keep the output useful
                even when some facts are still missing.
              </p>
              <p>
                The point is not to admire the AI. The point is to get the decision, plan, review, or workflow finished with less risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="cta">
        <div className="cta__halo"></div>
        <div className="wrap">
          <Eyebrow>72-hour proof sprint</Eyebrow>
          <h2>Bring the workflow you actually care about.</h2>
          <p>We will scope the ask first. If it fits, we turn it into a working proof, then show what is live, what needs approval, and what it would take to deploy. If it is not a fit, we say so plainly.</p>
          <div className="cta__cta">
            <Link className="btn btn--primary btn--lg" data-analytics="footer_72h_sprint" href="/intake?focus=pilot">Apply for a 72-hour sprint <span className="arr">→</span></Link>
            <Link className="btn btn--ghost btn--lg" data-analytics="footer_try_workspace" href="/mirror">Try the workspace</Link>
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
            <a href="#what-it-does">What it does</a>
            <Link href="/mirror">Workspace</Link>
            <Link href="/trust">Review boundary</Link>
            <Link href="/glass">Evidence examples</Link>
          </div>
          <div className="foot__col">
            <h5>Engage</h5>
            <Link href="/proof-sprint">72-hour proof sprint</Link>
            <Link href="/intake?focus=pilot">Scoped pilot</Link>
            <Link href="/intake?focus=workspace-proof">Workspace proof</Link>
            <Link href="/intake">General intake</Link>
          </div>
          <div className="foot__col">
            <h5>Evidence</h5>
            <Link href="/compare">Compare</Link>
            <a href="#proof">Evidence path</a>
            <Link href="/glass">Public examples</Link>
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
