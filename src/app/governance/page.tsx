import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Governance Route",
  description:
    "A buyer-facing view of the route, source, consent, approval, and receipt controls behind Active Mirror and AIndia results.",
  alternates: { canonical: "https://activemirror.ai/governance" },
};

const routeSteps = [
  ["Request", "Capture the user question, language, file state, and declared intent before the model proposes."],
  ["Route", "Choose device, browser, local model, approved connector, or consented cloud fallback as an explicit path."],
  ["Result", "Return the answer with visible source, risk, approval, and receipt state instead of a bare response."],
  ["Review", "Keep open gaps and next actions visible so the buyer can decide what is ready and what is not."],
];

const controlRows = [
  ["Route", "Which rail handled the work: device, browser, local model, approved connector, or cloud fallback.", "visible before trust"],
  ["Source", "Which record, page, file, sensor, or user-provided input supports the claim.", "no source, no fact"],
  ["Consent", "Which action, context use, relay, or fallback required user approval.", "ask before access"],
  ["Approvals", "Which human or policy gate must pass before sending, storing, or acting.", "blocked until approved"],
  ["Receipts", "What was claimed, what was assumed, what was skipped, and what changed later.", "exportable record"],
];

const buyerCards = [
  {
    k: "For AIndia",
    v: "consumer-simple front door",
    body:
      "The user can ask by voice, photo, or message. The governance layer still records the route, source, consent, risk, and next step.",
  },
  {
    k: "For Active Mirror",
    v: "reviewable workspace",
    body:
      "A business workflow becomes a workspace with evidence, assumptions, approval gates, and exportable proof attached.",
  },
  {
    k: "For buyers",
    v: "audit the path",
    body:
      "The claim is not that AI is always right. The claim is that the route and controls are inspectable before adoption.",
  },
];

const references = [
  {
    name: "India Digital Personal Data Protection Act, 2023",
    href: "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf",
    use: "Consent, notice, data minimization, and purpose-bound personal data handling.",
  },
  {
    name: "Digital Personal Data Protection Rules, 2025",
    href: "https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025",
    use: "Operational reference for India personal-data obligations as they are phased into force.",
  },
  {
    name: "NIST AI Risk Management Framework 1.0",
    href: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10",
    use: "Map, measure, manage, and govern language for AI risk controls.",
  },
  {
    name: "Model Context Protocol specification",
    href: "https://modelcontextprotocol.io/specification/2025-06-18",
    use: "Tool and context connection pattern for explicit external-system access.",
  },
  {
    name: "C2PA technical specification",
    href: "https://spec.c2pa.org/specifications/specifications/2.4/index.html",
    use: "Content provenance pattern for media-origin and edit-history evidence.",
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
        <Link href="/aindia">AIndia</Link>
        <Link href="/trust">Review</Link>
        <Link href="/glass">Evidence</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/intake">Talk to us</Link>
      </div>
      <Link className="proofnav__cta" href="/intake?focus=governance">
        Review a route
      </Link>
    </nav>
  );
}

export default function GovernancePage() {
  return (
    <main className="proofpage">
      <PublicNav />

      <header className="proofhero">
        <div className="proofhero__k">Governance proof route</div>
        <h1>AI result is not enough. Show the route.</h1>
        <p>
          Active Mirror and AIndia should make the path inspectable: what ran, what source supported it,
          what consent was needed, who approved it, and what receipt proves the work later.
        </p>
        <div className="proofhero__actions">
          <Link className="btn btn--primary btn--lg" href="/aindia">
            Open AIndia
          </Link>
          <Link className="btn btn--ghost btn--lg" href="/api/aindia/contracts">
            Inspect contracts
          </Link>
        </div>
      </header>

      <section className="proofband">
        <div className="proofband__head">
          <h2>The route is the product control.</h2>
          <p>
            A useful answer can still be unsafe if the buyer cannot see how it was produced. The route
            names the rail, data boundary, fallback, and review state before anyone treats the result as work.
          </p>
        </div>
        <div className="comparetable">
          {routeSteps.map(([lane, meaning]) => (
            <div className="comparetable__row" key={lane}>
              <span>{lane}</span>
              <b>{meaning}</b>
              <i>show the route</i>
            </div>
          ))}
        </div>
      </section>

      <section className="proofband">
        <div className="proofband__head">
          <h2>Five things a buyer should inspect.</h2>
          <p>
            This is the minimum buyer-facing structure for a governed AI result. It is evidence posture,
            not a claim of legal certification or formal framework certification.
          </p>
        </div>
        <div className="boundary">
          {controlRows.map(([lane, meaning, state]) => (
            <div className="boundary__row" key={lane}>
              <span>{lane}</span>
              <b>{meaning}</b>
              <i>{state}</i>
            </div>
          ))}
        </div>
      </section>

      <section className="proofband proofband--split">
        {buyerCards.map((card) => (
          <div className="proofcard" key={card.k}>
            <div className="proofcard__k">{card.k}</div>
            <div className="proofcard__v">{card.v}</div>
            <p>{card.body}</p>
          </div>
        ))}
      </section>

      <section className="proofband">
        <div className="proofband__head">
          <h2>References used as design constraints.</h2>
          <p>
            These are plain public references for control language. They do not mean Active Mirror or AIndia
            is certified by any standards body, regulator, or protocol maintainer.
          </p>
        </div>
        {references.map((reference) => (
          <div className="glassline" key={reference.name}>
            <span>
              <a href={reference.href}>{reference.name}</a>
            </span>
            <b>{reference.use}</b>
            <a href={reference.href}>Open source</a>
          </div>
        ))}
      </section>
    </main>
  );
}
