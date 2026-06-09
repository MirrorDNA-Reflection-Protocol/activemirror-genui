import Image from "next/image";
import Link from "next/link";
import SiteTelemetry from "./SiteTelemetry";

const frontDoorRoutes = [
  {
    title: "I need to make a decision",
    body: "Get the brief, sources, open questions, and next step in one place.",
    action: "Start a decision brief",
    href: `/mirror?prompt=${encodeURIComponent("Build a vendor evidence workspace")}`,
  },
  {
    title: "I need to repeat a workflow",
    body: "Turn the task into a workspace your team can run again.",
    action: "Map the workflow",
    href: "/intake?focus=deployment",
  },
  {
    title: "I need to use sensitive context",
    body: "Use files, accounts, or saved context only when the next step is clear.",
    action: "Plan safe data use",
    href: "/intake?focus=private-context",
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

const useCases = [
  {
    label: "People",
    title: "Finish the work without fighting the AI.",
    body: "Decisions, research, documents, plans, and next actions in one workspace instead of a long chat thread.",
  },
  {
    label: "Companies",
    title: "Move faster without losing control.",
    body: "Repeatable workflows, review before action, private context only when approved, and outputs teams can reuse.",
  },
  {
    label: "Governments",
    title: "Use AI with local trust and public accountability.",
    body: "Language, data boundaries, review trails, and service workflows that can be inspected before they affect citizens.",
  },
  {
    label: "Countries",
    title: "Build capacity instead of depending on one vendor.",
    body: "A path to local models, local workflows, local records, and national-language use cases without pretending models are magic.",
  },
  {
    label: "Builders",
    title: "Wrap model power in a product people can trust.",
    body: "Give users the workspace, approval points, source trail, and recovery path around whatever model does the reasoning.",
  },
  {
    label: "Leaders",
    title: "Know what changed, what is blocked, and what happens next.",
    body: "The system should make risk visible early: missing facts, sensitive data, unclear authority, and handoff gaps.",
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
    title: "It keeps humans in the loop before it matters.",
    body: "Approvals appear before sensitive reads, external sends, account actions, or deployment steps.",
  },
  {
    title: "It creates a work surface, not just text.",
    body: "The result can become a brief, checklist, board, review lane, source queue, export, or repeatable workflow.",
  },
  {
    title: "It leaves a review trail.",
    body: "The output keeps enough source, assumption, approval, and next-step context for another person to inspect it.",
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
    href: "/intake?focus=review",
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
    href: "/intake?focus=platform",
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
        <span>Start here</span>
        <b>What do you need to get done?</b>
      </div>
      <div className="frontdoor__routes">
        {frontDoorRoutes.map((route) => (
          <Link
            className="frontdoor__route"
            data-analytics={`frontdoor_${route.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`}
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
            <a href="#proof">How it stays safe</a>
            <a href="#work-with-us">Start</a>
          </div>
          <div className="nav__r">
            <span className="nav__status"><span className="dot"></span>evidence-first AI work</span>
            <Link className="btn btn--primary" data-analytics="nav_build_workspace" href="/mirror">Build my first workspace <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <header className="hero hero--compressed">
        <div className="hero__grid"></div>
        <div className="wrap">
          <div className="hero__front">
            <div className="hero__copy">
              <Eyebrow>72-hour proof sprint</Eyebrow>
              <h1>Active Mirror builds the AI workspace for the work you need done.</h1>
              <p className="hero__lede">
                It shows what it used, what it still needs, and what is safe to do next. Send one real workflow and
                apply for a qualified proof sprint. More capable AI, with a human in the loop before it matters.
              </p>
              <div className="hero__cta">
                <Link className="btn btn--primary btn--lg" data-analytics="hero_72h_sprint" href="/intake?focus=pilot">Apply for a 72-hour sprint <span className="arr">→</span></Link>
                <Link className="btn btn--ghost btn--lg" data-analytics="hero_try_workspace" href="/mirror">Try the workspace</Link>
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
            <Eyebrow>The Active Mirror Challenge</Eyebrow>
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
          <Link className="challenge__cta" data-analytics="challenge_72h_sprint" href="/intake?focus=challenge">
            Apply for the 72-hour sprint →
          </Link>
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
            <Link href="/intake?focus=pilot">Scoped pilot</Link>
            <Link href="/intake?focus=review">AI review</Link>
            <Link href="/intake?focus=platform">Platform build</Link>
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
