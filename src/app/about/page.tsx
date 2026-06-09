import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Active Mirror is a governed reflective work OS: generated surfaces, visible proof, scoped approvals, revocation, continuity, and user-owned receipts.",
  alternates: {
    canonical: "https://activemirror.ai/about",
  },
};

const laws = [
  "The user owns the goal.",
  "The mirror reflects before it generates.",
  "Generated surfaces beat generic answers.",
  "Proof is visible by default.",
  "Capability is not permission.",
  "Memory is opt-in, scoped, and revocable.",
];

const contractPanels = [
  {
    label: "Receipt-chain export",
    route: "/api/mirror/proof-ledger",
    body: "User-owned public-safe proof ledger with chain head, entries, exports, and queued private events.",
    icon: FileText,
  },
  {
    label: "Revocation cascade",
    route: "/api/mirror/revocation-cascade",
    body: "Shows what changes downstream when memory, source permissions, exports, or body receipts are revoked.",
    icon: RotateCcw,
  },
  {
    label: "Decision critique stream",
    route: "/api/mirror/critique",
    body: "The system admits blocked, gated, missing, and queued states with a recovery path.",
    icon: ShieldCheck,
  },
  {
    label: "Continuity score",
    route: "/api/mirror/identity-continuity/measure",
    body: "Deterministic public-safe vector diff for model-swap continuity; private identity scores require a signed receipt.",
    icon: Workflow,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-[#f4f6f1] text-[#171a18]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9ddd2] pb-4">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Active Mirror work OS">
            <Image src="/logo.png" alt="Active Mirror" width={36} height={36} className="h-9 w-9 object-contain" priority />
            <div>
              <div className="text-base font-semibold tracking-normal">Active Mirror</div>
              <div className="text-xs leading-5 text-[#667064]">Reference page</div>
            </div>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#171a18] px-4 text-sm font-semibold text-white transition-colors hover:bg-cyan-800"
          >
            Open work OS
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:py-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-700/15 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Reference, not the front door
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-[#151815] sm:text-5xl">
              Active Mirror is a governed reflective work OS.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5f685d] sm:text-lg">
              The canonical front page is the working surface. This page exists for doctrine, contracts,
              and positioning after the visitor has a reason to inspect the system.
            </p>
            <div className="mt-6 rounded-xl border border-[#d9ddd2] bg-white p-4 shadow-sm shadow-black/[0.04]">
              <div className="text-xs font-semibold uppercase text-[#7a8276]">Product spine</div>
              <p className="mt-2 font-mono text-sm leading-7 text-[#2f352f]">
                messy prompt -&gt; reflection -&gt; generated workspace -&gt; proof line -&gt; export -&gt; next action
              </p>
            </div>
          </div>

          <aside className="rounded-xl border border-[#d9ddd2] bg-[#111715] p-4 text-white shadow-sm shadow-black/[0.08]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <LockKeyhole className="h-4 w-4 text-cyan-200" />
              Trust boundary
            </div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Public routes show proof, gates, and claim boundaries. Private files, vault memory,
              accounts, devices, sends, spend, and durable writes require scoped approval and receipts.
            </p>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-cyan-100">
              body_unavailable is an honest state, not a broken promise.
            </div>
          </aside>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-[#d9ddd2] bg-white p-4 shadow-sm shadow-black/[0.04]">
            <h2 className="text-sm font-semibold tracking-normal">Doctrine</h2>
            <div className="mt-3 grid gap-2">
              {laws.map((law) => (
                <div key={law} className="flex gap-2 rounded-lg bg-[#f8f9f5] px-3 py-2 text-sm text-[#2f352f]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-800" />
                  <span>{law}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#d9ddd2] bg-white p-4 shadow-sm shadow-black/[0.04]">
            <h2 className="text-sm font-semibold tracking-normal">Runtime contracts</h2>
            <div className="mt-3 grid gap-2">
              {contractPanels.map((panel) => {
                const Icon = panel.icon;
                return (
                  <div key={panel.label} className="rounded-lg border border-[#d9ddd2] bg-[#f8f9f5] p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-cyan-800 shadow-sm shadow-black/[0.04]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#171a18]">{panel.label}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-cyan-900">{panel.route}</div>
                        <p className="mt-1 text-xs leading-5 text-[#667064]">{panel.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
