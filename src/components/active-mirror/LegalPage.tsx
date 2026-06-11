import Image from "next/image";
import Link from "next/link";

type LegalSection = {
  title: string;
  body?: string[];
  items?: string[];
};

type LegalPageProps = {
  kicker: string;
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
};

export default function LegalPage({ kicker, title, lede, updated, sections }: LegalPageProps) {
  return (
    <main className="site legal-page" id="top">
      <nav className="nav">
        <div className="wrap">
          <Link className="brand" href="/" aria-label="Active Mirror">
            <Image className="mk" src="/am-mark-bone.png" alt="" width={24} height={24} priority />
            <b>Active Mirror</b>
          </Link>
          <div className="nav__links">
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#proof">Proof</Link>
            <Link href="/#start">Start</Link>
          </div>
          <div className="nav__r">
            <Link className="btn btn--primary" href="/mirror">Try the workspace <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <header className="legal-hero">
        <div className="wrap">
          <span className="eyebrow"><span className="tick">⟡</span>{kicker}</span>
          <h1>{title}</h1>
          <p>{lede}</p>
          <time dateTime="2026-06-11">Updated {updated}</time>
        </div>
      </header>

      <section className="legal-body">
        <div className="wrap legal-body__grid">
          <aside className="legal-card" aria-label="Company contact">
            <h2>N1 Intelligence (OPC) Pvt. Ltd.</h2>
            <p>Active Mirror is operated from India. Questions, rights requests, or contract notices can be sent to:</p>
            <a href="mailto:paul@activemirror.ai">paul@activemirror.ai</a>
          </aside>
          <div className="legal-copy">
            {sections.map((section) => (
              <section className="legal-section" key={section.title}>
                <h2>{section.title}</h2>
                {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.items ? (
                  <ul>
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </section>

      <footer className="foot legal-foot">
        <div className="wrap foot__legal">
          <div className="foot__bottom">
            <span className="cp">© 2026 N1 Intelligence (OPC) Pvt Ltd</span>
            <span className="sov"><span className="gl">⟡</span> Made in India. Built for owner-controlled AI work.</span>
          </div>
          <p className="foot__tm">
            <Link href="/privacy">Privacy</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/terms">Terms</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
