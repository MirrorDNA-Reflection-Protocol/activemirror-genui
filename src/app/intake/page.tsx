import IntakeForm from "@/components/active-mirror/IntakeForm";
import SiteTelemetry from "@/components/active-mirror/SiteTelemetry";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scope a Pilot",
  description: "Tell Active Mirror the business workflow, sensitivity, deployment preference, and timeline.",
  alternates: { canonical: "https://activemirror.ai/intake" },
};

export default function IntakePage() {
  return (
    <main className="proofpage">
      <SiteTelemetry surface="intake" />
      <nav className="proofnav">
        <Link className="proofbrand" href="/">
          <span>⟡</span>
          <b>Active Mirror</b>
        </Link>
        <div className="proofnav__links">
            <Link href="/trust">Review</Link>
            <Link href="/glass">Evidence</Link>
            <Link href="/compare">Compare</Link>
        </div>
        <Link className="proofnav__cta" href="/mirror">Open workspace</Link>
      </nav>
      <header className="proofhero proofhero--intake">
        <div className="proofhero__k">⟡ Scoped pilot</div>
        <h1>Tell us the workflow that needs better AI control.</h1>
        <p>
          We start with the business outcome, sensitivity, where it should run, and how quickly you need it.
          No private access is requested from this form.
        </p>
      </header>
      <section className="proofband">
        <IntakeForm />
      </section>
    </main>
  );
}
