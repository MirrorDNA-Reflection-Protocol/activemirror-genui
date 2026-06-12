import IntakeForm from "@/components/active-mirror/IntakeForm";
import SiteTelemetry from "@/components/active-mirror/SiteTelemetry";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scope a Pilot",
  description: "Tell Active Mirror the business work, sensitivity, deployment preference, and local/cloud review boundary.",
  alternates: { canonical: "https://activemirror.ai/intake" },
};

type IntakePageProps = {
  searchParams: Promise<{ focus?: string | string[] | undefined }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IntakePage({ searchParams }: IntakePageProps) {
  const params = await searchParams;
  const focus = firstParam(params.focus) || "general";
  const fromWorkspace = focus === "workspace-proof";
  const fromArchitecture = focus === "architecture";
  const hero = fromWorkspace
    ? {
        eyebrow: "⟡ Workspace proof sprint",
        title: "Turn this workspace into something your team can inspect.",
        body: "Send the workflow, owner, proof target, and deployment boundary. The generated prompt and artifact are not forwarded unless you choose to paste them.",
      }
    : fromArchitecture
      ? {
          eyebrow: "⟡ Hybrid AI architecture",
          title: "Map the right local, cloud, and human-review boundary.",
          body: "Send the work, sensitivity, current failure mode, and where it may run. The first output is a control map before any private access is requested.",
        }
      : {
          eyebrow: "⟡ Scoped pilot",
          title: "Tell us the workflow that needs better AI control.",
          body: "We start with the business outcome, sensitivity, where it should run, and how quickly you need it. No private access is requested from this form.",
        };

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
        <div className="proofhero__k">{hero.eyebrow}</div>
        <h1>{hero.title}</h1>
        <p>{hero.body}</p>
      </header>
      <section className="proofband">
        <IntakeForm initialFocus={focus} />
      </section>
    </main>
  );
}
