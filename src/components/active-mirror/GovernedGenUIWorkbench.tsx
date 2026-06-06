"use client";

import type { ReactNode, RefObject } from "react";
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  FileText,
  Globe,
  LockKeyhole,
  Mic,
  MicOff,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import { ACTIVE_MIRROR_CANONICAL_DOCTRINE_SKILL } from "@/lib/mirror/contracts/activeMirrorBootloader";

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
  "Help me finish one real task. Mirror what I need, generate the first useful surface, and show what is ready, gated, missing, or exportable.";

const ROUTES = [
  {
    label: "Finish a task",
    body: "Draft the plan, checklist, message, brief, or next move.",
    icon: CheckCircle2,
    prompt:
      "I need to finish this task: . Mirror the goal, generate the first useful artifact, and give me the next action.",
  },
  {
    label: "Build a workspace",
    body: "Turn an idea into a small app, form, workflow, or spec.",
    icon: Workflow,
    prompt:
      "I want to build this workspace: . Mirror the user, generate the working surface, and include the file/export path.",
  },
  {
    label: "Research or prove",
    body: "Prepare source checks, assumptions, unknowns, and a brief.",
    icon: Globe,
    prompt:
      "I need to research or prove this: . Prepare the source route, assumptions, unknowns, and a concise evidence brief.",
  },
];

const TRUST_ITEMS = [
  {
    label: "Reflects first",
    body: "Goal, constraints, and useful output are mirrored before the surface appears.",
    icon: Sparkles,
  },
  {
    label: "Generates work",
    body: "The first result is a document, workflow, research desk, chart, or file pack.",
    icon: FileText,
  },
  {
    label: "Proof stays visible",
    body: "Facts, assumptions, unknowns, sources, and receipts are separated.",
    icon: ShieldCheck,
  },
  {
    label: "Private actions gated",
    body: "Files, accounts, devices, sends, and vault memory require approval.",
    icon: LockKeyhole,
  },
];

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

  const chooseRoute = (prompt: string) => {
    onValueChange(prompt);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <section className="relative min-h-full w-full overflow-hidden bg-[#f4f6f1] text-[#171a18]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1180px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#d9ddd2] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Image src="/logo.png" alt="Active Mirror" width={36} height={36} className="h-9 w-9 object-contain" priority />
            <div className="min-w-0">
              <h1 className="text-base font-semibold tracking-normal text-[#171a18] sm:text-lg">Active Mirror</h1>
              <p className="text-xs leading-5 text-[#667064]">Reflective work OS</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/15 bg-emerald-100 px-2.5 py-1 font-medium text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Live preview
            </span>
            <button
              type="button"
              onClick={onInstall}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#d9ddd2] bg-white/60 px-2.5 py-1 font-medium text-[#525b52] transition-colors hover:border-[#bfc6ba] hover:bg-white"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              {installLabel}
            </button>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 lg:py-10">
          <section className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-700/15 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
              <Sparkles className="h-3.5 w-3.5" />
              Ask once. Get the first working surface.
            </div>
            <h2 className="max-w-[720px] text-4xl font-semibold tracking-normal text-[#151815] sm:text-5xl lg:text-6xl">
              Say what you need. Active Mirror makes the workspace.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5f685d] sm:text-lg">
              It reflects the request, generates the useful artifact, and keeps proof, limits, and approvals visible.
            </p>

            <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-3">
              {ROUTES.map((route) => {
                const Icon = route.icon;
                return (
                  <button
                    key={route.label}
                    type="button"
                    onClick={() => chooseRoute(route.prompt)}
                    className="group min-h-[104px] rounded-lg border border-[#d9ddd2] bg-white p-3.5 text-left shadow-sm shadow-black/[0.03] transition-colors hover:border-cyan-500/40 hover:bg-cyan-50 sm:min-h-[132px] sm:p-4"
                  >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-[#171a18] text-white transition-colors group-hover:bg-cyan-700 sm:mb-3 sm:h-9 sm:w-9">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-semibold text-[#171a18]">{route.label}</div>
                    <p className="mt-2 text-xs leading-5 text-[#667064]">{route.body}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="rounded-xl border border-[#d9ddd2] bg-white p-4 shadow-xl shadow-black/[0.06]">
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase text-[#7a8276]">Start here</div>
              <label htmlFor="active-mirror-front-door" className="mt-1 block text-lg font-semibold text-[#171a18]">
                What should Active Mirror make or finish?
              </label>
            </div>
            <div className="rounded-lg border border-[#d9ddd2] bg-[#f8f9f5] p-2">
              <textarea
                id="active-mirror-front-door"
                ref={inputRef}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitValue();
                  }
                }}
                placeholder={isListening ? "Listening..." : "Example: I need a client-ready proposal for a 72-hour AI demo."}
                rows={7}
                className="min-h-[190px] w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-[#171a18] outline-none placeholder:text-[#8a9286]"
              />
              <div className="flex items-center justify-between gap-3 border-t border-[#d9ddd2] pt-2">
                <button
                  type="button"
                  onClick={onToggleListening}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors ${
                    isListening ? "bg-red-500 text-white" : "text-[#667064] hover:bg-white hover:text-[#171a18]"
                  }`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={submitValue}
                  disabled={disableSubmit && !isListening}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#171a18] px-4 text-sm font-semibold text-white transition-colors hover:bg-cyan-800 disabled:bg-[#c9cec4] disabled:text-[#7a8276]"
                >
                  Generate surface
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#7a8276]">
              {mirrorSeedId ? `Local session seed: ${mirrorSeedId.slice(0, 11)}. No tracking profile.` : "Session state stays local unless a vault is approved."}
            </p>
          </aside>
        </main>

        <section className="border-t border-[#d9ddd2] py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-cyan-800 shadow-sm shadow-black/[0.04]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[#171a18]">{item.label}</div>
                    <p className="mt-1 text-xs leading-5 text-[#667064]">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#667064]">
            <span className="rounded-md bg-white px-2.5 py-1 shadow-sm shadow-black/[0.03]">
              Doctrine skill loaded: {ACTIVE_MIRROR_CANONICAL_DOCTRINE_SKILL.version}
            </span>
            <span className="rounded-md bg-white px-2.5 py-1 shadow-sm shadow-black/[0.03]">
              Private body offline: private actions show body_unavailable
            </span>
          </div>
        </section>

        {qaSlot ? <div className="pb-4">{qaSlot}</div> : null}
      </div>
    </section>
  );
}

export { DEFAULT_GOVERNED_PROMPT };
