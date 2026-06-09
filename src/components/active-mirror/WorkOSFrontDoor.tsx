"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type RuntimeState = {
  registry: ContractRegistry | null;
  kernel: KernelStatus | null;
  ratchet: RatchetStatus | null;
  ledger: ProofLedger | null;
  revocation: RevocationCascade | null;
  continuity: ContinuityMeasure | null;
  critique: CritiqueStream | null;
};

type SheetId =
  | "routing"
  | "runtime"
  | "ledger"
  | "revocation"
  | "continuity"
  | "critique"
  | "ratchet"
  | "kernel";

const STARTERS = [
  "Outline a deck for next week's meeting",
  "Turn a messy request into a plan",
  "Draft an email I've been avoiding",
  "Think through a decision with me",
];

function makeId() {
  return `r_${Math.random().toString(16).slice(2, 8)}`;
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
  if (/(ready|available|passing|proven|computed|signed|online|active|ok)/i.test(state)) return "ok";
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
  return "runtime";
}

function contractSurfaceLabel(contract: RuntimeContract) {
  if (contract.id === "decision_critique_stream") return "Decision critique";
  if (contract.id === "proof_ledger_export") return "Receipt-chain export";
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
  const [runtime, setRuntime] = useState<RuntimeState>({
    registry: null,
    kernel: null,
    ratchet: null,
    ledger: null,
    revocation: null,
    continuity: null,
    critique: null,
  });
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => null);
    }
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
    ]).then(([registry, kernel, ratchet, ledger, revocation, continuity, critique]) => {
      if (cancelled) return;
      setRuntime({ registry, kernel, ratchet, ledger, revocation, continuity, critique });
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
          }
        }
      }
    } catch {
      appendAssistantText(assistantId, "Tell me a little more — what's the goal, and who's it for? Even a sentence lets me draft something useful.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [appendAssistantText, artifact, busy, turns, userTurns]);

  const submit = useCallback(() => {
    void send(input);
  }, [input, send]);

  const sheetContent = useMemo(() => (sheet ? buildSheet(sheet, runtime) : null), [runtime, sheet]);

  return (
    <main className="os">
      <OpenSheetBridge onOpen={setSheet} />
      <header className="os__top">
        <div className="os__brand"><span className="gl">⟡</span><b>Active Mirror</b></div>
        <nav className="os__nav">
          <button className="route" id="route-btn" data-testid="route-btn" title="Intelligence is routed; identity stays local" onClick={() => setSheet("routing")}>
            <span className="route__k">routed</span>
            <span className="route__v" id="route-v">{routeLabel}</span>
          </button>
          <a className="os__about" href="/about">the thesis</a>
          <button className="os__runtime" id="runtime-btn" data-testid="runtime-btn" onClick={() => setSheet("runtime")}>
            <span className="d" />runtime
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
          {artifact ? <Workpiece artifact={artifact} onOpenSheet={setSheet} /> : <EmptyStage onStarter={send} />}
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

function EmptyStage({ onStarter }: { onStarter: (value: string) => void }) {
  return (
    <div className="empty">
      <div className="empty__mark">⟡</div>
      <div className="empty__line">What are we making?</div>
      <div className="empty__sub">Tell me the goal. I&apos;ll ask only what I need, then build the real thing here — and refine it as we talk.</div>
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

function Workpiece({ artifact, onOpenSheet }: { artifact: WorkArtifact; onOpenSheet: (sheet: SheetId) => void }) {
  const [approved, setApproved] = useState(false);
  const assumptions = artifact.assumptions || [];
  const unknowns = artifact.unknowns || [];

  return (
    <div className="work refresh" data-testid="workpiece">
      <div className="work__top">
        <span className="work__type">{artifact.type || "draft"}</span>
        <span className="work__title">{artifact.title || "Draft"}</span>
      </div>
      <p className="work__summary">{artifact.summary}</p>
      {artifact.blocks.map((block) => <ArtifactBlockView key={`${block.heading}-${block.type}`} block={block} />)}
      <div className="work__foot">
        <button className="proofbtn" data-sheet="ledger" onClick={() => onOpenSheet("ledger")}>
          <span className={`d${unknowns.length ? " warn" : ""}`} />proof{assumptions.length ? ` · ${assumptions.length} assumed` : ""}{unknowns.length ? ` · ${unknowns.length} open` : ""}
        </button>
        {assumptions.length ? <span className="fnote"><span className="fk assume">assumed</span>{assumptions.join(" · ")}</span> : null}
        {unknowns.length ? <span className="fnote"><span className="fk gap">open</span>{unknowns.join(" · ")}</span> : null}
        {artifact.nextAction ? (
          <button
            className={`nextbtn na-btn${approved ? " done" : ""}`}
            onClick={() => {
              setApproved(true);
              onOpenSheet("ledger");
            }}
          >
            {approved ? "✓ approved" : `${artifact.nextAction} — needs approval`}
          </button>
        ) : null}
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

function buildSheet(id: SheetId, runtime: RuntimeState) {
  if (id === "routing") return routingSheet();
  if (id === "runtime") return runtimeSheet(runtime);
  if (id === "ledger") return ledgerSheet(runtime.ledger);
  if (id === "revocation") return revocationSheet(runtime.revocation);
  if (id === "continuity") return continuitySheet(runtime.continuity);
  if (id === "critique") return critiqueSheet(runtime.critique);
  if (id === "ratchet") return ratchetSheet(runtime.ratchet);
  return kernelSheet(runtime.kernel);
}

function routingSheet() {
  const rows = [
    ["gemini · flash", "workhorse · fast", "ok", "high-volume turns, first drafts"],
    ["claude · sonnet/opus", "workhorse · quality", "ok", "hard tasks, the real deliverable"],
    ["openai", "workhorse · fallback", "ok", "failover and specific strengths"],
    ["sarvam · sovereign", "reserved", "warn", "Indian languages · sovereign demo"],
    ["local · ollama", "reserved", "warn", "sensitive data that must not leave the box"],
  ];
  return {
    title: "Routing",
    binds: ["policy", "intelligence routed · identity local"] as [string, string],
    claim: "Intelligence is rented; identity is local. The model is routed to whatever is fastest under the gate — including sovereign models when the data demands it. The gate, memory, provenance, and proof always run locally, whichever model answered.",
    body: (
      <>
        <div className="sectlabel">model lanes</div>
        {rows.map(([name, status, tone, detail]) => (
          <div key={name} className="rt-row">
            <div className="rt-row__top">
              <span className="rt-row__nm">{name}</span>
              <span className={`rt-row__st st-${tone}`}><span className="d" />{status}</span>
            </div>
            <div className="rt-row__sub">{detail}</div>
          </div>
        ))}
        <div className="sectlabel">rule</div>
        <p className="sheet-copy">If the task touches private or sensitive data, route local or sovereign. Otherwise use a frontier workhorse. Continuity is scored across every swap so it stays you.</p>
      </>
    ),
  };
}

function runtimeSheet(runtime: RuntimeState) {
  const registry = runtime.registry;
  const contracts = registry?.contracts || [];
  return {
    title: "Runtime",
    binds: ["GET /api/mirror/contracts", registry?.schemaVersion || "active_mirror.contract_registry.v1"] as [string, string],
    claim: "The trust layer is here when you want it — every deliverable can show its source, proof, and what stays gated. You never have to look at it to use the product.",
    body: (
      <>
        <div className="sectlabel">live contracts</div>
        <button className="rt-row" data-testid="mirrorkernel-proof" onClick={() => document.dispatchEvent(new CustomEvent("am:open-sheet", { detail: "kernel" }))}>
          <div className="rt-row__top"><span className="rt-row__nm">MirrorKernel</span><span className={`rt-row__st st-${stateTone(runtime.kernel?.state)}`}><span className="d" />{runtime.kernel?.state || "body_unavailable"}</span></div>
          <div className="rt-row__sub">{runtime.kernel?.version || "2026.06.09-mirrorkernel-identity-score-v6"}</div>
        </button>
        <button className="rt-row" data-testid="mirror-ratchet-proof" onClick={() => document.dispatchEvent(new CustomEvent("am:open-sheet", { detail: "ratchet" }))}>
          <div className="rt-row__top">
            <span className="rt-row__nm">Trust ratchet</span>
            <span className="rt-row__st st-ok"><span className="d" />{runtime.ratchet?.score.passing || 0}/{runtime.ratchet?.score.total || 0} · {runtime.ratchet?.score.coveragePct || 0}%</span>
          </div>
          <div className="rt-row__sub">monotonic · controlled truth, not a raw IQ claim</div>
        </button>
        {contracts.map((contract) => (
          <button key={contract.id} className="rt-row" data-testid={contract.id === "proof_ledger_export" ? "mirror-sovereign-contracts" : undefined} onClick={() => document.dispatchEvent(new CustomEvent("am:open-sheet", { detail: contractSheetId(contract.id) }))}>
            <div className="rt-row__top">
              <span className="rt-row__nm">{contractSurfaceLabel(contract)}</span>
              <span className={`rt-row__st st-${contract.status === "public_contract_ready" ? "ok" : "warn"}`}><span className="d" />{contract.status === "public_contract_ready" ? "ready" : "receipt required"}</span>
            </div>
            <div className="rt-row__sub">{contract.route}</div>
          </button>
        ))}
      </>
    ),
  };
}

function ledgerSheet(ledger: ProofLedger | null) {
  return {
    title: "Proof",
    binds: ["GET /api/mirror/proof-ledger", ledger?.schemaVersion || "active_mirror.proof_ledger_export.v1"] as [string, string],
    claim: ledger?.claimBoundary || "Your proof, exportable and re-walkable by anyone — not a vendor audit log.",
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
        {(ledger?.queuedPrivateEvents || ["private vault writeback", "signed body-receipt attach"]).map((event) => (
          <div key={event} className="pl__v off sheet-state"><span className="d" />{event} · queued</div>
        ))}
        <Shape label="ProofLedgerEntry" code={"{ index, id, kind, statement,\n  state: proven|available|missing|queued|gated,\n  source, previousHash, hash }"} />
      </>
    ),
  };
}

function revocationSheet(revocation: RevocationCascade | null) {
  return {
    title: "Revocation cascade",
    binds: ["GET /api/mirror/revocation-cascade", revocation?.schemaVersion || "active_mirror.revocation_cascade.v1"] as [string, string],
    claim: revocation?.claimBoundary || "The cascade contract is public; the actual downstream rewrite runs only on the private body.",
    body: (
      <>
        <div className="sectlabel">revoke → downstream → receipt</div>
        {(revocation?.events || []).map((event) => (
          <div key={event.sequence} className="cascade-card">
            <div className="cascade-top"><span>#{event.sequence}</span><span className={`pl__v ${stateTone(event.state)}`}><span className="d" />{event.state}</span></div>
            <div className="cascade-revoke"><span>revoke</span> · {event.revoke}</div>
            <div className="cascade-effect">↳ {event.downstreamEffect}</div>
            <div className="cascade-receipt">receiptRequired · {event.receiptRequired}</div>
          </div>
        ))}
        <div className="pl__v off sheet-state"><span className="d" />privateEnforcement · {revocation?.privateEnforcement || "body_required"} (gate, not error)</div>
        <Shape label="RevocationCascadeEvent" code={"{ sequence, revoke, downstreamEffect,\n  state, receiptRequired }"} />
      </>
    ),
  };
}

function continuitySheet(continuity: ContinuityMeasure | null) {
  const vector = continuity?.vectorDelta || [];
  return {
    title: "Continuity score",
    binds: ["POST /api/mirror/identity-continuity/measure", continuity?.schemaVersion || "active_mirror.identity_continuity_measure.v1"] as [string, string],
    claim: continuity?.claimBoundary || "Public-safe preview only; a signed model-swap receipt is required to trust private identity continuity.",
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
        <div className="route-pair">{continuity?.beforeModel || "frontier"} → {continuity?.afterModel || "sovereign"}</div>
        <div className="pl__v warn sheet-state"><span className="d" />receiptState · {continuity?.receiptState || "unsigned_public_preview"}</div>
        <div className="pl__v off sheet-state"><span className="d" />requiredReceipt · {continuity?.requiredReceipt || "signed_model_swap_identity_receipt"}</div>
        <div className="sectlabel">vectorDelta · explainable</div>
        {vector.map((item) => (
          <div key={item.id} className="vector-row">
            <span>{item.label}</span>
            <span>{item.before.toFixed(2)}→{item.after.toFixed(2)}</span>
            <span className={item.delta < -0.05 ? "delta-warn" : "delta-ok"}>Δ{item.delta.toFixed(2)}</span>
            <div><div style={{ width: `${Math.round(item.stability * 100)}%` }} /></div>
          </div>
        ))}
        <Shape label="IdentityVectorDelta" code={"{ id, label, before, after, delta, stability, weight }"} />
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
    title: "Trust ratchet",
    binds: ["GET /api/mirror/ratchet", ratchet?.version || "2026.06.09-mirror-ratchet-v5"] as [string, string],
    claim: ratchet?.claimBoundary || "Controlled truth / provenance / permission / generation — not a raw IQ claim.",
    body: (
      <>
        <div className="ratchet-score"><div>{ratchet?.score.passing || 0}/{ratchet?.score.total || 0}</div><span>{ratchet?.score.coveragePct || 0}% · monotonic · target {ratchet?.targetPasses || 1000}</span></div>
        <div className="sectlabel">frontier-failure coverage</div>
        {(ratchet?.checks || []).map((check) => (
          <div key={check.id} className="ratchet-check">
            <div><span>{check.label}</span><span className={`pl__v ${stateTone(check.state)}`}><span className="d" />{check.state}</span></div>
            <p><span>frontier</span> · {check.frontierFailure}</p>
            <p><span>control</span> · {check.activeMirrorControl}</p>
          </div>
        ))}
        <Shape label="MirrorRatchetStatus.checks[]" code={"{ id, label, state,\n  frontierFailure, activeMirrorControl }"} />
      </>
    ),
  };
}

function kernelSheet(kernel: KernelStatus | null) {
  const controls = kernel?.controlPlane || [];
  return {
    title: "MirrorKernel",
    binds: ["GET /api/mirror/kernel", kernel?.version || "2026.06.09-mirrorkernel-identity-score-v6"] as [string, string],
    claim: kernel?.publicClaim || kernel?.claimBoundary || "Public route receives a redacted proof packet; private body truth is body_unavailable.",
    body: (
      <>
        <div className={`pl__v ${stateTone(kernel?.state)} sheet-state`}><span className="d" />state · {kernel?.state || "body_unavailable"}</div>
        <div className={`pl__v ${stateTone(capabilityStatus(kernel))} sheet-state`}><span className="d" />capabilityKernel · {capabilityStatus(kernel)}</div>
        <div className="sectlabel">control plane</div>
        {controls.map((control) => (
          <div key={control.label} className="kernel-control">{control.label} · {control.state || "enforced"}</div>
        ))}
        <p className="sheet-copy">Fresh private body truth is <b>body_unavailable</b> on this public route. The public surface can still build a workspace, but private execution needs a signed receipt.</p>
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
