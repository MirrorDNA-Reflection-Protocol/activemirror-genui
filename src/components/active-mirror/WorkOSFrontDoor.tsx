"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SiteTelemetry from "./SiteTelemetry";
import { trackSiteEvent } from "@/lib/siteAnalytics";

type ArtifactBlock = {
  heading: string;
  type: "checklist" | "steps" | "list" | "fields";
  items: string[];
};

type WorkArtifact = {
  title: string;
  type: "plan" | "brief" | "outline" | "draft" | "checklist" | "note";
  summary: string;
  blocks: ArtifactBlock[];
  assumptions: string[];
  unknowns: string[];
  nextAction: string;
};

type DialogueTurn = {
  id: string;
  role: "you" | "am";
  text: string;
};

type RuntimeContract = {
  id: string;
  surface: string;
  route: string;
  schemaId: string;
  transport: string;
  status: "public_contract_ready" | "private_receipt_required";
  claimBoundary: string;
};

type ContractRegistry = {
  schemaVersion: "active_mirror.contract_registry.v1";
  version: string;
  contracts: RuntimeContract[];
};

type KernelStatus = {
  name: "MirrorKernel";
  version: string;
  state: string;
  publicClaim?: string;
  capabilityKernel?: { status?: string } | string;
  controlPlane?: { label?: string; control?: string; state?: string }[];
  claimBoundary?: string;
};

type RatchetStatus = {
  version: string;
  targetPasses: number;
  claimBoundary: string;
  score: { passing: number; total: number; coveragePct: number };
  checks: { id: string; label: string; state: string; frontierFailure: string; activeMirrorControl: string }[];
  frontierFailureCoverage: { covered: string[]; queued: string[] };
};

type ProofLedger = {
  schemaVersion: "active_mirror.proof_ledger_export.v1";
  version: string;
  owner: string;
  portability?: string;
  claimBoundary: string;
  chainHead: string;
  exportFormats: string[];
  queuedPrivateEvents?: string[];
  entries: {
    index: number;
    id: string;
    kind: string;
    statement: string;
    state: string;
    source: string;
    previousHash: string;
    hash: string;
  }[];
};

type RevocationCascade = {
  schemaVersion: "active_mirror.revocation_cascade.v1";
  version: string;
  claimBoundary: string;
  privateEnforcement: string;
  events: {
    sequence: number;
    revoke: string;
    downstreamEffect: string;
    state: string;
    receiptRequired: string;
  }[];
};

type ContinuityMeasure = {
  schemaVersion: "active_mirror.identity_continuity_measure.v1";
  version: string;
  state?: string;
  receiptState: string;
  beforeModel: string;
  afterModel: string;
  continuityScore: number;
  drift: number;
  claimBoundary: string;
  requiredReceipt: string;
  vectorDelta: {
    id: string;
    label: string;
    before: number;
    after: number;
    delta: number;
    stability: number;
    weight: number;
  }[];
};

type CritiqueStream = {
  schemaVersion: "active_mirror.decision_critique_stream.v1";
  version: string;
  claimBoundary: string;
  queuedPrivateEvents?: string[];
  events: {
    sequence: number;
    id: string;
    state: string;
    systemAdmission: string;
    activeControl: string;
    publicEvidence: string;
    nextSafeStep: string;
  }[];
};

type LocalOperatorPacket = {
  schemaVersion: "active_mirror.local_operator_packet.v1";
  version: string;
  state: string;
  receiptState: string;
  claimBoundary: string;
  privateVaultIngest: { state: string; rule: string };
  skillRails: { id: string; role: string; state: string }[];
  task: { prompt: string; intentHash: string; sourceGaps: string[] };
  records: {
    supplied: number;
    eligible: number;
    selected: { id: string; kind: string; title: string; sourceHash: string; relevance: number; use: string }[];
    rejected: { id: string; title: string; reason: string }[];
  };
  taskPacket: {
    contextEnvelope: string;
    modelVisibility: string;
    selectedRecordIds: string[];
    didNotRun: string[];
    nextGate: string;
  };
  receipt: {
    packetHash: string;
    selectedRecordHashes: string[];
    rejectedCount: number;
    deterministic: boolean;
  };
};

type LocalOperatorStatus = {
  version: string;
  responseSchemaVersion: "active_mirror.local_operator_packet.v1";
  responseSchemaPath: string;
  route: string;
  mode: string;
  claimBoundary: string;
  privateVaultIngest: string;
  samplePacket: LocalOperatorPacket | null;
};

type ModelProviderHealth = {
  id: "gemini" | "openai" | "anthropic" | "local";
  label: string;
  role: string;
  modelId: string | null;
  status: "healthy" | "degraded" | "configured_unchecked" | "configured_disabled" | "unconfigured" | "gated";
  secretState: "present" | "missing" | "not_required";
  routeUse: string;
  enabled: boolean;
  wired: boolean;
  lastObservedAt: string | null;
  lastErrorClass: string | null;
  publicMessage: string;
};

type ModelHealth = {
  schemaVersion: "active_mirror.model_health.v1";
  generatedAt: string;
  claimBoundary: string;
  activePublicOrder: string[];
  sensitiveRoute: string;
  providers: ModelProviderHealth[];
};

type RuntimeState = {
  registry: ContractRegistry | null;
  kernel: KernelStatus | null;
  ratchet: RatchetStatus | null;
  ledger: ProofLedger | null;
  revocation: RevocationCascade | null;
  continuity: ContinuityMeasure | null;
  critique: CritiqueStream | null;
  operator: LocalOperatorStatus | null;
  modelHealth: ModelHealth | null;
};

type MemoryMode = "ephemeral" | "session" | "saved";

type SheetId =
  | "routing"
  | "runtime"
  | "memory"
  | "ledger"
  | "revocation"
  | "continuity"
  | "critique"
  | "ratchet"
  | "operator"
  | "kernel";

const STARTERS = [
  "Build a vendor evidence workspace",
  "Prepare a board memo with evidence",
  "Audit a claim before I send it",
  "Create a deployment plan with approvals",
];

const MEMORY_MODE_LABEL: Record<MemoryMode, string> = {
  ephemeral: "ephemeral",
  session: "session only",
  saved: "saved with approval",
};

function makeId() {
  return `r_${Math.random().toString(16).slice(2, 8)}`;
}

function lengthBucket(value: string) {
  if (value.length < 80) return "short";
  if (value.length < 300) return "medium";
  return "long";
}

async function getJson<T>(route: string): Promise<T | null> {
  try {
    const response = await fetch(route, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function stateTone(state?: string) {
  if (!state) return "off";
  if (/(ready|available|passing|proven|computed|signed|online|active|ok|compiled)/i.test(state)) return "ok";
  if (/(gated|required|queued|preview)/i.test(state)) return "warn";
  return "off";
}

function capabilityStatus(kernel: KernelStatus | null) {
  const capability = kernel?.capabilityKernel;
  return typeof capability === "string" ? capability : capability?.status || "missing";
}

function contractSheetId(id: string): SheetId {
  if (id === "proof_ledger_export") return "ledger";
  if (id === "revocation_cascade") return "revocation";
  if (id === "identity_continuity_measure") return "continuity";
  if (id === "decision_critique_stream") return "critique";
  if (id === "local_operator_packet") return "operator";
  return "runtime";
}

function contractSurfaceLabel(contract: RuntimeContract) {
  if (contract.id === "decision_critique_stream") return "Decision critique";
  if (contract.id === "proof_ledger_export") return "Evidence export";
  if (contract.id === "revocation_cascade") return "Removal effects";
  if (contract.id === "identity_continuity_measure") return "Continuity score";
  if (contract.id === "local_operator_packet") return "Local operator";
  return contract.surface;
}

export default function WorkOSFrontDoor() {
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [input, setInput] = useState("");
  const [userTurns, setUserTurns] = useState(0);
  const [busy, setBusy] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [artifact, setArtifact] = useState<WorkArtifact | null>(null);
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const [routeLabel, setRouteLabel] = useState("selecting");
  const [seedState, setSeedState] = useState<"none" | "sample">("none");
  const [memoryMode] = useState<MemoryMode>("ephemeral");
  const [runtime, setRuntime] = useState<RuntimeState>({
    registry: null,
    kernel: null,
    ratchet: null,
    ledger: null,
    revocation: null,
    continuity: null,
    critique: null,
    operator: null,
    modelHealth: null,
  });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => null);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasSeed = params.has("seed") || params.has("mirrorseed");
    const prompt = params.get("prompt");
    const frame = window.requestAnimationFrame(() => {
      if (prompt) setInput(prompt);
      if (hasSeed) {
        setSeedState("sample");
        setRouteLabel("sample · ephemeral");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getJson<ContractRegistry>("/api/mirror/contracts"),
      getJson<KernelStatus>("/api/mirror/kernel"),
      getJson<RatchetStatus>("/api/mirror/ratchet"),
      getJson<ProofLedger>("/api/mirror/proof-ledger"),
      getJson<RevocationCascade>("/api/mirror/revocation-cascade"),
      getJson<ContinuityMeasure>("/api/mirror/identity-continuity/measure"),
      getJson<CritiqueStream>("/api/mirror/critique"),
      getJson<LocalOperatorStatus>("/api/mirror/local-operator"),
      getJson<ModelHealth>("/api/mirror/model-health"),
    ]).then(([registry, kernel, ratchet, ledger, revocation, continuity, critique, operator, modelHealth]) => {
      if (cancelled) return;
      setRuntime({ registry, kernel, ratchet, ledger, revocation, continuity, critique, operator, modelHealth });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSheet(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const pathLabel = delivered
    ? "delivered"
    : userTurns === 0
      ? "solution path · a deliverable by step 10"
      : `solution path · step ${Math.min(userTurns, 10)} of 10`;

  const appendAssistantText = useCallback((id: string, value: string) => {
    setTurns((current) =>
      current.map((turn) => (turn.id === id ? { ...turn, text: `${turn.text}${value}` } : turn)),
    );
  }, []);

  const send = useCallback(async (value: string) => {
    const prompt = value.trim();
    if (!prompt || busy) return;

    setBusy(true);
    setInput("");
    const nextUserTurns = userTurns + 1;
    setUserTurns(nextUserTurns);
    trackSiteEvent({
      event: "workspace_prompt_submit",
      target: "mirror_app",
      meta: {
        promptLengthBucket: lengthBucket(prompt),
        turn: nextUserTurns,
        sampleContext: seedState === "sample",
        memoryMode,
      },
    });

    const assistantId = makeId();
    const nextTurns: DialogueTurn[] = [
      ...turns,
      { id: makeId(), role: "you", text: prompt },
      { id: assistantId, role: "am", text: "" },
    ];
    setTurns(nextTurns);

    try {
      const response = await fetch("/api/mirror/work-os", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextTurns
            .filter((turn) => turn.text.trim())
            .map((turn) => ({ role: turn.role === "you" ? "user" : "assistant", content: turn.text })),
          prompt,
          turn: nextUserTurns,
          currentArtifact: artifact,
          mirrorSeed: seedState === "sample" ? "sample_public_seed_loaded" : null,
          memoryMode,
        }),
      });

      if (!response.ok || !response.body) throw new Error(`work_os_turn_failed:${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type: "route" | "reply_delta" | "artifact" | "done";
            text?: string;
            route?: string;
            artifact?: WorkArtifact | null;
          };
          if (event.type === "route" && event.route) setRouteLabel(event.route);
          if (event.type === "reply_delta" && event.text) appendAssistantText(assistantId, event.text);
          if (event.type === "artifact" && event.artifact) {
            setArtifact(event.artifact);
            setDelivered(true);
            trackSiteEvent({
              event: "workspace_artifact_delivered",
              target: event.artifact.type,
              label: event.artifact.title,
              meta: {
                blocks: event.artifact.blocks.length,
                assumptions: event.artifact.assumptions.length,
                unknowns: event.artifact.unknowns.length,
                turn: nextUserTurns,
              },
            });
          }
        }
      }
    } catch {
      trackSiteEvent({
        event: "workspace_prompt_error",
        target: "mirror_app",
        meta: {
          promptLengthBucket: lengthBucket(prompt),
          turn: nextUserTurns,
          sampleContext: seedState === "sample",
          memoryMode,
        },
      });
      appendAssistantText(assistantId, "Tell me a little more — what's the goal, and who's it for? Even a sentence lets me draft something useful.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [appendAssistantText, artifact, busy, memoryMode, seedState, turns, userTurns]);

  const importSampleSeed = useCallback(() => {
    setSeedState("sample");
    setRouteLabel("sample · ephemeral");
    trackSiteEvent({ event: "sample_context_imported", target: "mirror_app", meta: { memoryMode } });
  }, [memoryMode]);

  const submit = useCallback(() => {
    void send(input);
  }, [input, send]);

  const sheetContent = useMemo(() => (sheet ? buildSheet(sheet, runtime, memoryMode, seedState) : null), [memoryMode, runtime, seedState, sheet]);

  useEffect(() => {
    if (sheet) trackSiteEvent({ event: "workspace_sheet_opened", target: sheet });
  }, [sheet]);

  return (
    <main className="os">
      <SiteTelemetry surface="mirror_app" />
      <OpenSheetBridge onOpen={setSheet} />
      <header className="os__top">
        <div className="os__brand"><span className="gl">⟡</span><b>Active Mirror</b></div>
        <nav className="os__nav">
          <button className="route" id="route-btn" data-testid="route-btn" title="Intelligence is routed; identity stays local" onClick={() => setSheet("routing")}>
            <span className="route__k">routed</span>
            <span className="route__v" id="route-v">{routeLabel}</span>
          </button>
          <button className="os__runtime" id="memory-btn" data-testid="memory-btn" onClick={() => setSheet("memory")}>
            <span className="d ok" />memory · {MEMORY_MODE_LABEL[memoryMode]}
          </button>
          <a className="os__about" href="/trust">review</a>
          <a className="os__about" href="/glass">evidence</a>
          <button className="os__runtime" id="runtime-btn" data-testid="runtime-btn" onClick={() => setSheet("runtime")}>
            <span className="d" />controls
          </button>
        </nav>
      </header>

      <div className="os__shell">
        <aside className="dialogue" data-testid="conversation-margin">
          <div className="dialogue__h">conversation</div>
          <div className="dialogue__log" id="log" ref={logRef}>
            {turns.map((turn) => (
              <div key={turn.id} className={`dturn dturn--${turn.role}`}>
                <div className="dturn__who">
                  {turn.role === "you" ? "you" : <><span className="gl">⟡</span> Active Mirror</>}
                </div>
                <div className="dturn__text" data-text>
                  {turn.role === "am" && !turn.text ? <span className="dots"><i>.</i><i>.</i><i>.</i></span> : turn.text}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="stage" id="stage" data-testid="work-os-stage">
          <MobileControlStrip memoryMode={memoryMode} seedState={seedState} onSeed={importSampleSeed} onOpenSheet={setSheet} />
          {artifact ? <Workpiece artifact={artifact} memoryMode={memoryMode} seedState={seedState} onOpenSheet={setSheet} /> : <EmptyStage memoryMode={memoryMode} seedState={seedState} onStarter={send} onSeed={importSampleSeed} />}
        </section>

        <div className="composer">
          <div className="path" id="path" data-testid="solution-path">
            <span className={`path__ticks${delivered ? " done" : ""}`}>
              {Array.from({ length: 10 }, (_, index) => (
                <i key={index} className={index < Math.min(userTurns, 10) ? "on" : ""} />
              ))}
            </span>
            <span className="path__lbl">{pathLabel}</span>
          </div>
          <div className="composer__field">
            <textarea
              className="composer__input"
              id="cap-input"
              ref={inputRef}
              rows={1}
              placeholder="Tell me what we're making..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              autoComplete="off"
              disabled={busy}
            />
            <button className="composer__send" id="cap-send" title="Send" aria-label="Send" disabled={busy || !input.trim()} onClick={submit}>
              →
            </button>
          </div>
        </div>
      </div>

      <div className={`scrim${sheet ? " show" : ""}`} id="scrim" onClick={() => setSheet(null)} />
      <aside className={`sheet${sheet ? " show" : ""}`} id="sheet" aria-live="polite" data-testid={sheet ? `${sheet}-sheet` : undefined}>
        {sheetContent ? (
          <>
            <div className="sheet__grab" />
            <div className="sheet__head">
              <div>
                <div className="sheet__ttl">{sheetContent.title}</div>
                {sheetContent.binds ? <BindLine route={sheetContent.binds[0]} schema={sheetContent.binds[1]} /> : null}
              </div>
              <button className="sheet__x" id="sheet-x" aria-label="Close" onClick={() => setSheet(null)}>×</button>
            </div>
            <div className="sheet__body">
              <div className="sheet__claim"><span className="gl">⟡</span> {sheetContent.claim}</div>
              {sheetContent.body}
            </div>
          </>
        ) : null}
      </aside>
    </main>
  );
}

function MobileControlStrip({ memoryMode, seedState, onSeed, onOpenSheet }: { memoryMode: MemoryMode; seedState: "none" | "sample"; onSeed: () => void; onOpenSheet: (sheet: SheetId) => void }) {
  return (
    <div className="mobile-controls" data-testid="mobile-control-strip">
      <button className="mobile-chip is-on" onClick={() => onOpenSheet("memory")}>
        <span className="d ok" />{MEMORY_MODE_LABEL[memoryMode]}
      </button>
      <button className={seedState === "sample" ? "mobile-chip is-on" : "mobile-chip"} onClick={onSeed}>
        <span className="d" />{seedState === "sample" ? "sample run" : "sample"}
      </button>
      <button className="mobile-chip" onClick={() => onOpenSheet("ledger")}><span className="d ok" />evidence</button>
      <button className="mobile-chip" onClick={() => onOpenSheet("routing")}><span className="d warn" />route</button>
      <button className="mobile-chip" onClick={() => onOpenSheet("runtime")}><span className="d" />controls</button>
    </div>
  );
}

function EmptyStage({ memoryMode, seedState, onStarter, onSeed }: { memoryMode: MemoryMode; seedState: "none" | "sample"; onStarter: (value: string) => void; onSeed: () => void }) {
  return (
    <div className="empty">
      <div className="empty__mark">⟡</div>
      <div className="empty__line">What are we making?</div>
      <div className="empty__sub">Tell me the goal. I&apos;ll ask only what I need, then build the real thing here — and refine it as we talk.</div>
      <div className="memory-note" data-testid="memory-mode">
        <span className="d ok" />Memory mode: <b>{MEMORY_MODE_LABEL[memoryMode]}</b>
      </div>
      <button className={seedState === "sample" ? "seed-import is-on" : "seed-import"} data-testid="seed-import" onClick={onSeed}>
        {seedState === "sample" ? "Sample context loaded for this run" : "Import sample context"}
        <span>{seedState === "sample" ? "this run only · no private context" : "run-local public sample"}</span>
      </button>
      <div className="starters">
        {STARTERS.map((starter) => (
          <button key={starter} className="starter" onClick={() => onStarter(starter)}>
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
}

function Workpiece({ artifact, memoryMode, seedState, onOpenSheet }: { artifact: WorkArtifact; memoryMode: MemoryMode; seedState: "none" | "sample"; onOpenSheet: (sheet: SheetId) => void }) {
  const [approved, setApproved] = useState(false);
  const assumptions = artifact.assumptions || [];
  const unknowns = artifact.unknowns || [];

  return (
    <div className="work refresh" data-testid="workpiece">
      <div className="work__top">
        <span className="work__type">{artifact.type || "draft"}</span>
        <span className="work__title" data-testid="workpiece-title">{artifact.title || "Draft"}</span>
      </div>
      <p className="work__summary">{artifact.summary}</p>
      {artifact.blocks.map((block) => <ArtifactBlockView key={`${block.heading}-${block.type}`} block={block} />)}
      <div className="work__foot">
        <button className="proofbtn" data-testid="memory-state" onClick={() => onOpenSheet("memory")}>
          <span className="d ok" />memory · {MEMORY_MODE_LABEL[memoryMode]}
        </button>
        <span className={seedState === "sample" ? "fnote fnote--seed on" : "fnote fnote--seed"} data-testid="seed-state">
          <span className="fk assume">context</span> {seedState === "sample" ? "sample loaded for this run · no private context" : "not imported"}
        </span>
        <span className="fnote"><span className="fk gap">actions</span> files, browser, sends, and devices still require approval</span>
        <button className="proofbtn" data-sheet="ledger" onClick={() => onOpenSheet("ledger")}>
          <span className={`d${unknowns.length ? " warn" : ""}`} />evidence{assumptions.length ? ` · ${assumptions.length} assumed` : ""}{unknowns.length ? ` · ${unknowns.length} open` : ""}
        </button>
        {assumptions.length ? <span className="fnote"><span className="fk assume">assumed</span> {assumptions.join(" · ")}</span> : null}
        {unknowns.length ? <span className="fnote"><span className="fk gap">open</span> {unknowns.join(" · ")}</span> : null}
        {artifact.nextAction ? (
          <button
            className={`nextbtn na-btn${approved ? " done" : ""}`}
            data-testid="next-action"
            onClick={() => {
              setApproved(true);
              onOpenSheet("ledger");
            }}
          >
            {approved ? "✓ approved" : `${artifact.nextAction} — needs approval`}
          </button>
        ) : null}
      </div>
      <ProofSprintHandoff />
    </div>
  );
}

function ProofSprintHandoff() {
  return (
    <div className="sprint-handoff" data-testid="proof-sprint-handoff">
      <div>
        <div className="sprint-handoff__eyebrow">business handoff</div>
        <div className="sprint-handoff__title">Need this working for your team?</div>
        <p>
          Use the workspace as the starting point for a 72-hour proof sprint. Send the workflow, owner,
          proof target, and deployment boundary when you are ready.
        </p>
      </div>
      <div className="sprint-handoff__actions">
        <a className="sprint-handoff__cta" data-analytics="workspace_72h_sprint" href="/intake?focus=workspace-proof">
          Apply for a 72-hour sprint
        </a>
        <span>No prompt or artifact text is sent in the link.</span>
      </div>
    </div>
  );
}

function ArtifactBlockView({ block }: { block: ArtifactBlock }) {
  if (block.type === "fields") {
    return (
      <div className="block">
        <div className="block__h">{block.heading}</div>
        <div className="fields">
          {block.items.map((item) => {
            const parts = item.split(/ — | - |: /);
            return (
              <div key={item} className="fld">
                <span className="fk">{parts[0]}</span>
                <span className="fv">{parts.slice(1).join(" ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const List = block.type === "steps" ? "ol" : "ul";
  const className = block.type === "checklist" ? "checklist" : block.type === "steps" ? "steps" : "alist";
  return (
    <div className="block">
      <div className="block__h">{block.heading}</div>
      <List className={className}>
        {block.items.map((item) => <li key={item}>{item}</li>)}
      </List>
    </div>
  );
}

function BindLine({ route, schema }: { route: string; schema: string }) {
  return (
    <div className="sheet__binds">
      binds · <b>{route}</b><br />
      schema · <b>{schema}</b>
    </div>
  );
}

function buildSheet(id: SheetId, runtime: RuntimeState, memoryMode: MemoryMode, seedState: "none" | "sample") {
  if (id === "routing") return routingSheet(runtime.modelHealth);
  if (id === "memory") return memorySheet(memoryMode, seedState);
  if (id === "runtime") return runtimeSheet(runtime);
  if (id === "ledger") return ledgerSheet(runtime.ledger);
  if (id === "revocation") return revocationSheet(runtime.revocation);
  if (id === "continuity") return continuitySheet(runtime.continuity);
  if (id === "critique") return critiqueSheet(runtime.critique);
  if (id === "ratchet") return ratchetSheet(runtime.ratchet);
  if (id === "operator") return localOperatorSheet(runtime.operator);
  return kernelSheet(runtime.kernel);
}

function memorySheet(memoryMode: MemoryMode, seedState: "none" | "sample") {
  return {
    title: "Memory",
    binds: ["policy", "ephemeral by default"] as [string, string],
    claim: "Working memory starts in RAM/request scope. Nothing becomes saved context unless the user explicitly promotes it.",
    body: (
      <>
        <div className="memory-mode-card">
          <span>current mode</span>
          <b>{MEMORY_MODE_LABEL[memoryMode]}</b>
          <p>Prompts, drafts, artifacts, and sample context are held only for this visible run unless a later approval promotes them.</p>
        </div>
        <div className="sectlabel">memory classes</div>
        <div className="rt-row">
          <div className="rt-row__top"><span className="rt-row__nm">Ephemeral scratch</span><span className="rt-row__st st-ok"><span className="d" />active</span></div>
          <div className="rt-row__sub">React state and request scope. Cleared by reload, tab close, process restart, or reset.</div>
        </div>
        <div className="rt-row">
          <div className="rt-row__top"><span className="rt-row__nm">Session memory</span><span className="rt-row__st st-warn"><span className="d" />reserved</span></div>
          <div className="rt-row__sub">Would stay in browser session only. Not used unless a session-only mode is selected.</div>
        </div>
        <div className="rt-row">
          <div className="rt-row__top"><span className="rt-row__nm">Saved context</span><span className="rt-row__st st-warn"><span className="d" />approval required</span></div>
          <div className="rt-row__sub">Durable memory requires explicit promotion, source, and removal path.</div>
        </div>
        <div className="rt-row">
          <div className="rt-row__top"><span className="rt-row__nm">Sample context</span><span className={`rt-row__st st-${seedState === "sample" ? "ok" : "off"}`}><span className="d" />{seedState === "sample" ? "this run" : "not loaded"}</span></div>
          <div className="rt-row__sub">The public sample is not written to localStorage or saved memory.</div>
        </div>
        <Shape label="MemoryMode" code={'{ mode: "ephemeral"|"session"|"saved",\\n  writePolicy: "promote_only_after_approval",\\n  defaultStorage: "ram_and_request_scope" }'} />
      </>
    ),
  };
}

function modelHealthTone(status: ModelProviderHealth["status"]) {
  if (status === "healthy") return "ok";
  if (status === "degraded" || status === "configured_disabled" || status === "configured_unchecked" || status === "gated") return "warn";
  return "off";
}

function modelHealthLabel(provider: ModelProviderHealth) {
  if (provider.status === "healthy") return "healthy";
  if (provider.status === "degraded") return provider.lastErrorClass || "degraded";
  if (provider.status === "configured_unchecked") return "configured";
  if (provider.status === "configured_disabled") return provider.wired ? "disabled" : "not wired";
  if (provider.status === "gated") return "gated";
  return "not configured";
}

function fallbackModelHealth(): ModelHealth {
  return {
    schemaVersion: "active_mirror.model_health.v1",
    generatedAt: "",
    claimBoundary: "Model health is loading. This panel does not expose secrets or private prompts.",
    activePublicOrder: [],
    sensitiveRoute: "local · gated",
    providers: [
      {
        id: "openai",
        label: "OpenAI",
        role: "primary public workhorse",
        modelId: "gpt-4.1-mini",
        status: "configured_unchecked",
        secretState: "present",
        routeUse: "first hosted route for public Work OS turns",
        enabled: true,
        wired: true,
        lastObservedAt: null,
        lastErrorClass: null,
        publicMessage: "Provider health is loading.",
      },
      {
        id: "anthropic",
        label: "Anthropic",
        role: "wired quality lane",
        modelId: "claude-sonnet-4-5",
        status: "configured_disabled",
        secretState: "present",
        routeUse: "disabled until usage limit and key health are confirmed",
        enabled: false,
        wired: true,
        lastObservedAt: null,
        lastErrorClass: null,
        publicMessage: "This provider is wired, but disabled by route policy.",
      },
      {
        id: "gemini",
        label: "Gemini",
        role: "wired but disabled lane",
        modelId: "gemini-2.5-flash",
        status: "configured_disabled",
        secretState: "present",
        routeUse: "disabled until key rotation and explicit re-admission",
        enabled: false,
        wired: true,
        lastObservedAt: null,
        lastErrorClass: null,
        publicMessage: "This provider is wired, but disabled by route policy.",
      },
      {
        id: "local",
        label: "Local gated route",
        role: "sensitive/private boundary",
        modelId: null,
        status: "gated",
        secretState: "not_required",
        routeUse: "selected for private, device, vault, account, or local-only work",
        enabled: true,
        wired: true,
        lastObservedAt: null,
        lastErrorClass: null,
        publicMessage: "Private body execution is separate from the public site.",
      },
    ],
  };
}

function routingSheet(modelHealth: ModelHealth | null) {
  const health = modelHealth || fallbackModelHealth();
  return {
    title: "Routing",
    binds: ["GET /api/mirror/model-health", health.schemaVersion] as [string, string],
    claim: health.claimBoundary,
    body: (
      <>
        <div className="sectlabel">provider health</div>
        {health.providers.map((provider) => (
          <div key={provider.id} className="rt-row" data-testid={`model-provider-${provider.id}`}>
            <div className="rt-row__top">
              <span className="rt-row__nm">{provider.label}</span>
              <span className={`rt-row__st st-${modelHealthTone(provider.status)}`}><span className="d" />{modelHealthLabel(provider)}</span>
            </div>
            <div className="rt-row__sub">
              {provider.role} · {provider.routeUse}
              {provider.modelId ? ` · ${provider.modelId}` : ""}
              {provider.lastObservedAt ? ` · observed ${new Date(provider.lastObservedAt).toLocaleTimeString()}` : ""}
            </div>
            <p className="sheet-copy">{provider.publicMessage}</p>
          </div>
        ))}
        <div className="sectlabel">rule</div>
        <p className="sheet-copy">
          Public work tries the configured hosted route order: <b>{health.activePublicOrder.join(" → ") || "no hosted route configured"}</b>.
          Sensitive work stays on <b>{health.sensitiveRoute}</b> until a private route is approved.
        </p>
      </>
    ),
  };
}

function runtimeSheet(runtime: RuntimeState) {
  const registry = runtime.registry;
  const contracts = registry?.contracts || [];
  return {
    title: "Controls",
    binds: ["GET /api/mirror/contracts", registry?.schemaVersion || "active_mirror.contract_registry.v1"] as [string, string],
    claim: "Every deliverable can show its sources, evidence, and approval boundary. You do not have to inspect this panel to use the product.",
    body: (
      <>
        <div className="sectlabel">live controls</div>
        <button className="rt-row" data-testid="mirrorkernel-proof" onClick={() => document.dispatchEvent(new CustomEvent("am:open-sheet", { detail: "kernel" }))}>
          <div className="rt-row__top"><span className="rt-row__nm">Identity controls</span><span className={`rt-row__st st-${stateTone(runtime.kernel?.state)}`}><span className="d" />{runtime.kernel?.state || "offline"}</span></div>
          <div className="rt-row__sub">public review packet</div>
        </button>
        <button className="rt-row" data-testid="mirror-ratchet-proof" onClick={() => document.dispatchEvent(new CustomEvent("am:open-sheet", { detail: "ratchet" }))}>
          <div className="rt-row__top">
            <span className="rt-row__nm">Reliability checks</span>
            <span className="rt-row__st st-ok"><span className="d" />{runtime.ratchet?.score.passing || 0}/{runtime.ratchet?.score.total || 0} · {runtime.ratchet?.score.coveragePct || 0}%</span>
          </div>
          <div className="rt-row__sub">controlled truth, not a raw IQ claim</div>
        </button>
        {contracts.map((contract) => (
          <button
            key={contract.id}
            className="rt-row"
            data-testid={
              contract.id === "proof_ledger_export"
                ? "mirror-sovereign-contracts"
                : contract.id === "local_operator_packet"
                  ? "local-operator-contract"
                  : undefined
            }
            onClick={() => document.dispatchEvent(new CustomEvent("am:open-sheet", { detail: contractSheetId(contract.id) }))}
          >
            <div className="rt-row__top">
              <span className="rt-row__nm">{contractSurfaceLabel(contract)}</span>
              <span className={`rt-row__st st-${contract.status === "public_contract_ready" ? "ok" : "warn"}`}><span className="d" />{contract.status === "public_contract_ready" ? "ready" : "record required"}</span>
            </div>
            <div className="rt-row__sub">{contract.route}</div>
          </button>
        ))}
      </>
    ),
  };
}

function localOperatorSheet(operator: LocalOperatorStatus | null) {
  const packet = operator?.samplePacket;
  return {
    title: "Local operator",
    binds: ["GET/POST /api/mirror/local-operator", operator?.responseSchemaVersion || "active_mirror.local_operator_packet.v1"] as [string, string],
    claim: operator?.claimBoundary || "Approved context compiles into scoped packets. Raw vault text stays off the public route.",
    body: (
      <>
        <div className="operator-card" data-testid="local-operator-proof">
          <div>
            <span>operator</span>
            <b>deterministic policy</b>
            <p>Records become task packets only when approval, privacy, canon, and provenance checks pass.</p>
          </div>
          <div className={`pl__v ${stateTone(packet?.state)} sheet-state`}><span className="d" />{packet?.state || "offline"}</div>
        </div>
        <div className="pl__v warn sheet-state"><span className="d" />private vault ingest · {packet?.privateVaultIngest.state.replaceAll("_", " ") || "private body required"}</div>
        <div className="operator-metrics">
          <span>supplied <b>{packet?.records.supplied || 0}</b></span>
          <span>eligible <b>{packet?.records.eligible || 0}</b></span>
          <span>selected <b>{packet?.records.selected.length || 0}</b></span>
          <span>rejected <b>{packet?.records.rejected.length || 0}</b></span>
        </div>
        <div className="sectlabel">selected records</div>
        {(packet?.records.selected || []).map((record) => (
          <div key={record.id} className="operator-record">
            <div><span>{record.kind}</span><b>{record.title}</b><i>{record.use}</i></div>
            <p>{record.id} · relevance {record.relevance.toFixed(2)}</p>
            <code>{record.sourceHash}</code>
          </div>
        ))}
        <div className="sectlabel">rejected records</div>
        {(packet?.records.rejected || []).map((record) => (
          <div key={record.id} className="pl__v off sheet-state"><span className="d" />{record.title} · {record.reason.replaceAll("_", " ")}</div>
        ))}
        <div className="sectlabel">skill rails</div>
        {(packet?.skillRails || []).map((skill) => (
          <div key={skill.id} className="operator-skill">
            <span>{skill.id}</span>
            <b>{skill.role}</b>
            <i>{skill.state.replaceAll("_", " ")}</i>
          </div>
        ))}
        <div className="sectlabel">task packet</div>
        <div className="operator-receipt">
          <span>context · {packet?.taskPacket.contextEnvelope || "selected record ids only"}</span>
          <span>model · {packet?.taskPacket.modelVisibility || "scoped public safe records"}</span>
          <span>next · {packet?.taskPacket?.nextGate.replaceAll("_", " ") || "approval required"}</span>
          <span>packet · {packet?.receipt.packetHash || "queued"}</span>
        </div>
        {(packet?.task.sourceGaps || ["live_vault_ingest_not_run"]).map((gap) => (
          <div key={gap} className="pl__v warn sheet-state"><span className="d" />source gap · {gap.replaceAll("_", " ")}</div>
        ))}
        <Shape label="LocalOperatorPacket" code={"{ records -> eligibility gate -> selectedRecordIds,\n  taskPacket, didNotRun, packetHash, nextGate }"} />
      </>
    ),
  };
}

function ledgerSheet(ledger: ProofLedger | null) {
  return {
    title: "Evidence",
    binds: ["GET /api/mirror/proof-ledger", ledger?.schemaVersion || "active_mirror.proof_ledger_export.v1"] as [string, string],
    claim: ledger?.claimBoundary || "Your evidence record is exportable and reviewable — not a vendor audit log.",
    body: (
      <>
        <div className="ledger-meta">
          <span>owner · <b>{ledger?.owner || "user"}</b></span>
          <span>chainHead · {ledger?.chainHead || "queued"}</span>
          <span>export · {(ledger?.exportFormats || ["json", "markdown"]).join(" · ")}</span>
        </div>
        {(ledger?.entries || []).map((entry) => (
          <div key={entry.id} className="ledger-row">
            <span className="ledger-index">#{entry.index}</span>
            <span className="ledger-kind">{entry.kind}</span>
            <span className={`pl__v ${stateTone(entry.state)}`}><span className="d" />{entry.state}</span>
            <span className="ledger-statement">{entry.statement}</span>
            <span className="ledger-source">{entry.source} · {entry.hash}</span>
          </div>
        ))}
        <div className="sectlabel">queued private events</div>
        {(ledger?.queuedPrivateEvents || ["private context writeback", "signed work-record attach"]).map((event) => (
          <div key={event} className="pl__v off sheet-state"><span className="d" />{event} · queued</div>
        ))}
        <Shape label="ProofLedgerEntry" code={"{ index, id, kind, statement,\n  state: proven|available|missing|queued|gated,\n  source, previousHash, hash }"} />
      </>
    ),
  };
}

function revocationSheet(revocation: RevocationCascade | null) {
  const displayToken = (value: string | undefined, fallback: string) => (value || fallback).replaceAll("_", " ");

  return {
    title: "Removal effects",
    binds: ["GET /api/mirror/revocation-cascade", revocation?.schemaVersion || "active_mirror.revocation_cascade.v1"] as [string, string],
    claim: revocation?.claimBoundary || "The public page can show the removal plan; the actual downstream rewrite runs only where the private work lives.",
    body: (
      <>
        <div className="sectlabel">remove → downstream → record</div>
        {(revocation?.events || []).map((event) => (
          <div key={event.sequence} className="cascade-card">
            <div className="cascade-top"><span>#{event.sequence}</span><span className={`pl__v ${stateTone(event.state)}`}><span className="d" />{event.state}</span></div>
            <div className="cascade-revoke"><span>revoke</span> · {event.revoke}</div>
            <div className="cascade-effect">↳ {event.downstreamEffect}</div>
            <div className="cascade-receipt">record required · {displayToken(event.receiptRequired, "work record")}</div>
          </div>
        ))}
        <div className="pl__v off sheet-state"><span className="d" />private enforcement · {displayToken(revocation?.privateEnforcement, "private runner required")} (approval boundary, not error)</div>
        <Shape label="RemovalEffectEvent" code={"{ sequence, remove, downstreamEffect,\n  state, requiredRecord }"} />
      </>
    ),
  };
}

function continuitySheet(continuity: ContinuityMeasure | null) {
  const vector = continuity?.vectorDelta || [];
  return {
    title: "Continuity score",
    binds: ["POST /api/mirror/identity-continuity/measure", continuity?.schemaVersion || "active_mirror.identity_continuity_measure.v1"] as [string, string],
    claim: continuity?.claimBoundary || "Public-safe preview only; a signed model-change record is required to trust private continuity.",
    body: (
      <>
        <div className="continuity-score">
          <div>
            <div className="score-label">continuityScore</div>
            <div className="score-value">{(continuity?.continuityScore || 0).toFixed(3)}</div>
          </div>
          <div className="score-drift">
            <div className="score-label">drift</div>
            <div className="score-drift-value">{(continuity?.drift || 0).toFixed(3)}</div>
          </div>
        </div>
        <div className="route-pair">{continuity?.beforeModel || "hosted model"} → {continuity?.afterModel || "reviewed route"}</div>
        <div className="pl__v warn sheet-state"><span className="d" />record state · {(continuity?.receiptState || "unsigned_public_preview").replaceAll("_", " ")}</div>
        <div className="pl__v off sheet-state"><span className="d" />required record · {(continuity?.requiredReceipt || "signed_model_change_record").replaceAll("_", " ")}</div>
        <div className="sectlabel">vectorDelta · explainable</div>
        {vector.map((item) => (
          <div key={item.id} className="vector-row">
            <span>{item.label}</span>
            <span>{item.before.toFixed(2)}→{item.after.toFixed(2)}</span>
            <span className={item.delta < -0.05 ? "delta-warn" : "delta-ok"}>Δ{item.delta.toFixed(2)}</span>
            <div><div style={{ width: `${Math.round(item.stability * 100)}%` }} /></div>
          </div>
        ))}
        <Shape label="ContinuityDelta" code={"{ id, label, before, after, delta, stability, weight }"} />
      </>
    ),
  };
}

function critiqueSheet(critique: CritiqueStream | null) {
  return {
    title: "Decision critique",
    binds: ["GET /api/mirror/critique?format=ndjson", critique?.schemaVersion || "active_mirror.decision_critique_stream.v1"] as [string, string],
    claim: critique?.claimBoundary || "The system reports its own decisions and rule violations, redacted of private paths.",
    body: (
      <>
        <div className="sectlabel">the system reports on itself</div>
        {(critique?.events || []).map((event) => (
          <div key={event.id} className={`critique-card critique-${event.state}`}>
            <div className="critique-top"><span className="pl__v"><span className="d" />{event.state}</span><span>{event.id}</span></div>
            <div className="critique-admission">{event.systemAdmission}</div>
            <div className="critique-line">control · {event.activeControl}</div>
            <div className="critique-line">evidence · {event.publicEvidence}</div>
            <div className="critique-next"><span>next safe step</span> · {event.nextSafeStep}</div>
          </div>
        ))}
        {(critique?.queuedPrivateEvents || ["live SSE private decision stream"]).map((event) => (
          <div key={event} className="pl__v off sheet-state"><span className="d" />{event} · queued</div>
        ))}
        <Shape label="DecisionCritiqueEvent" code={"{ sequence, id, state,\n  systemAdmission, activeControl,\n  publicEvidence, nextSafeStep }"} />
      </>
    ),
  };
}

function ratchetSheet(ratchet: RatchetStatus | null) {
  return {
    title: "Reliability checks",
    binds: ["GET /api/mirror/ratchet", ratchet?.version || "2026.06.09-mirror-ratchet-v5"] as [string, string],
    claim: ratchet?.claimBoundary || "Controlled truth, source trail, approval, and generation checks — not a raw IQ claim.",
    body: (
      <>
        <div className="ratchet-score"><div>{ratchet?.score.passing || 0}/{ratchet?.score.total || 0}</div><span>{ratchet?.score.coveragePct || 0}% · monotonic · target {ratchet?.targetPasses || 1000}</span></div>
        <div className="sectlabel">hosted-model failure coverage</div>
        {(ratchet?.checks || []).map((check) => (
          <div key={check.id} className="ratchet-check">
            <div><span>{check.label}</span><span className={`pl__v ${stateTone(check.state)}`}><span className="d" />{check.state}</span></div>
            <p><span>hosted model</span> · {check.frontierFailure}</p>
            <p><span>control</span> · {check.activeMirrorControl}</p>
          </div>
        ))}
        <Shape label="ReliabilityCheck[]" code={"{ id, label, state,\n  hostedModelFailure, activeMirrorControl }"} />
      </>
    ),
  };
}

function kernelSheet(kernel: KernelStatus | null) {
  const controls = kernel?.controlPlane || [];
  return {
    title: "Identity controls",
    binds: ["GET /api/mirror/kernel", kernel?.version || "2026.06.09-mirrorkernel-identity-score-v6"] as [string, string],
    claim: kernel?.publicClaim || kernel?.claimBoundary || "The public route receives a redacted review packet; private machine truth stays unavailable unless approved.",
    body: (
      <>
        <div className={`pl__v ${stateTone(kernel?.state)} sheet-state`}><span className="d" />state · {kernel?.state || "offline"}</div>
        <div className={`pl__v ${stateTone(capabilityStatus(kernel))} sheet-state`}><span className="d" />capabilityKernel · {capabilityStatus(kernel)}</div>
        <div className="sectlabel">control layer</div>
        {controls.map((control) => (
          <div key={control.label} className="kernel-control">{control.label} · {control.state || "enforced"}</div>
        ))}
        <p className="sheet-copy">Fresh private machine truth is unavailable on this public route. The public surface can still build a workspace, but private execution needs a signed record.</p>
      </>
    ),
  };
}

function Shape({ label, code }: { label: string; code: string }) {
  return (
    <details className="shape">
      <summary>prop shape · {label}</summary>
      <pre>{code}</pre>
    </details>
  );
}

function OpenSheetBridge({ onOpen }: { onOpen: (sheet: SheetId) => void }) {
  useEffect(() => {
    function onEvent(event: Event) {
      const custom = event as CustomEvent<SheetId>;
      onOpen(custom.detail);
    }
    document.addEventListener("am:open-sheet", onEvent);
    return () => document.removeEventListener("am:open-sheet", onEvent);
  }, [onOpen]);
  return null;
}
