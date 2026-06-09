import Image from "next/image";
import Link from "next/link";

const MIRRORSEED_URL = "https://id.activemirror.ai/docs/identity.html#generator";

const thesis = [
  {
    number: "01 / REFLECT",
    title: "It mirrors before it answers.",
    body: "Goal, constraints, tools, and missing inputs — reflected back before anything is generated.",
  },
  {
    number: "02 / GENERATE",
    title: "A workspace, not a response.",
    body: "Every prompt becomes a useful surface: brief, board, approval queue, document pack, route.",
  },
  {
    number: "03 / GOVERN",
    title: "Proof stays attached.",
    body: "Facts, assumptions, gaps, approvals, and hash-chained receipts — visible, gated, revocable.",
  },
];

const convergence = [
  {
    key: "EXECUTE",
    title: "A runtime body",
    body: "Browser, files, vault, devices — a real body that runs the work, and says so when it's offline.",
    tag: "browser · files · vault · device limbs",
  },
  {
    key: "GENERATE",
    title: "Surfaces on demand",
    body: "Every prompt becomes a useful surface — brief, board, app, document pack — not a wall of text.",
    tag: "MirrorSurface · diff-backed · replayable",
  },
  {
    key: "REMEMBER",
    title: "MirrorSeed + reflective memory",
    body: "A portable identity seed gives the system the user's durable context. MirrorGraph decides what can enter the task.",
    tag: "MirrorSeed · MirrorGraph · consent scope",
  },
];

const engagements = [
  {
    tag: "Most engaged",
    title: "Design Partner",
    body: "We deploy Active MirrorOS into your product or operation, hands-on, over a focused build cycle.",
    items: [
      "Memory vault + consent layer, on your machines",
      "Agent governance & audit trail wired to your stack",
      "Weekly shipping, local-first, you own the deployment",
    ],
    price: "Engagement",
    action: "Talk to us",
    featured: true,
  },
  {
    tag: "Advisory",
    title: "Working Sessions",
    body: "Architecture and governance counsel for teams building agents that need real memory and boundaries.",
    items: [
      "Provenance & consent architecture review",
      "Model-interchange & continuity strategy",
      "Audit, gates, and human-in-the-loop design",
    ],
    price: "Retainer",
    action: "Talk to us",
  },
  {
    tag: "Protocol",
    title: "MirrorGate License",
    body: "Adopt the governance substrate — the bus, gates, and presence protocol — as a standard in your systems.",
    items: [
      "System Bus + MirrorGate enforcement spec",
      "Presence & consent schema, reference build",
      "Implementation support from us",
    ],
    price: "License",
    action: "Talk to us",
  },
];

const axioms = [
  {
    number: "AXIOM 01",
    title: "Identity is proven, not declared",
    body: "Continuity is measured, audited, and adversarially challenged across model swaps and time.",
    law: "\"Feels the same\" is not a metric.",
  },
  {
    number: "AXIOM 02",
    title: "Governance must be oppositional",
    body: "At least one subsystem is built to say no — and can make it stick, temporarily, against consensus.",
    law: "Harmony is a failure mode.",
  },
  {
    number: "AXIOM 03",
    title: "Safety comes from friction",
    body: "You can't predict every failure. You can make failures slow, noisy, and costly before they're irreversible.",
    law: "Make misalignment impossible, not unlikely.",
  },
  {
    number: "AXIOM 04",
    title: "Consent over silent context",
    body: "If valid presence exists, no inference is allowed. The user's state is authoritative and external to the model.",
    law: "Deletion equals disappearance.",
  },
  {
    number: "AXIOM 05",
    title: "There must be one sacred thing",
    body: "At least one invariant the system will degrade itself to protect — your continuity. It narrows scope, slows down, or stops before it breaks it.",
    law: "The system fails before the promise does.",
    capstone: true,
  },
];

const teaserItems = [
  "Source route prepared before execution.",
  "Facts, assumptions, and gaps stay separated.",
  "Export is held until approval writes a receipt.",
];

function BrandLink() {
  return (
    <Link className="brand" href="#top" aria-label="Active Mirror">
      <Image className="mk" src="/am-mark-bone.png" alt="" width={24} height={24} priority />
      <b>Active Mirror</b>
      <span className="os">OS</span>
      <span className="tm">™</span>
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

function StaticMirrorTeaser() {
  return (
    <div className="console" data-testid="site-teaser-console">
      <div className="console__bar">
        <div className="dots"><i></i><i></i><i></i></div>
        <div className="ttl"><span className="gl">⟡</span> mirror://<b>preview</b> · read-only</div>
        <div className="st">
          <span className="pill"><span className="dot"></span>preview</span>
          <span className="pill">no model call</span>
        </div>
      </div>
      <div className="body-bar">
        <span className="body-bar__lbl">BODY</span>
        <span className="limb limb--on"><span className="d"></span>browser</span>
        <span className="limb limb--on"><span className="d"></span>files</span>
        <span className="limb limb--gated"><span className="d"></span>sends · gated</span>
        <span className="limb limb--off"><span className="d"></span>devices · body_unavailable</span>
      </div>
      <div className="thread">
        <div className="msg msg--you">
          <div className="msg__av">you</div>
          <div className="msg__body">
            <div className="bubble">Build me a workspace to prove a vendor decision without leaking private files.</div>
          </div>
        </div>
        <div className="msg msg--mirror">
          <div className="msg__av">⟡</div>
          <div className="msg__body">
            <div className="bubble">
              This needs an evidence brief, not a generic answer. I will keep proof, gaps, and the approval boundary visible.
            </div>
            <div className="artifact">
              <div className="artifact__bar">
                <span className="artifact__type artifact__type--surface">Brief</span>
                <span className="artifact__title">Vendor evidence workspace</span>
                <div className="artifact__act" aria-hidden="true"><button type="button" tabIndex={-1}>↗</button></div>
              </div>
              <div className="artifact__body">
                <div className="surf">
                  <div className="surf__head">
                    <div className="surf__t">Evidence brief preview</div>
                    <div className="surf__sub">Prepared route · source queue · proof line · gated export</div>
                  </div>
                  <div className="surf__pack">
                    {teaserItems.map((item) => <span className="pk" key={item}>{item}</span>)}
                  </div>
                  <div className="surf__proof">
                    <div className="pcol pcol--fact">
                      <div className="pcol__h">FACTS</div>
                      <div className="pcol__i">Request type identified.</div>
                    </div>
                    <div className="pcol pcol--assume">
                      <div className="pcol__h">ASSUMED</div>
                      <div className="pcol__i">Decision owner exists.</div>
                    </div>
                    <div className="pcol pcol--gap">
                      <div className="pcol__h">GAPS</div>
                      <div className="pcol__i">Private files require approval.</div>
                    </div>
                  </div>
                  <div className="surf__action">
                    <div className="surf__act-l"><span className="gate-ic">⟡</span><b>held</b> for approval</div>
                    <div className="surf__act-r"><span className="gate-pill">receiptRequired</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="composer">
        <div className="composer__hint">
          <span className="gl">⟡</span>
          A real request, governed end-to-end. This is a static preview.
        </div>
        <Link href="/mirror" className="btn btn--primary btn--lg site-open-link">
          See it run <span className="arr">→</span>
        </Link>
      </div>
    </div>
  );
}

export default function ActiveMirrorSite() {
  return (
    <main className="site" id="top">
      <nav className="nav">
        <div className="wrap">
          <BrandLink />
          <div className="nav__links">
            <a href="#reflect">Reflect</a>
            <a href={MIRRORSEED_URL}>MirrorSeed</a>
            <a href="#engagements">Work with us</a>
            <a href="#system">The system</a>
            <a href="#axioms">Principles</a>
          </div>
          <div className="nav__r">
            <span className="nav__status"><span className="dot"></span>TRUST BY DESIGN™</span>
            <Link className="btn btn--primary" href="/mirror">Open workspace <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <header className="hero" style={{ paddingBottom: 0 }}>
        <div className="hero__grid"></div>
        <div className="wrap">
          <div className="gen" id="reflect">
            <div className="gen__halo"></div>
            <div className="gen__lead">
              <Eyebrow>TRUST BY DESIGN™ · SOVEREIGN AI RUNTIME <span className="ln"></span></Eyebrow>
              <h1>Not another model. <span className="sig">The trust layer around models.</span></h1>
              <p>
                Active Mirror is a Made-in-India sovereign runtime that lets frontier and local models work for you —
                under provenance, consent, continuity, and proof. Models propose; the gate governs.
              </p>
            </div>

            <div className="ribbon" aria-label="Live runtime lanes">
              <div className="ribbon__l"><span className="rk">route</span><span className="rv">sarvam · sovereign</span></div>
              <div className="ribbon__l"><span className="rk">gate</span><span className="rv rb-gold">request_approval</span></div>
              <div className="ribbon__l"><span className="rk">provenance</span><span className="rv rb-warn">3 facts · 1 gap</span></div>
              <div className="ribbon__l"><span className="rk">receipt</span><span className="rv rb-ok">r_8f31ac</span></div>
              <div className="ribbon__l"><span className="rk">memory</span><span className="rv rb-ok">private · revocable</span></div>
              <div className="ribbon__l"><span className="rk">body</span><span className="rv rb-warn">send: body_unavailable</span></div>
              <div className="ribbon__l"><span className="rk">next</span><span className="rv rb-gold">held for approval</span></div>
            </div>

            <StaticMirrorTeaser />
          </div>
        </div>
      </header>

      <section className="thesis">
        <div className="wrap">
          {thesis.map((item) => (
            <div className="col" key={item.number}>
              <div className="n">{item.number}</div>
              <div className="t">{item.title}</div>
              <p className="d">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>WHAT IT IS</Eyebrow>
            <h2>Three powers most teams glue together — <span className="accent">unified, and governed.</span></h2>
            <p className="band__sub">
              A coding agent runs the work. A canvas generates the surfaces. A memory layer remembers you.
              Today those are three separate, ungoverned tools. Active Mirror is one system where all three answer to the same gate.
            </p>
          </div>
          <div className="converge">
            {convergence.map((item) => (
              <div className="cv" key={item.key}>
                <div className="cv__k">{item.key}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="cv__tag">{item.tag}</div>
              </div>
            ))}
            <div className="seed-bridge">
              <div className="seed-bridge__mark">⟡</div>
              <div>
                <div className="seed-bridge__k">MirrorSeed</div>
                <h3>Portable identity before memory.</h3>
                <p>
                  MirrorSeed is the user-owned identity file: preferences, context, boundaries, and working style.
                  Active Mirror can use it as the starting contract before any model remembers or acts.
                </p>
              </div>
              <a className="seed-bridge__go" href={MIRRORSEED_URL}>Create your MirrorSeed →</a>
            </div>
            <div className="converge__gov">
              <span className="converge__gl">⟡</span>
              <span className="converge__t">
                <b>One governance layer</b> over all three — MirrorGate, Proof Receipts, consent, audit.
                Nothing executes, generates, or remembers without a gate, a source, and a receipt.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="engagements" className="band">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>WORK WITH US</Eyebrow>
            <h2>We build the <span className="accent">trust layer</span> with you — then hand you the keys.</h2>
            <p className="band__sub">
              Active Mirror partners with a select group of organizations to deploy memory, consent, and governance into their AI stack —
              on their own infrastructure. The protocol is forged in the work.
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
                  <span className="eng__price"><b>{item.price}</b> · {item.featured ? "per cycle" : item.title === "Working Sessions" ? "monthly" : "+ build"}</span>
                  <a className="eng__go" href="#contact">{item.action} →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="system" className="band">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>PROOF, NOT PROMISES</Eyebrow>
            <h2>The Glass Box: every decision, on the record.</h2>
            <p className="band__sub">
              We instrument the AI itself — gates that pass, warn, or block; behavioral drift; model monitor; memory map.
              Transparency isn&apos;t a setting. It&apos;s the architecture.
            </p>
          </div>
          <div className="proof__frame">
            <div className="proof__bar">
              <div className="dots"><i></i><i></i><i></i></div>
              <span className="u">mirrordash.activemirror.ai<b> /dash/glass</b></span>
              <span className="live"><span className="dot"></span>SNAPSHOT</span>
            </div>
            <div className="gbmini">
              <div className="p">
                <div className="pt">GATE ACTIVITY · SAMPLE</div>
                <div className="row"><span className="l">anti_rationalization</span><span className="v-pass">pass</span></div>
                <div className="row"><span className="l">logic_anchor</span><span className="v-pass">allow</span></div>
                <div className="row"><span className="l">fact_check</span><span className="v-deny">deny</span></div>
                <div className="row"><span className="l">deploy_gate</span><span className="v-warn">warn</span></div>
              </div>
              <div className="p">
                <div className="pt">BEHAVIORAL METRICS</div>
                <div className="row"><span className="l">Integrity</span><span className="v-num">54/100</span></div>
                <div className="row"><span className="l">Drift</span><span className="v-drift">0.259</span></div>
                <div className="row"><span className="l">Verification</span><span className="v-pass">0.57</span></div>
              </div>
              <div className="p">
                <div className="pt">MEMORY MAP</div>
                <div className="row"><span className="l">CONTINUITY.md</span><span className="v-pass">41s</span></div>
                <div className="row"><span className="l">FACTS.md</span><span className="v-num">1d</span></div>
                <div className="row"><span className="l">MISTAKES.md</span><span className="v-drift">18h</span></div>
              </div>
            </div>
          </div>
          <div className="proof__caption">
            <a className="btn btn--ghost" href="#system">See how it works <span className="arr">→</span></a>
            <span className="txt">A sample surface from our stack — MIRRORDASH, the AI-transparency cockpit.</span>
          </div>
        </div>
      </section>

      <section id="axioms" className="band">
        <div className="wrap">
          <div className="band__head">
            <Eyebrow>THE BEDROCK</Eyebrow>
            <h2>Five laws we don&apos;t break.</h2>
            <p className="band__sub">Not features — laws. Violate them and the system becomes theater again.</p>
          </div>
          <div className="axioms">
            {axioms.map((item) => (
              <div className="axiom" style={item.capstone ? { gridColumn: "1 / -1" } : undefined} key={item.number}>
                <div className="ax-n">{item.number}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span className="law">{item.law}</span>
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
                <div className="r"><span className="k">focus</span><span className="vv">Sovereign AI governance</span></div>
                <div className="r"><span className="k">deployment</span><span className="vv">Local-first · your infrastructure</span></div>
                <div className="r"><span className="k">standard</span><span className="vv">Trust by Design™</span></div>
                <div className="r"><span className="k">origin</span><span className="vv">Made in India</span></div>
              </div>
            </div>
            <div className="founder__body">
              <Eyebrow>WHY WE EXIST</Eyebrow>
              <p className="lead">Frontier models produce text. Active Mirror compiles intent into governed workspaces — and shows its work.</p>
              <p>
                Most AI forgets who you are, acts without asking, and asserts answers with no source.
                Active Mirror is the trust layer around the model: a sovereign vault, consent-gated memory,
                and a governance layer that keeps AI aligned to what you actually want — with continuity across every model and session.
              </p>
              <p>
                We partner with organizations that need AI to remember correctly, act within boundaries,
                and stay accountable over time — deployed into their stack, owned by them.
              </p>
              <p className="sig-line">— The model is replaceable. Governance is not.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="cta">
        <div className="cta__halo"></div>
        <div className="wrap">
          <Eyebrow>WORK WITH US</Eyebrow>
          <h2>Give your AI a memory you can govern.</h2>
          <p>If you&apos;re deploying AI that needs to remember correctly, stay within boundaries, and prove every action — let&apos;s build the trust layer together.</p>
          <div className="cta__cta">
            <a className="btn btn--primary btn--lg" href="mailto:hello@activemirror.ai">Talk to us <span className="arr">→</span></a>
            <a className="btn btn--ghost btn--lg" href={MIRRORSEED_URL}>Create your MirrorSeed</a>
            <Link className="btn btn--ghost btn--lg" href="/mirror">Open the workspace</Link>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <div className="foot__brand">
            <BrandLink />
            <p>The operating layer for reflective intelligence. Memory, consent, governance — sovereign and local-first.</p>
          </div>
          <div className="foot__col">
            <h5>Product</h5>
            <a href="#reflect">Reflect</a>
            <a href={MIRRORSEED_URL}>MirrorSeed</a>
            <a href="#system">Glass Box</a>
            <a href="#system">MirrorOS Console</a>
            <a href="#system">The system</a>
          </div>
          <div className="foot__col">
            <h5>Engage</h5>
            <a href="#engagements">Design Partner</a>
            <a href="#engagements">Advisory</a>
            <a href="#engagements">MirrorGate License</a>
          </div>
          <div className="foot__col">
            <h5>Principles</h5>
            <a href="#axioms">The bedrock</a>
            <a href="#system">The system</a>
            <a href="#axioms">Differentiation</a>
          </div>
        </div>
        <div className="wrap foot__legal">
          <div className="foot__bottom">
            <span className="cp">© 2026 N1 Intelligence (OPC) Pvt Ltd</span>
            <span className="sov"><span className="gl">⟡</span> Identity is local. Intelligence is rented. Continuity is sovereign.</span>
          </div>
          <p className="foot__tm">
            Active Mirror™, Active MirrorOS™, MirrorDNA™, and Trust by Design™ are trademarks of N1 Intelligence (OPC) Pvt. Ltd.
            Whisper Protocol and Mirror OS Protocol are claimed works. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
