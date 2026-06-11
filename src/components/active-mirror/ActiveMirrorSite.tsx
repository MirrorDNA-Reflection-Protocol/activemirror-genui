"use client";

import { useEffect } from "react";
import Link from "next/link";
import SiteTelemetry from "./SiteTelemetry";

const outcomes = [
  ["WORKSPACE", "Built to be used.", "Briefs, plans, review packets, checklists, and workflows are built as usable workspaces."],
  ["EVIDENCE", "Know what to trust.", "Sources, assumptions, and gaps are kept separate so your team can review the work quickly."],
  ["NEXT", "Move from answer to action.", "The next approval, source check, export, or handoff is visible before anything sensitive runs."],
];

const fitSteps = [
  ["1", "Send one workflow your current AI cannot safely finish.", "A concrete process with a real owner, deadline, and review need."],
  ["2", "We scope it first. If it fits, we build a working proof in 72 hours.", "If it is not a fit, we say so plainly."],
  ["3", "You see what works, what is missing, and what it would take to deploy.", "No silent data access. No slide-only demo."],
];

const sprintLedger = [
  ["Scope", "A no-nonsense fit decision", "We name the business result, the data needed, the approval points, and the reason to proceed or stop."],
  ["Workspace", "A working proof on your workflow", "A usable surface for the task: brief, source desk, checklist, form, review lane, or workflow board."],
  ["Evidence", "A visible trail of assumptions and gaps", "What ran, what was assumed, what still needs a source, and what needs human approval — kept separate."],
  ["Next", "A clear deploy-or-don't plan", "The smallest real deployment path, the blockers, and the cost and risk boundary before more work starts."],
];

const routeSteps = [
  ["Ask for the result", "Say the business task, audience, and deadline."],
  ["Review the route", "See sources needed, assumptions made, and questions still open."],
  ["Approve sensitive steps", "Files, accounts, devices, and sends wait until the route is clear."],
  ["Use the output", "Export the brief, hand off the workflow, or keep refining the workspace."],
];

const whereItHelps = [
  ["Teams", "Finish the work without fighting the AI.", "Decisions, research, documents, plans, and next actions in one workspace instead of a long chat thread."],
  ["Companies", "Move faster without losing control.", "Repeatable workflows, review before action, private context only when approved, and outputs teams can reuse."],
  ["Public sector", "Use AI with local trust and public accountability.", "Language, data boundaries, review trails, and service workflows that can be inspected before they affect citizens."],
  ["National programs", "Build capacity instead of depending on one vendor.", "A path to local models, local workflows, local records, and national-language use cases without pretending models are magic."],
];

const differenceRows = [
  ["It works on your actual task.", "The 72-hour sprint is built around one qualified workflow you care about, not a canned prompt or a slide deck."],
  ["It admits what it cannot know.", "Missing facts, blocked access, and unverified sources stay visible instead of being smoothed into a confident answer."],
  ["It routes work by sensitivity.", "Public text work, image and video briefs, design handoffs, and sensitive private routes stay separated, so the right tool is approved for the right job."],
  ["It creates a work surface, not just text.", "The result can become a brief, checklist, board, review lane, source queue, export, or repeatable workflow."],
];

const startCards = [
  {
    tag: "Recommended first",
    title: "72-hour proof sprint",
    body: "Send one serious workflow. We scope it first. If it fits, we build a working Active Mirror proof around that exact workflow within 72 hours.",
    items: ["Your workflow, not a canned example", "Working workspace and review path", "What is live, assumed, and still needed"],
    action: "Start here",
    href: "/intake?focus=pilot",
    featured: true,
  },
  {
    tag: "Sensitive work",
    title: "Private-context workflow",
    body: "For work that needs files, accounts, or team knowledge without silent access.",
    items: ["Approval path", "Safe context plan", "Export and review rules"],
    action: "Plan the workflow",
    href: "/intake?focus=pilot",
  },
  {
    tag: "Deployment",
    title: "AI rollout control",
    body: "For teams putting models into real workflows and needing review before action.",
    items: ["Local or cloud deployment", "Model and tool routing", "Operational handoff"],
    action: "Scope the rollout",
    href: "/intake?focus=pilot",
  },
];

function useHomepageMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".amr");
    if (!root) return;
    root.classList.add("amr-js");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) root.classList.add("no-fx");

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-s]"));
    const gate = root.querySelector<HTMLElement>("#gate");
    const gateText = root.querySelector<HTMLElement>("#gateText");
    const nextText = root.querySelector<HTMLElement>("#nextText");
    const receipt = root.querySelector<HTMLElement>("#rcptHash");
    const nextLine = root.querySelector<HTMLElement>('[data-s="9"]');
    const receiptLine = root.querySelector<HTMLElement>('[data-s="10"]');
    let userActed = false;

    const typeHash = (el: HTMLElement | null, value: string) => {
      if (!el) return;
      if (reduced) {
        el.textContent = value;
        return;
      }
      el.textContent = "";
      value.split("").forEach((char, index) => {
        later(() => {
          el.textContent = `${el.textContent || ""}${char}`;
        }, index * 32);
      });
    };

    const revealThrough = (n: number) => {
      lines.forEach((line) => {
        if (Number(line.dataset.s) <= n) line.classList.add("on");
      });
    };

    const approve = (byUser: boolean) => {
      if (!gate || !gateText || !nextText) return;
      if (gate.classList.contains("resolved") || gate.classList.contains("held")) return;
      gate.classList.add("resolved");
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      gateText.textContent = `${byUser ? "approved by you" : "approved"} · logged ${hh}:${mm} IST`;
      nextText.classList.remove("b-locked");
      nextText.innerHTML = "Draft request → legal review → <strong>send Monday</strong>";
      later(() => {
        receiptLine?.classList.add("on");
        typeHash(receipt, "4f2a91c3…77e09c1e");
      }, 450);
    };

    const resetBrief = () => {
      lines.forEach((line) => line.classList.remove("on"));
      gate?.classList.remove("resolved", "held");
      if (gateText) gateText.textContent = "awaiting your approval — nothing runs yet";
      if (nextText) {
        nextText.classList.add("b-locked");
        nextText.textContent = "unlocks after approval";
      }
      if (receipt) receipt.textContent = "";
    };

    const play = () => {
      resetBrief();
      const delays = [250, 750, 1150, 1600, 2100, 2650, 3150, 3500];
      lines.slice(0, 8).forEach((line, index) => later(() => line.classList.add("on"), delays[index] || 250));
      later(() => nextLine?.classList.add("on"), 4100);
      later(() => {
        if (!userActed) approve(false);
      }, 6600);
    };

    const approveButton = root.querySelector<HTMLButtonElement>("#btnApprove");
    const holdButton = root.querySelector<HTMLButtonElement>("#btnHold");
    const resumeButton = root.querySelector<HTMLButtonElement>("#btnResume");

    const onApprove = () => {
      userActed = true;
      revealThrough(9);
      approve(true);
    };
    const onHold = () => {
      userActed = true;
      revealThrough(8);
      gate?.classList.add("held");
      if (gateText) gateText.textContent = "held by you — nothing runs until you say so";
    };
    const onResume = () => {
      userActed = false;
      play();
    };

    approveButton?.addEventListener("click", onApprove);
    holdButton?.addEventListener("click", onHold);
    resumeButton?.addEventListener("click", onResume);

    const sourceCleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLElement>(".b-src").forEach((source) => {
      const original = source.textContent || "";
      const onSourceClick = () => {
        source.textContent = "⟡ source pinned · sample";
        later(() => {
          source.textContent = original;
        }, 1500);
      };
      source.addEventListener("click", onSourceClick);
      sourceCleanups.push(() => source.removeEventListener("click", onSourceClick));
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    root.querySelectorAll(".rv").forEach((el) => revealObserver.observe(el));

    const railLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>("#rail a"));
    const watched = Array.from(root.querySelectorAll<HTMLElement>("#hero, [data-rail-section]"));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const key = entry.target.id === "hero" ? "hero" : entry.target.getAttribute("data-rail-section");
        railLinks.forEach((link) => link.classList.toggle("active", link.dataset.rail === key));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    watched.forEach((section) => sectionObserver.observe(section));

    const routeStepElements = Array.from(root.querySelectorAll<HTMLElement>(".route-step"));
    const routeWrap = root.querySelector<HTMLElement>(".route-wrap");
    const routeFill = root.querySelector<HTMLElement>("#routeFill");
    const railFill = root.querySelector<HTMLElement>("#railFill");
    const footerHash = root.querySelector<HTMLElement>("#fHash");
    let footerTyped = false;

    const onScroll = () => {
      const doc = document.documentElement;
      const progress = doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight);
      if (railFill) railFill.style.transform = `scaleY(${Math.min(1, Math.max(0, progress))})`;

      if (routeWrap && routeFill) {
        const rect = routeWrap.getBoundingClientRect();
        const start = window.innerHeight * 0.75;
        const end = window.innerHeight * 0.35;
        const routeProgress = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, start - end)));
        routeFill.style.transform = `scaleX(${routeProgress})`;
        routeStepElements.forEach((step, index) => {
          step.classList.toggle("lit", routeProgress >= (index + 0.5) / routeStepElements.length);
        });
      }

      const footer = root.querySelector("footer");
      if (footer && !footerTyped && footer.getBoundingClientRect().top < window.innerHeight * 0.8) {
        footerTyped = true;
        typeHash(footerHash, "b7d3…02ce · rendered honest");
      }
    };

    if (reduced) {
      revealThrough(10);
      approve(false);
      root.querySelectorAll(".rv").forEach((el) => el.classList.add("revealed"));
      routeStepElements.forEach((step) => step.classList.add("lit"));
      if (routeFill) routeFill.style.transform = "scaleX(1)";
      if (railFill) railFill.style.transform = "scaleY(1)";
    } else {
      play();
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      approveButton?.removeEventListener("click", onApprove);
      holdButton?.removeEventListener("click", onHold);
      resumeButton?.removeEventListener("click", onResume);
      sourceCleanups.forEach((cleanup) => cleanup());
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      root.classList.remove("amr-js");
    };
  }, []);
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow rv">{children}</p>;
}

function BriefDemo() {
  return (
    <div className="brief" id="brief" aria-label="Sample reviewable workspace, animated demonstration">
      <div className="brief-head">
        <span className="brief-title"><span className="g">⟡</span> WORKSPACE — vendor-evidence-brief</span>
        <span className="brief-sample">sample · not live</span>
      </div>
      <div className="brief-body" id="briefBody">
        <div className="b-line" data-s="1"><span className="b-k">OBJECTIVE</span><span className="b-t"><strong>Pick a payments vendor</strong> for the India rollout</span></div>
        <div className="b-div" data-s="2" />
        <div className="b-line" data-s="3"><span className="chip chip-fact">FACT</span><span className="b-t">Vendor A clears UPI + cards domestically</span><button className="b-src" type="button">src: RBI register ▸</button></div>
        <div className="b-line" data-s="4"><span className="chip chip-fact">FACT</span><span className="b-t">Quote: ₹2.4L/yr at current volume</span><button className="b-src" type="button">src: vendor-quote.pdf ▸</button></div>
        <div className="b-line" data-s="5"><span className="chip chip-assumed">ASSUMED</span><span className="b-t">Volume grows ~30% by Q4 — owner estimate</span><span className="b-needs">needs: finance sign-off</span></div>
        <div className="b-line" data-s="6"><span className="chip chip-gap">GAP</span><span className="b-t">No security audit sighted for Vendor B</span><span className="b-ask">ask: request audit letter</span></div>
        <div className="b-div" data-s="7" />
        <div className="b-line b-line--block" data-s="8">
          <div className="gate" id="gate">
            <div className="gate-q"><span className="chip chip-gate">GATE</span> Send data-sharing request to Vendor A?</div>
            <div className="gate-row">
              <button className="gate-btn gate-approve" id="btnApprove" type="button">APPROVE</button>
              <button className="gate-btn gate-hold" id="btnHold" type="button">HOLD</button>
              <button className="gate-btn gate-resume" id="btnResume" type="button">RESUME ▸</button>
              <span className="gate-status" id="gateStatus" aria-live="polite"><span className="gate-dot"></span><span id="gateText">awaiting your approval — nothing runs yet</span></span>
            </div>
          </div>
        </div>
        <div className="b-line" data-s="9"><span className="b-k">NEXT</span><span className="b-t b-locked" id="nextText">unlocks after approval</span></div>
        <div className="b-line" data-s="10"><span className="b-receipt"><span className="g">⟡</span> receipt <span id="rcptHash"></span> · every step logged</span></div>
      </div>
    </div>
  );
}

export default function ActiveMirrorSite() {
  useHomepageMotion();

  return (
    <main className="amr" id="top">
      <SiteTelemetry surface="public_site" />

      <nav id="rail" aria-label="Page sections">
        <span className="track" aria-hidden="true"><span className="fill" id="railFill"></span></span>
        <a href="#hero" data-rail="hero"><span className="dot"></span><span className="lbl">⟡</span></a>
        <a href="#what-it-does" data-rail="results"><span className="dot"></span><span className="lbl">RESULTS</span></a>
        <a href="#fit" data-rail="fit"><span className="dot"></span><span className="lbl">FIT</span></a>
        <a href="#proof" data-rail="proof"><span className="dot"></span><span className="lbl">PROOF</span></a>
        <a href="#route" data-rail="route"><span className="dot"></span><span className="lbl">ROUTE</span></a>
        <a href="#where" data-rail="where"><span className="dot"></span><span className="lbl">WHERE</span></a>
        <a href="#work-with-us" data-rail="start"><span className="dot"></span><span className="lbl">START</span></a>
      </nav>

      <header className="amr-header">
        <div className="wrap nav">
          <a className="brand" href="#hero"><span className="glyph">⟡</span>Active Mirror</a>
          <div className="nav-links">
            <a href="#what-it-does">Results</a>
            <a href="#proof">Proof</a>
            <a href="#work-with-us">Start</a>
          </div>
          <div className="nav-cta">
            <span className="nav-note">review before action</span>
            <Link className="btn btn-ghost btn-sm" href="/mirror" data-analytics="nav_try_workspace">Try workspace <span className="arr">→</span></Link>
          </div>
        </div>
      </header>

      <section id="hero">
        <div className="glyph-bg" aria-hidden="true">⟡</div>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Trust by Design · N1 Intelligence</p>
            <h1 className="h-display">
              <span className="mask-line"><span className="mi">Show</span></span>
              <span className="mask-line"><span className="mi">the <em>work.</em></span></span>
            </h1>
            <p className="lede hero-sub">Bring one AI workflow. Leave with a reviewable workspace — sources, assumptions, gaps, and approvals kept visible, so your team can act on the result.</p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/intake?focus=pilot" data-analytics="hero_bring_workflow">Bring one workflow <span className="arr">→</span></Link>
              <Link className="btn btn-ghost" href="/mirror" data-analytics="hero_try_workspace">Try the public workspace</Link>
            </div>
            <p className="hero-fine">We scope it first. If it fits, <b>a working proof in 72 hours.</b> If not, a clear no.</p>
          </div>
          <BriefDemo />
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track" id="mtrack">
          <span>Shows what it used <i>⟡</i></span><span>Names what is missing <i>⟡</i></span><span>Asks before sensitive steps <i>⟡</i></span><span>Gives you the next move <i>⟡</i></span>
          <span>Shows what it used <i>⟡</i></span><span>Names what is missing <i>⟡</i></span><span>Asks before sensitive steps <i>⟡</i></span><span>Gives you the next move <i>⟡</i></span>
        </div>
      </div>

      <section id="walkthrough" className="video-band" data-rail-section="results">
        <div className="wrap video-grid">
          <div className="video-copy">
            <Eyebrow>32-second walkthrough</Eyebrow>
            <h2 className="h-section rv">See the request become a workspace.</h2>
            <p className="lede rv">A short product walkthrough of the public front door: the request, evidence trail, review gate, and next action stay visible instead of disappearing into a chat transcript.</p>
          </div>
          <div className="video-shell rv">
            <video
              className="proof-video"
              controls
              playsInline
              preload="metadata"
              poster="/og.png"
              aria-label="Active Mirror 32-second product walkthrough"
            >
              <source src="/media/show-the-work.mp4" type="video/mp4" />
              <a href="/media/show-the-work.mp4">Download the Active Mirror walkthrough video.</a>
            </video>
            <div className="video-meta">
              <span>self-hosted MP4</span>
              <span>no third-party embed</span>
              <span>31.9 sec</span>
            </div>
          </div>
        </div>
      </section>

      <section id="what-it-does" className="band" data-rail-section="results">
        <div className="wrap">
          <Eyebrow>What you leave with</Eyebrow>
          <h2 className="h-section rv">Get the thing, not a chat transcript.</h2>
          <div className="out-grid">
            {outcomes.map(([tag, title, body]) => (
              <div className="out-card rv" key={title}>
                <span className="chip chip-cat">{tag}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fit" className="band" data-rail-section="fit">
        <div className="wrap fit-grid">
          <div>
            <Eyebrow>The fit test</Eyebrow>
            <h2 className="h-section rv">Give us one workflow your current AI cannot safely finish.</h2>
            <p className="lede rv fit-lede">We do not promise every workflow is a fit. We qualify it first. If we cannot make it clearer, more usable, and safer to act on, we say that early instead of wasting your time.</p>
            <div className="rv fit-cta"><Link className="btn btn-primary" href="/intake?focus=pilot" data-analytics="fit_bring_workflow">Bring one workflow <span className="arr">→</span></Link></div>
          </div>
          <div className="fit-steps">
            {fitSteps.map(([number, title, sub]) => (
              <div className="fit-step rv" key={number}>
                <span className="n">{number}</span>
                <p>{title}</p>
                <p className="sub">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="band" data-rail-section="proof">
        <div className="wrap">
          <Eyebrow>What the sprint produces</Eyebrow>
          <h2 className="h-section rv">No pitch theatre. A useful proof or a clear no.</h2>
          <p className="lede rv section-lede">For accepted workflows, the 72-hour sprint ends with a working artifact your team can inspect.</p>
          <div className="ledger">
            {sprintLedger.map(([label, title, body]) => (
              <div className="ledger-card rv" key={label}>
                <span className="lk">{label}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="route" className="band" data-rail-section="route">
        <div className="wrap">
          <Eyebrow>Built for review</Eyebrow>
          <h2 className="h-section rv">It shows what happened, so your team can use the result.</h2>
          <p className="lede rv section-lede">You should not have to guess what the AI used, skipped, assumed, or still needs from you.</p>
          <div className="route-wrap">
            <div className="route-line"><div className="route-fill" id="routeFill"></div></div>
            <div className="route-steps" id="routeSteps">
              {routeSteps.map(([title, body]) => (
                <div className="route-step" key={title}>
                  <span className="nd"></span>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="route-links rv">
            <Link href="/proof-sprint" data-analytics="route_proof_sprint">See proof sprint sample</Link>
            <Link href="/trust" data-analytics="route_review_boundary">Review boundary</Link>
            <Link href="/glass" data-analytics="route_evidence_examples">Public evidence examples</Link>
            <Link href="/compare" data-analytics="route_compare">Compare</Link>
          </div>
        </div>
      </section>

      <section id="where" className="band" data-rail-section="where">
        <div className="wrap">
          <Eyebrow>Where it helps</Eyebrow>
          <h2 className="h-section rv">Use it for the work people already bring to AI.</h2>
          <div className="where-grid">
            {whereItHelps.map(([label, title, body]) => (
              <div className="where-cell rv" key={label}>
                <span className="wk">{label}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <Eyebrow>Why it feels different</Eyebrow>
          <h2 className="h-section rv">Not a smarter chat box. A way to make AI work usable.</h2>
          <p className="lede rv section-lede">The model can be powerful and still be wrong, blocked, or unsafe to act. Active Mirror makes that visible and turns the request into work anyway.</p>
          <div className="diff-rows">
            {differenceRows.map(([title, body]) => (
              <div className="diff-row rv" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <p className="pull rv" id="pull"><span className="g">⟡</span>The point is not to admire the AI. The point is to get the decision, plan, review, or workflow finished with less risk.</p>
        </div>
      </section>

      <section id="work-with-us" className="band" data-rail-section="start">
        <div className="wrap">
          <Eyebrow>Start</Eyebrow>
          <h2 className="h-section rv">Pick the result you want first.</h2>
          <p className="lede rv section-lede">Start with one real workflow. The first deliverable should be useful even before a full deployment.</p>
          <div className="start-grid">
            {startCards.map((card) => (
              <div className={card.featured ? "start-card featured rv" : "start-card rv"} key={card.title}>
                <span className="start-tag">{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <ul className="start-list">
                  {card.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <Link
                  className={card.featured ? "btn btn-primary" : "btn btn-ghost"}
                  href={card.href}
                  data-analytics={`start_${card.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`}
                >
                  {card.action} <span className="arr">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="f-ledger rv">
            <div className="f-fact"><span className="k">Result</span><span className="v">Usable AI work</span></div>
            <div className="f-fact"><span className="k">Deployment</span><span className="v">Local or cloud</span></div>
            <div className="f-fact"><span className="k">Standard</span><span className="v">Show the work</span></div>
            <div className="f-fact"><span className="k">Origin</span><span className="v">Made in India</span></div>
          </div>
          <div className="f-cols">
            <div className="f-brand">
              <a className="brand" href="#hero"><span className="glyph">⟡</span>Active Mirror</a>
              <p>AI workspaces for decisions, briefs, plans, and workflows that need review before action.</p>
            </div>
            <div className="f-col">
              <h4>Product</h4>
              <a href="#what-it-does">What it does</a>
              <Link href="/mirror">Workspace</Link>
              <Link href="/trust">Review boundary</Link>
              <Link href="/glass">Evidence examples</Link>
            </div>
            <div className="f-col">
              <h4>Engage</h4>
              <Link href="/proof-sprint">72-hour proof sprint</Link>
              <Link href="/intake?focus=pilot">Scoped pilot</Link>
              <Link href="/intake?focus=workspace-proof">Workspace proof</Link>
              <Link href="/intake">General intake</Link>
            </div>
            <div className="f-col">
              <h4>Evidence</h4>
              <Link href="/compare">Compare</Link>
              <a href="#proof">Evidence path</a>
              <Link href="/glass">Public examples</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
          <div className="f-base">
            <p>© 2026 N1 Intelligence (OPC) Pvt Ltd ⟡ Made in India. Built for owner-controlled AI work.<br />Active Mirror™ and Trust by Design™ are trademarks of N1 Intelligence (OPC) Pvt. Ltd.</p>
            <p className="f-receipt"><span className="g">⟡</span> page receipt <span id="fHash"></span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
