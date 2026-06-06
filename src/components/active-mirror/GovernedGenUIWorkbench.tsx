"use client";

import type { ReactNode, RefObject } from "react";
import {
  ArrowUp,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  GitBranch,
  Globe,
  Layers3,
  LockKeyhole,
  Mic,
  MicOff,
  MonitorCog,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import {
  ACTIVE_MIRROR_BOOT_SEQUENCE,
  ACTIVE_MIRROR_CANONICAL_DOCTRINE_SKILL,
  ACTIVE_MIRROR_STORAGE_ROWS,
} from "@/lib/mirror/contracts/activeMirrorBootloader";

type GovernedGenUIWorkbenchProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (prompt: string) => void;
  onToggleListening: () => void;
  isListening: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  disableSubmit: boolean;
  mirrorSeedId?: string;
  qaSlot?: ReactNode;
  onInstall: () => void;
  installLabel: string;
};

const DEFAULT_GOVERNED_PROMPT =
  "Mirror my intent and generate the Active Mirror workspace I need on demand. Use the canonical doctrine skill, bootloader contract, provenance, storage split, approvals, files, and receipts.";

const STARTERS = [
  {
    label: "Governed",
    icon: ShieldCheck,
    prompt: DEFAULT_GOVERNED_PROMPT,
  },
  {
    label: "Mirror",
    icon: Sparkles,
    prompt:
      "Mirror my goal, constraints, urgency, and preferred working style. Then generate the useful surface, proof boundary, file tray, and smallest next action.",
  },
  {
    label: "Sources",
    icon: Search,
    prompt:
      "Open a provenance workspace for Active Mirror. Show source registry, canonical contract status, facts, estimates, unknowns, and receipt boundaries.",
  },
  {
    label: "Build",
    icon: Workflow,
    prompt:
      "Generate a governed product build workspace with doctrine gates, files, approvals, browser cache, KV cache, and a downloadable implementation pack.",
  },
  {
    label: "Research",
    icon: Globe,
    prompt:
      "Research generated UI and browser OS tools. Open source targets, mark assumptions, and export a concise evidence brief.",
  },
  {
    label: "Files",
    icon: FileText,
    prompt:
      "Create an artifact pack for Active Mirror with canonical doctrine contract, provenance map, approval queue, export files, and receipt schema.",
  },
  {
    label: "Computer",
    icon: MonitorCog,
    prompt:
      "Show the computer-use route for Active Mirror: browser control, local helper, file access, approval gate, revocation path, and receipts.",
  },
];

const sourceRows = [
  {
    name: "MirrorDNA Standard",
    state: "canonical",
    href: "https://github.com/MirrorDNA-Reflection-Protocol/MirrorDNA-Standard",
  },
  {
    name: "Active Mirror Bootloader",
    state: "private/safe",
    href: "https://github.com/MirrorDNA-Reflection-Protocol",
  },
  {
    name: "Doctrine Skill",
    state: "built-in",
    href: "https://github.com/MirrorDNA-Reflection-Protocol",
  },
  {
    name: "AI Behavioral Governance",
    state: "doctrine",
    href: "https://github.com/MirrorDNA-Reflection-Protocol/ai-behavioral-governance",
  },
  {
    name: "SCD Protocol",
    state: "compression",
    href: "https://github.com/MirrorDNA-Reflection-Protocol/SCD-Protocol",
  },
];

const doctrineRows = [
  ["Mirror", "Reflect the user, then generate the useful surface"],
  ["Purpose", "Identity before memory, memory before inference"],
  ["Authority", "Human approval before external action"],
  ["Evidence", "Facts, estimates, and unknowns stay separate"],
  ["Boundary", "Reflection is not obedience; preview is not execution"],
];

const runtimeRows = [
  ["Boot skill", "Canonical doctrine stays loaded and versioned"],
  ["Browser cache", "Instant replay for recent surfaces"],
  ["Hetzner", "Always-on public surface and safe receipts"],
  ["Private body", "Fresh private actions can become body_unavailable"],
  ["Computer use", "Approval-gated and receipt-backed"],
];

const visibleStorageRows = ACTIVE_MIRROR_STORAGE_ROWS.filter((row) =>
  ["Private lattice", "Bootloader contract", "Browser cache", "KV cache", "Vault", "Offline fallback"].includes(row.store)
);

export default function GovernedGenUIWorkbench({
  value,
  onValueChange,
  onSubmit,
  onToggleListening,
  isListening,
  inputRef,
  disableSubmit,
  mirrorSeedId,
  qaSlot,
  onInstall,
  installLabel,
}: GovernedGenUIWorkbenchProps) {
  const submitValue = () => onSubmit(value || DEFAULT_GOVERNED_PROMPT);

  return (
    <section className="relative min-h-full w-full bg-[#090d12] text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="mx-auto flex min-h-dvh w-full max-w-[1480px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="Active Mirror" width={36} height={36} className="h-9 w-9 object-contain" priority />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-normal text-white sm:text-xl">Active Mirror</h1>
              <p className="text-xs leading-5 text-slate-400">Governed GenUI workbench</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-medium text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Provenance on
            </span>
            <button
              type="button"
              onClick={onInstall}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 font-medium text-slate-300 transition-colors hover:border-white/20 hover:bg-white/5"
            >
              <Database className="h-3.5 w-3.5" />
              {installLabel}
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-4 py-4 lg:grid-cols-[360px_minmax(0,1fr)_360px]">
          <aside className="flex min-h-0 flex-col gap-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-500">Command</div>
                  <div className="text-sm font-semibold text-white">Ask for the surface</div>
                </div>
                <Sparkles className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="rounded-lg border border-white/10 bg-black/35 p-2">
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={onToggleListening}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors ${
                      isListening ? "bg-red-500 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <textarea
                    ref={inputRef}
                    value={value}
                    onChange={(event) => onValueChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submitValue();
                      }
                    }}
                    placeholder={isListening ? "Listening..." : "Open the governed launch workspace..."}
                    rows={4}
                    className="min-h-[112px] flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={submitValue}
                    disabled={disableSubmit && !isListening}
                    aria-label="Generate governed surface"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cyan-300 text-slate-950 transition-colors hover:bg-cyan-200 disabled:bg-slate-700 disabled:text-slate-500"
                    title="Generate governed surface"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {mirrorSeedId ? `MirrorSeed local: ${mirrorSeedId.slice(0, 11)}. No tracking profile.` : "Session state stays local unless a vault is approved."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STARTERS.map((starter) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={starter.label}
                    type="button"
                    onClick={() => onSubmit(starter.prompt)}
                    className="group flex h-16 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-left transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-sm font-medium text-slate-200">{starter.label}</span>
                  </button>
                );
              })}
            </div>

            {qaSlot}
          </aside>

          <main className="min-h-[560px] overflow-hidden rounded-lg border border-white/10 bg-[#111821] shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">Generated Surface</div>
                <div className="text-sm font-semibold text-white">Reflective work OS</div>
              </div>
              <span className="rounded-md bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">Mirror loop</span>
            </div>
            <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <section className="rounded-lg border border-white/10 bg-[#0c1219] p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                    <Layers3 className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-white">Sense &gt; Reflect &gt; Generate &gt; Gate &gt; Receipt</h2>
                    <p className="text-xs leading-5 text-slate-500">Active Mirror mirrors the user, generates the needed surface, and marks what is real, gated, stored, or unavailable.</p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] p-3">
                  <div className="mb-2 text-xs font-semibold uppercase text-cyan-200">Built-in skill</div>
                  <div className="text-sm font-semibold text-white">{ACTIVE_MIRROR_CANONICAL_DOCTRINE_SKILL.name}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Stateful doctrine, provenance, reflection, storage, approvals, and receipts. Version {ACTIVE_MIRROR_CANONICAL_DOCTRINE_SKILL.version}.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {doctrineRows.map(([label, body]) => (
                    <article key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        {label}
                      </div>
                      <p className="text-xs leading-5 text-slate-400">{body}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
                  <div className="mb-3 text-xs font-semibold uppercase text-slate-500">Boot sequence</div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {ACTIVE_MIRROR_BOOT_SEQUENCE.slice(0, 6).map((step, index) => (
                      <div key={step} className="rounded-md border border-white/10 bg-white/[0.035] p-2">
                        <div className="text-[10px] font-semibold uppercase text-cyan-200">{String(index + 1).padStart(2, "0")}</div>
                        <div className="mt-1 text-xs leading-4 text-slate-300">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-black/25">
                  <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase text-slate-500">
                    <span>Provenance source</span>
                    <span>State</span>
                  </div>
                  {sourceRows.map((row) => (
                    <a
                      key={row.name}
                      href={row.href}
                      target="_blank"
                      rel="noreferrer"
                      className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/5 px-3 py-3 text-sm last:border-b-0 hover:bg-white/[0.035]"
                    >
                      <span className="min-w-0 truncate text-slate-200">{row.name}</span>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-300">{row.state}</span>
                    </a>
                  ))}
                </div>
              </section>

              <aside className="grid gap-3">
                {runtimeRows.map(([label, body], index) => {
                  const Icon = [ShieldCheck, Database, Bot, LockKeyhole][index] || Route;
                  return (
                    <article key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                        <Icon className="h-4 w-4 text-cyan-200" />
                        {label}
                      </div>
                      <p className="text-xs leading-5 text-slate-400">{body}</p>
                    </article>
                  );
                })}
              </aside>
            </div>
          </main>

          <aside className="grid min-h-0 gap-4">
            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Database className="h-4 w-4 text-emerald-200" />
                Storage Split
              </div>
              <div className="space-y-2 text-xs leading-5">
                {visibleStorageRows.map((row) => (
                  <div key={row.store} className="rounded-md bg-black/25 p-3 text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">{row.store}</span>
                      <span className="max-w-[150px] truncate rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">{row.rule}</span>
                    </div>
                    <div className="mt-1 text-slate-500">{row.location}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <GitBranch className="h-4 w-4 text-amber-200" />
                Approval Queue
              </div>
              <div className="space-y-2 text-xs leading-5">
                <div className="rounded-md bg-black/25 p-3 text-slate-300">Private body/fresh lattice: conditional, body_unavailable if offline</div>
                <div className="rounded-md bg-black/25 p-3 text-slate-300">Browser/source lookup: prepared, not run</div>
                <div className="rounded-md bg-black/25 p-3 text-slate-300">File export: generated, user-initiated download</div>
                <div className="rounded-md bg-black/25 p-3 text-slate-300">Computer use: blocked until explicit approval</div>
                <div className="rounded-md bg-black/25 p-3 text-slate-300">External send: blocked until review</div>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Route className="h-4 w-4 text-cyan-200" />
                Doctrine Contract
              </div>
              <p className="text-xs leading-5 text-slate-400">
                Public surfaces show what is reflected, generated, sourced, gated, unknown, approved, stored, unavailable, or exported. No hidden execution, no fake receipts, no unsupported claims.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

export { DEFAULT_GOVERNED_PROMPT };
