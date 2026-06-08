"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Cpu,
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
import type { MirrorKernelPublicStatus } from "@/lib/mirror/mirrorKernel";

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
    id: "finish-task",
    label: "Finish a task",
    mobileLabel: "Finish",
    body: "Draft the plan, checklist, message, brief, or next move.",
    icon: CheckCircle2,
    placeholder: "Example: I need a client-ready proposal by tomorrow for a 72-hour AI demo.",
  },
  {
    id: "build-workspace",
    label: "Build a workspace",
    mobileLabel: "Build",
    body: "Turn an idea into a small app, form, workflow, or spec.",
    icon: Workflow,
    placeholder: "Example: Build a customer intake workspace for a small clinic.",
  },
  {
    id: "research-prove",
    label: "Research or prove",
    mobileLabel: "Prove",
    body: "Prepare source checks, assumptions, unknowns, and a brief.",
    icon: Globe,
    placeholder: "Example: Prove whether browser-based AI workspaces are already shipping.",
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

const MOBILE_TRUST_ITEMS = [
  { label: "Proof on", icon: ShieldCheck },
  { label: "Gated", icon: LockKeyhole },
  { label: "Exportable", icon: FileText },
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
  const [selectedRoute, setSelectedRoute] = useState<(typeof ROUTES)[number] | null>(null);
  const [needsInput, setNeedsInput] = useState(false);
  const [kernelStatus, setKernelStatus] = useState<MirrorKernelPublicStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/mirror/kernel", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((status: MirrorKernelPublicStatus | null) => {
        if (!cancelled) setKernelStatus(status);
      })
      .catch(() => {
        if (!cancelled) setKernelStatus(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const submitValue = () => onSubmit(value || DEFAULT_GOVERNED_PROMPT);

  const guardedSubmit = () => {
    if (selectedRoute && !value.trim()) {
      setNeedsInput(true);
      inputRef.current?.focus();
      return;
    }
    submitValue();
  };

  const chooseRoute = (route: (typeof ROUTES)[number]) => {
    setSelectedRoute(route);
    setNeedsInput(false);
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

        <main className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-8 lg:py-10">
          <section data-testid="mobile-front-door" className="lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-700/15 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
                <Sparkles className="h-3.5 w-3.5" />
                Pocket capture
              </div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#525b52] shadow-sm shadow-black/[0.04]">
                Ready now
              </span>
            </div>

            <h2 className="mt-4 max-w-[360px] text-3xl font-semibold leading-tight tracking-normal text-[#151815]">
              Give it one real target.
            </h2>
            <p className="mt-2 max-w-[340px] text-sm leading-6 text-[#667064]">
              Active Mirror returns the first workspace with proof, limits, and the next step attached.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Mobile route picker">
              {ROUTES.map((route) => {
                const Icon = route.icon;
                return (
                  <button
                    key={route.label}
                    type="button"
                    data-testid={`mobile-route-${route.id}`}
                    aria-label={route.label}
                    onClick={() => chooseRoute(route)}
                    className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center text-xs font-semibold shadow-sm shadow-black/[0.03] transition-colors ${
                      selectedRoute?.label === route.label
                        ? "border-cyan-500/50 bg-cyan-50 text-cyan-950"
                        : "border-[#d9ddd2] bg-white text-[#2f352f] hover:border-cyan-500/40 hover:bg-cyan-50"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171a18] text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="leading-4">{route.mobileLabel}</span>
                  </button>
                );
              })}
            </div>

            {selectedRoute ? (
              <div className="mt-1 rounded-lg border border-cyan-500/25 bg-cyan-50 px-3 py-2 text-xs leading-5 text-cyan-950">
                <span className="font-semibold">{selectedRoute.label}:</span> {selectedRoute.body}
              </div>
            ) : null}
          </section>

          <section data-testid="desktop-front-door" className="hidden max-w-2xl lg:block">
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
                    data-testid={`desktop-route-${route.id}`}
                    onClick={() => chooseRoute(route)}
                    className={`group min-h-[104px] rounded-lg border p-3.5 text-left shadow-sm shadow-black/[0.03] transition-colors sm:min-h-[132px] sm:p-4 ${
                      selectedRoute?.label === route.label
                        ? "border-cyan-500/50 bg-cyan-50"
                        : "border-[#d9ddd2] bg-white hover:border-cyan-500/40 hover:bg-cyan-50"
                    }`}
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

          <aside className="rounded-2xl border border-[#d9ddd2] bg-white p-3 shadow-lg shadow-black/[0.06] lg:rounded-xl lg:p-4 lg:shadow-xl">
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase text-[#7a8276]">
                <span className="lg:hidden">Capture</span>
                <span className="hidden lg:inline">Start here</span>
              </div>
              <label htmlFor="active-mirror-front-door" className="mt-1 block text-lg font-semibold text-[#171a18]">
                <span className="lg:hidden">
                  {selectedRoute ? `Add the ${selectedRoute.label.toLowerCase()} target` : "Type the exact thing you need"}
                </span>
                <span className="hidden lg:inline">
                  {selectedRoute ? `What should Active Mirror ${selectedRoute.label.toLowerCase()}?` : "What should Active Mirror make or finish?"}
                </span>
              </label>
            </div>
            <div className="rounded-xl border border-[#d9ddd2] bg-[#f8f9f5] p-2 lg:rounded-lg">
              <textarea
                id="active-mirror-front-door"
                ref={inputRef}
                value={value}
                onChange={(event) => {
                  setNeedsInput(false);
                  onValueChange(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    guardedSubmit();
                  }
                }}
                placeholder={isListening ? "Listening..." : selectedRoute?.placeholder || "Example: I need a client-ready proposal for a 72-hour AI demo."}
                rows={7}
                className="min-h-[150px] w-full resize-none bg-transparent px-2 py-2 text-[16px] leading-6 text-[#171a18] outline-none placeholder:text-[#8a9286] lg:min-h-[190px] lg:text-sm"
              />
              <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2 border-t border-[#d9ddd2] pt-2 lg:flex lg:justify-between lg:gap-3">
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
                  onClick={guardedSubmit}
                  disabled={disableSubmit && !isListening}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#171a18] px-4 text-sm font-semibold text-white transition-colors hover:bg-cyan-800 disabled:bg-[#c9cec4] disabled:text-[#7a8276] lg:min-h-10"
                >
                  Generate surface
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
            {needsInput ? (
              <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Add the actual target first. Active Mirror needs the task, workspace idea, or claim to avoid generating a canned route.
              </p>
            ) : null}
            <p className="mt-3 text-xs leading-5 text-[#7a8276]">
              {mirrorSeedId ? `Local session seed: ${mirrorSeedId.slice(0, 11)}. No tracking profile.` : "Session state stays local unless a vault is approved."}
            </p>
          </aside>
        </main>

        <section data-testid="mobile-trust-strip" className="pb-4 lg:hidden">
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#d9ddd2] bg-white p-2 shadow-sm shadow-black/[0.04]">
            {MOBILE_TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg bg-[#f8f9f5] px-2 text-center">
                  <Icon className="h-4 w-4 text-cyan-800" />
                  <span className="text-[11px] font-semibold leading-4 text-[#2f352f]">{item.label}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667064]">
            Private files, account actions, devices, and sends stay gated; offline private body work is marked body_unavailable.
          </p>
        </section>

        <section className="hidden border-t border-[#d9ddd2] py-4 lg:block">
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

        <MirrorKernelProofStrip status={kernelStatus} />
        <MirrorRatchetStrip status={kernelStatus} />

        {qaSlot ? <div className="pb-4">{qaSlot}</div> : null}
      </div>
    </section>
  );
}

function MirrorRatchetStrip({ status }: { status: MirrorKernelPublicStatus | null }) {
  const ratchet = status?.ratchet;
  if (!ratchet) return null;
  const visibleChecks = ratchet.checks.slice(0, 6);

  return (
    <section
      data-testid="mirror-ratchet-proof"
      className="mb-4 rounded-xl border border-[#d9ddd2] bg-white p-3 shadow-sm shadow-black/[0.04] lg:p-4"
      aria-label="MirrorRatchet frontier failure coverage"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-cyan-50 text-cyan-800">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-normal text-[#171a18]">MirrorRatchet</h2>
              <p className="text-xs leading-5 text-[#667064]">
                Covers frontier-model failure modes with canonical controls.
              </p>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-[#667064]">
            {ratchet.claimBoundary}
          </p>
        </div>
        <div className="grid min-w-[180px] grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-[#d9ddd2] bg-[#f8f9f5] px-3 py-2">
            <div className="font-semibold text-[#171a18]">{ratchet.score.coveragePct}%</div>
            <div className="mt-0.5 text-[11px] text-[#667064]">failure coverage</div>
          </div>
          <div className="rounded-lg border border-[#d9ddd2] bg-[#f8f9f5] px-3 py-2">
            <div className="font-semibold text-[#171a18]">{ratchet.targetPasses}</div>
            <div className="mt-0.5 text-[11px] text-[#667064]">ratchet target</div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visibleChecks.map((item) => (
          <div key={item.id} className="rounded-lg border border-[#d9ddd2] bg-[#f8f9f5] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-xs font-semibold text-[#171a18]">{item.label}</div>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  item.state === "passing"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.state === "queued"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {item.state}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-[#667064]">{item.activeMirrorControl}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#667064]">
        {ratchet.frontierFailureCoverage.covered.slice(0, 7).map((item) => (
          <span key={item} className="rounded-md bg-cyan-50 px-2.5 py-1 text-cyan-900">
            Covers: {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function MirrorKernelProofStrip({ status }: { status: MirrorKernelPublicStatus | null }) {
  const stateLabel =
    status?.state === "active"
      ? "Kernel online"
      : status?.state === "public_body_synced"
        ? "Public body synced"
      : status?.state === "compiled_body_gated"
        ? "Compiled, body gated"
        : status
          ? "Body unavailable"
          : "Public proof";
  const capabilityLabel =
    status?.capabilityKernel.status === "compiled"
      ? "compiled"
      : status?.capabilityKernel.status || "public-safe";
  const kerneldLabel = status?.kerneld.status || "body_unavailable";
  const bodyReceiptLabel = status?.bodyReceipt.status || "missing";
  const compiledAt = status?.capabilityKernel.compiledAt
    ? new Date(status.capabilityKernel.compiledAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const bodyReceiptAt = status?.bodyReceipt.issuedAt
    ? new Date(status.bodyReceipt.issuedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const controlPlane = status?.controlPlane || [];

  return (
    <section
      data-testid="mirrorkernel-proof"
      className="mb-4 rounded-xl border border-[#d9ddd2] bg-[#111715] p-3 text-white shadow-sm shadow-black/[0.08] lg:mb-5 lg:p-4"
      aria-label="MirrorKernel proof surface"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-200">
            <Cpu className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold tracking-normal text-white">MirrorKernel</h2>
              <span className="rounded-md border border-cyan-200/15 bg-cyan-200/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-100">
                {stateLabel}
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-white/68">
              Contextual memory actualization under consent. Probabilistic engines propose; canonical runtime verifies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-white/78 sm:grid-cols-4 lg:min-w-[560px]">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
            <div className="text-white/42">Capability</div>
            <div className="mt-1 text-cyan-100">{capabilityLabel}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
            <div className="text-white/42">Kerneld</div>
            <div className="mt-1 text-cyan-100">{kerneldLabel}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
            <div className="text-white/42">Models</div>
            <div className="mt-1 text-cyan-100">proposer only</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
            <div className="text-white/42">Body receipt</div>
            <div className="mt-1 text-cyan-100">{bodyReceiptLabel}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
          Public-safe proof packet
        </span>
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
          Private topology redacted
        </span>
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
          Memory actualization: consent-gated
        </span>
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
          Canonical runtime &gt; probabilistic output
        </span>
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
          Doctrine: accuracy without fabrication
        </span>
        <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
          Fresh private actions: {kerneldLabel === "online" ? "available after approval" : "body_unavailable"}
        </span>
        {compiledAt ? (
          <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
            Last compiled: {compiledAt}
          </span>
        ) : null}
        {bodyReceiptAt ? (
          <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
            Body receipt: {bodyReceiptAt}
          </span>
        ) : null}
        {status?.bodyReceipt.signatureState === "present_unverified" || status?.bodyReceipt.signatureState === "hash_only" ? (
          <span className="rounded-md bg-white/[0.06] px-2.5 py-1">
            Receipt proof: {status.bodyReceipt.signatureState.replace("_", " ")}
          </span>
        ) : null}
      </div>

      {controlPlane.length ? (
        <div data-testid="kernel-control-matrix" className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {controlPlane.map((item) => (
            <div key={item.label} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-xs font-semibold text-white">{item.label}</div>
                <span className="shrink-0 rounded bg-cyan-200/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-100">
                  {item.state.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-white/55">{item.control}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export { DEFAULT_GOVERNED_PROMPT };
