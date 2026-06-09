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
] as const;

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
] as const;

const MOBILE_TRUST_ITEMS = [
  { label: "Proof on", icon: ShieldCheck },
  { label: "Gated", icon: LockKeyhole },
  { label: "Exportable", icon: FileText },
] as const;

type BodyReceiptProofState =
  | "verified"
  | "present_unverified"
  | "invalid_signature"
  | "hash_only"
  | "expired"
  | "missing";

function bodyReceiptProofState(status: MirrorKernelPublicStatus | null): BodyReceiptProofState {
  const receipt = status?.bodyReceipt;
  if (!receipt) return "missing";
  if (receipt.status === "expired") return "expired";
  if (receipt.status === "invalid") return "invalid_signature";
  if (receipt.status === "missing") return "missing";
  if (receipt.signatureState === "not_available") return "missing";
  return receipt.signatureState;
}

function hasVerifiedUnexpiredReceipt(status: MirrorKernelPublicStatus | null) {
  const receipt = status?.bodyReceipt;
  if (!receipt || receipt.status !== "available" || receipt.signatureState !== "verified" || !receipt.expiresAt) {
    return false;
  }

  const expiresAt = Date.parse(receipt.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

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
    <section className="relative min-h-full w-full overflow-y-auto bg-[var(--ink-1000)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_0%,rgba(100,112,230,0.18),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(210,162,78,0.10),transparent_30%)]" />

      <header className="sticky top-0 z-20 border-b border-[var(--hairline)] bg-[rgba(7,8,10,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-[22px]">
          <div className="flex min-w-0 items-center gap-2 [font-family:var(--font-data)]">
            <Image src="/logo.png" alt="Active Mirror" width={30} height={30} className="h-[30px] w-[30px] object-contain" priority />
            <div className="min-w-0">
              <h1 className="truncate text-[14px] font-semibold text-[var(--text-primary)]">Active Mirror</h1>
              <p className="hidden text-[11px] text-[var(--text-faint)] sm:block">governed reflective work OS</p>
            </div>
          </div>

          <div className="ml-1 hidden items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1 text-[11px] text-[var(--text-tertiary)] [font-family:var(--font-data)] sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]" />
            {kernelStatus?.state === "active" ? "body online" : "body_unavailable · public route"}
          </div>

          <a href="/about" className="ml-auto hidden text-[11px] text-[var(--text-faint)] transition-colors hover:text-[var(--text-primary)] [font-family:var(--font-data)] sm:inline">
            trust rules
          </a>
          <button
            type="button"
            onClick={onInstall}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[var(--hairline)] bg-[var(--surface-soft)] px-2.5 text-[11px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {installLabel}
          </button>
        </div>
      </header>

      <div className="relative mx-auto grid min-h-[calc(100dvh-57px)] max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_312px]">
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:border-r lg:border-[var(--hairline)] lg:px-[30px] lg:py-[22px]">
          <div className="mx-auto flex max-w-[720px] flex-col gap-4">
            <section data-testid="mobile-front-door" className="lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(100,112,230,0.24)] bg-[var(--reflect-tint)] px-3 py-1 text-xs font-semibold text-[var(--reflect-300)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Pocket capture
                </div>
                <span className="rounded-md border border-[var(--hairline)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--text-tertiary)]">
                  Ready now
                </span>
              </div>

              <h2 className="mt-4 max-w-[360px] text-3xl font-semibold leading-tight tracking-normal text-[var(--text-primary)]">
                Give it one real target.
              </h2>
              <p className="mt-2 max-w-[340px] text-sm leading-6 text-[var(--text-secondary)]">
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
                      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center text-xs font-semibold transition-colors ${
                        selectedRoute?.label === route.label
                          ? "border-[rgba(100,112,230,0.52)] bg-[var(--reflect-tint)] text-[var(--text-primary)]"
                          : "border-[var(--hairline)] bg-[var(--ink-950)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--ink-800)] text-[var(--reflect-300)]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="leading-4">{route.mobileLabel}</span>
                    </button>
                  );
                })}
              </div>

              {selectedRoute ? (
                <div className="mt-2 rounded-lg border border-[rgba(100,112,230,0.22)] bg-[var(--reflect-tint)] px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">{selectedRoute.label}:</span> {selectedRoute.body}
                </div>
              ) : null}
            </section>

            <section data-testid="desktop-front-door" className="hidden lg:block">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--signal)] [font-family:var(--font-data)]">
                capture &gt; reflection &gt; generated workspace &gt; proof line &gt; next action
              </div>
              <h2 className="max-w-[690px] text-2xl font-semibold leading-tight tracking-normal text-[var(--text-primary)]">
                Say what you need. Active Mirror makes the workspace.
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-6 text-[var(--text-secondary)]">
                Active Mirror reflects the request, builds the workspace, and keeps proof, permissions, memory, and next actions visible.
              </p>
            </section>

            <section className="rounded-[14px] border border-[var(--border-default)] bg-[var(--ink-950)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.40)] lg:p-[18px]">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)] [font-family:var(--font-data)]">
                <span className="text-[var(--signal)]">/</span>
                Mirror capture
              </div>

              <label htmlFor="active-mirror-front-door" className="sr-only">
                {selectedRoute ? `Add the ${selectedRoute.label.toLowerCase()} target` : "Type the exact thing you need"}
              </label>
              <div className="flex gap-3">
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
                  placeholder={isListening ? "Listening..." : selectedRoute?.placeholder || "Describe a messy request. Active Mirror reflects it, builds the first useful surface, and shows proof."}
                  rows={4}
                  className="min-h-[108px] flex-1 resize-none bg-transparent py-1 text-[17px] leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-faint)] lg:min-h-[92px]"
                />
                <div className="flex shrink-0 flex-col justify-end gap-2">
                  <button
                    type="button"
                    onClick={onToggleListening}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                    className={`flex h-10 w-10 items-center justify-center rounded-[10px] border transition-colors ${
                      isListening
                        ? "border-red-300/40 bg-red-500 text-[var(--text-on-accent)]"
                        : "border-[var(--hairline)] bg-[var(--surface-subtle)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                    }`}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={guardedSubmit}
                    disabled={disableSubmit && !isListening}
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border-strong)] bg-[var(--reflect-500)] text-[var(--text-on-accent)] transition-colors hover:bg-[var(--reflect-400)] disabled:cursor-default disabled:opacity-40"
                    aria-label="Generate surface"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-3">
                {ROUTES.map((route) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.label}
                      type="button"
                      data-testid={`desktop-route-${route.id}`}
                      onClick={() => chooseRoute(route)}
                      className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-[11.5px] font-medium transition-colors [font-family:var(--font-data)] ${
                        selectedRoute?.label === route.label
                          ? "border-[rgba(100,112,230,0.52)] bg-[var(--reflect-tint)] text-[var(--text-primary)]"
                          : "border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-[var(--reflect-300)]" />
                      {route.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {needsInput ? (
              <p className="rounded-lg border border-[rgba(226,185,110,0.25)] bg-[var(--gold-tint)] px-3 py-2 text-xs font-medium text-[var(--gold-400)]">
                Add the actual target first. Active Mirror needs the task, workspace idea, or claim to avoid generating a canned route.
              </p>
            ) : null}

            <ProofLine status={kernelStatus} />

            <section data-testid="mobile-trust-strip" className="lg:hidden">
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--ink-950)] p-2">
                {MOBILE_TRUST_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg bg-[var(--surface-subtle)] px-2 text-center">
                      <Icon className="h-4 w-4 text-[var(--reflect-300)]" />
                      <span className="text-[11px] font-semibold leading-4 text-[var(--text-secondary)]">{item.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--text-faint)]">
                Private files, account actions, devices, and sends stay gated; offline private body work is marked body_unavailable.
              </p>
            </section>

            <section className="hidden grid-cols-2 gap-3 lg:grid">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-subtle)] p-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-card)] text-[var(--reflect-300)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</div>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-faint)]">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </section>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-faint)] [font-family:var(--font-data)]">
              <span className="rounded-md border border-[var(--hairline)] bg-[var(--surface-subtle)] px-2.5 py-1">
                Trust rules: {ACTIVE_MIRROR_CANONICAL_DOCTRINE_SKILL.version}
              </span>
              <span className="rounded-md border border-[var(--hairline)] bg-[var(--surface-subtle)] px-2.5 py-1">
                {mirrorSeedId ? `Local seed ${mirrorSeedId.slice(0, 11)}` : "Local session seed pending"}
              </span>
            </div>

            {qaSlot ? <div>{qaSlot}</div> : null}
          </div>
        </main>

        <aside className="hidden flex-col gap-3 px-[22px] py-[22px] lg:flex">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)] [font-family:var(--font-data)]">
            Runtime rail
          </div>
          <MirrorKernelProofStrip status={kernelStatus} />
          <MirrorRatchetStrip status={kernelStatus} />
          <MirrorSovereignContractsStrip status={kernelStatus} />
        </aside>
      </div>
    </section>
  );
}

function ProofLine({ status }: { status: MirrorKernelPublicStatus | null }) {
  const receiptState = bodyReceiptProofState(status);
  const freshPrivateActions = hasVerifiedUnexpiredReceipt(status);
  const proofItems = [
    { key: "source", value: "prepared", tone: "ok" },
    { key: "assumptions", value: "separated", tone: "ok" },
    { key: "unknowns", value: "visible", tone: "warn" },
    { key: "gate", value: "approval required", tone: "gate" },
    { key: "receipt", value: receiptState, tone: receiptState === "verified" ? "ok" : "off" },
    { key: "body", value: freshPrivateActions ? "available after approval" : "body_unavailable", tone: freshPrivateActions ? "ok" : "off" },
  ] as const;

  return (
    <section className="grid gap-px overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-3 lg:grid-cols-6" aria-label="Reusable proof line">
      {proofItems.map((item) => (
        <div key={item.key} className="min-w-0 bg-[var(--ink-1000)] px-3 py-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)] [font-family:var(--font-data)]">
            {item.key}
          </div>
          <div
            className={`mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-[11.5px] [font-family:var(--font-data)] ${
              item.tone === "ok"
                ? "text-[var(--success)]"
                : item.tone === "warn" || item.tone === "gate"
                  ? "text-[var(--gold-400)]"
                  : "text-[var(--text-tertiary)]"
            }`}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            <span className="truncate">{item.value}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function MirrorSovereignContractsStrip({ status }: { status: MirrorKernelPublicStatus | null }) {
  if (!status?.critique || !status.revocation || !status.identityContinuity) return null;

  const contracts = [
    {
      label: "Self critique",
      value: `${status.critique.events.length} admissions`,
      body: "Blocked, gated, missing, and queued system states are exposed.",
      state: "public_safe",
    },
    {
      label: "Revocation cascade",
      value: `${status.revocation.events.length} effects`,
      body: "Memory, source, export, and body receipt revocations show downstream consequences.",
      state: status.revocation.privateEnforcement,
    },
    {
      label: "Identity continuity",
      value: status.identityContinuity.crossModelDiff.measurementState.replaceAll("_", " "),
      body: "Public identity vector stays stable; private drift requires a signed receipt.",
      state: status.identityContinuity.status,
    },
  ];

  return (
    <section
      data-testid="mirror-sovereign-contracts"
      className="rounded-xl border border-[var(--hairline)] bg-[var(--ink-950)] p-3"
      aria-label="Active Mirror sovereign proof contracts"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Sovereign proof contracts</h2>
          <p className="mt-1 text-[11px] leading-4 text-[var(--text-faint)]">
            User-owned proof, revocation, continuity, and self-transparency.
          </p>
        </div>
        <a
          href="/api/mirror/proof-ledger?format=markdown"
          className="shrink-0 rounded-md border border-[var(--hairline)] bg-[var(--surface-subtle)] px-2 py-1 text-[10px] font-semibold text-[var(--text-accent)] transition-colors hover:border-[var(--border-strong)]"
        >
          Export proof ledger
        </a>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {contracts.map((item) => (
          <div key={item.label} className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-subtle)] p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-[var(--text-primary)]">{item.label}</div>
                <div className="mt-0.5 text-[10px] font-semibold text-[var(--reflect-300)] [font-family:var(--font-data)]">{item.value}</div>
              </div>
              <span className="shrink-0 rounded bg-[var(--surface-active)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-tertiary)] [font-family:var(--font-data)]">
                {item.state.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-[var(--text-faint)]">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MirrorRatchetStrip({ status }: { status: MirrorKernelPublicStatus | null }) {
  const ratchet = status?.ratchet;
  if (!ratchet) return null;
  return (
    <section
      data-testid="mirror-ratchet-proof"
      className="rounded-xl border border-[var(--hairline)] bg-[var(--ink-950)] p-3"
      aria-label="MirrorRatchet frontier failure coverage"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--green-tint)] text-[var(--success)]">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">MirrorRatchet</h2>
          <p className="text-[11px] leading-4 text-[var(--text-faint)]">Covers frontier-model failure modes with canonical controls.</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] [font-family:var(--font-data)]">
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-subtle)] px-3 py-2">
          <div className="font-semibold text-[var(--text-primary)]">{ratchet.score.coveragePct}%</div>
          <div className="mt-0.5 text-[10px] text-[var(--text-faint)]">coverage</div>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-subtle)] px-3 py-2">
          <div className="font-semibold text-[var(--text-primary)]">{ratchet.targetPasses}</div>
          <div className="mt-0.5 text-[10px] text-[var(--text-faint)]">target</div>
        </div>
      </div>

      <p className="mt-2 text-[10.5px] leading-4 text-[var(--text-faint)]">{ratchet.claimBoundary}</p>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-[var(--text-faint)] [font-family:var(--font-data)]">
        {ratchet.frontierFailureCoverage.covered.slice(0, 3).map((item) => (
          <span key={item} className="rounded-md bg-[var(--reflect-tint)] px-2 py-1 text-[var(--reflect-300)]">
            Covers: {item}
          </span>
        ))}
      </div>
      <div className="sr-only">
        {ratchet.checks.map((item) => `${item.label}: ${item.state}`).join(". ")}
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
  const receiptProofState = bodyReceiptProofState(status);
  const freshPrivateActions = hasVerifiedUnexpiredReceipt(status);
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
  return (
    <section
      data-testid="mirrorkernel-proof"
      className="rounded-xl border border-[var(--hairline)] bg-[var(--ink-950)] p-3"
      aria-label="MirrorKernel proof surface"
    >
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--reflect-tint)] text-[var(--reflect-300)]">
          <Cpu className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">MirrorKernel</h2>
            <span className="rounded-md border border-[rgba(100,112,230,0.20)] bg-[var(--reflect-tint)] px-2 py-0.5 text-[10px] font-semibold text-[var(--reflect-300)] [font-family:var(--font-data)]">
              {stateLabel}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[var(--text-faint)]">
            Contextual memory actualization under consent. Probabilistic engines propose; canonical runtime verifies.
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-[var(--text-secondary)] [font-family:var(--font-data)]">
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-subtle)] px-2.5 py-2">
          <div className="text-[var(--text-faint)]">Capability</div>
          <div className="mt-1 text-[var(--reflect-300)]">{capabilityLabel}</div>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-subtle)] px-2.5 py-2">
          <div className="text-[var(--text-faint)]">Kerneld</div>
          <div className="mt-1 text-[var(--reflect-300)]">{kerneldLabel}</div>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-subtle)] px-2.5 py-2">
          <div className="text-[var(--text-faint)]">Models</div>
          <div className="mt-1 text-[var(--reflect-300)]">proposer only</div>
        </div>
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-subtle)] px-2.5 py-2">
          <div className="text-[var(--text-faint)]">Receipt</div>
          <div className="mt-1 text-[var(--reflect-300)]">{receiptProofState}</div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--text-faint)] [font-family:var(--font-data)]">
        <span className="rounded-md bg-[var(--surface-active)] px-2 py-1">Public-safe packet</span>
        <span className="rounded-md bg-[var(--surface-active)] px-2 py-1">Trust rule: accuracy without fabrication</span>
        <span className="rounded-md bg-[var(--surface-active)] px-2 py-1">
          Fresh private actions: {freshPrivateActions ? "available after approval" : "body_unavailable"}
        </span>
      </div>
      <div className="sr-only">
        Private topology redacted. Memory actualization: consent-gated. Compiled: {compiledAt || "missing"}. Body receipt: {bodyReceiptAt || "missing"}.
        Receipt proof: {receiptProofState}. Doctrine: accuracy without fabrication. Canonical runtime verifies.
      </div>

      <div data-testid="kernel-control-matrix" className="sr-only">
        Context firewall, memory actualization, writeback firewall, source proof, accuracy mode, action gate, model routing, canonical promotion.
      </div>
    </section>
  );
}

export { DEFAULT_GOVERNED_PROMPT };
