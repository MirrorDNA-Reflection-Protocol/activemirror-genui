"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Check,
  Cloud,
  Cpu,
  LockKeyhole,
  Languages,
  Mic,
  Network,
  Send,
  ShieldCheck,
  Smartphone,
  Stamp,
  UserRound,
  Workflow,
} from "lucide-react";
import { aindiaContracts, aindiaDeviceRails, evaluateAIndiaGates, type AIndiaContractId } from "@/lib/aindia/contracts";
import { aindiaDeterminismPrinciples } from "@/lib/aindia/determinismPrinciples";
import { aindiaFiveYearBets, aindiaFuturePrimitives, aindiaFutureThesis, aindiaFutureThreats } from "@/lib/aindia/futureProof";
import { aindiaHardeningControls } from "@/lib/aindia/hardening";
import { aindiaOpportunityBacklog } from "@/lib/aindia/opportunities";
import { activeMirrorIndiaPosition, aindiaAntiStar, aindiaDecisionRules, aindiaOwnStar, aindiaStarAxioms } from "@/lib/aindia/ownStar";
import {
  aindiaForeverLoop,
  aindiaHundredRecursions,
  aindiaHundredRecursionSummary,
  aindiaMacAbsorption,
  aindiaPerfectionDoctrine,
  aindiaRecursionLoop,
  aindiaRecursionScenarios,
  aindiaRecursionScoreLabels,
  aindiaRecursionWinner,
  type AIndiaRecursionMetric,
} from "@/lib/aindia/recursion";
import { aindiaRuntimeLayers } from "@/lib/aindia/runtime";
import {
  aindiaAudienceMath,
  aindiaCompetitorClasses,
  aindiaDoctrine,
  aindiaOptionScenarios,
  aindiaOperatingPriorities,
  aindiaSovereigntyDefinition,
  aindiaSovereigntyTests,
} from "@/lib/aindia/sovereignty";
import { aindiaWrapperMilestones } from "@/lib/aindia/wrapperProtocol";
import styles from "./AIndiaPage.module.css";

/* ── helpers ── */

const optionScoreLabels = ["reach", "trust", "sovereignty", "determinism", "speed", "cheapDevice"] as const;

function ScoreRail({ label, score }: { label: (typeof optionScoreLabels)[number]; score: number }) {
  return (
    <div className={styles.scoreRail}>
      <span>{label === "cheapDevice" ? "cheap device" : label}</span>
      <div aria-hidden="true">
        <i style={{ width: `${score * 20}%` }} />
      </div>
      <b>{score}/5</b>
    </div>
  );
}

function RecursionScoreRail({ label, score }: { label: AIndiaRecursionMetric; score: number }) {
  return (
    <div className={styles.scoreRail}>
      <span>{label === "cheapDevice" ? "cheap device" : label}</span>
      <div aria-hidden="true">
        <i style={{ width: `${score * 20}%` }} />
      </div>
      <b>{score}/5</b>
    </div>
  );
}

const contractIcons: Record<AIndiaContractId, typeof ShieldCheck> = {
  wrapper: Mic,
  "local-files": LockKeyhole,
  "device-model-router": Smartphone,
  "sarvam-language-rail": Languages,
  "safety-rail": ShieldCheck,
  "approval-gates": Check,
  receipts: Stamp,
  "smart-contract-adapter": Network,
};

type RelayMessage = {
  role: "user" | "assistant";
  text: string;
};

/* ── thesis sections ── */

function SovereigntyTestSection() {
  return (
    <section className={styles.sovereigntyTest} data-ain-section>
      <div className={styles.sectionHead}>
        <p>{aindiaSovereigntyDefinition.title}</p>
        <h2>Sovereign AI is a pass/fail harness.</h2>
      </div>
      <div className={styles.thesisPanel}>
        <div>
          <Stamp aria-hidden="true" size={32} />
          <h3>{aindiaSovereigntyDefinition.positioning}</h3>
          <p>{aindiaSovereigntyDefinition.short}</p>
        </div>
        <ul>
          {aindiaDoctrine.map((point) => (
            <li key={point.title}>
              <b>{point.title}</b>
              <span>{point.body}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.priorityGrid}>
        {aindiaOperatingPriorities.map((priority) => (
          <article key={priority.title}>
            <Cpu aria-hidden="true" size={21} />
            <h3>{priority.title}</h3>
            <p>{priority.rule}</p>
            <b>{priority.budget}</b>
          </article>
        ))}
      </div>
      <div className={styles.audienceMath}>
        <article>
          <span>{aindiaAudienceMath.activeInternetUsersIndia2025}</span>
          <p>active internet users in India, 2025</p>
        </article>
        <article>
          <span>{aindiaAudienceMath.ruralActiveInternetUsersIndia2025}</span>
          <p>rural active internet users, 2025</p>
        </article>
        <article>
          <span>{aindiaAudienceMath.activeInternetUsersWhoAccessedIndicLanguages2024}</span>
          <p>internet users accessed Indic languages, 2024</p>
        </article>
        <article>
          <span>{aindiaAudienceMath.englishSpeakersCensusShare2011}</span>
          <p>reported speaking some English in Census 2011</p>
        </article>
      </div>
      <p className={styles.audienceNote}>{aindiaAudienceMath.conservativeLowerBound}</p>
      <div className={styles.testGrid}>
        {aindiaSovereigntyTests.map((item, index) => (
          <article key={item.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.test}</p>
            <b>{item.passRule}</b>
          </article>
        ))}
      </div>
      <div className={styles.competitorGrid}>
        {aindiaCompetitorClasses.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.shape}</p>
            <div className={styles.passFail}>
              <span>{item.passes.length} pass</span>
              <span>{item.fails.length} gap</span>
            </div>
            <b>{item.verdict}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function OptionSpaceSection() {
  return (
    <section className={styles.optionSpace} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Option-space simulation</p>
        <h2>Keep every wedge open. Collapse only to what survives the gates.</h2>
      </div>
      <div className={styles.optionGrid}>
        {aindiaOptionScenarios.map((scenario) => (
          <article key={scenario.title}>
            <div className={styles.optionTop}>
              <Network aria-hidden="true" size={22} />
              <h3>{scenario.title}</h3>
            </div>
            <p>{scenario.shape}</p>
            <div className={styles.scoreStack}>
              {optionScoreLabels.map((label) => (
                <ScoreRail key={label} label={label} score={scenario[label]} />
              ))}
            </div>
            <b>{scenario.todayMove}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecursionSection() {
  const ledgerWindow = [...aindiaHundredRecursions.slice(0, 5), ...aindiaHundredRecursions.slice(-5)];

  return (
    <section className={styles.recursion} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Recursive collapse</p>
        <h2>{aindiaPerfectionDoctrine.title}</h2>
      </div>
      <div className={styles.recursionPanel}>
        <div>
          <BrainCircuit aria-hidden="true" size={33} />
          <h3>{aindiaRecursionWinner.title}</h3>
          <p>{aindiaRecursionWinner.body}</p>
          <b>{aindiaRecursionWinner.today}</b>
        </div>
        <ul>
          {aindiaRecursionLoop.map((step) => (
            <li key={step.step}>
              <span>{step.step}</span>
              <p>{step.rule}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.hundredPanel}>
        <div>
          <Stamp aria-hidden="true" size={30} />
          <h3>100 recursions completed</h3>
          <p>{aindiaHundredRecursionSummary.invariant}</p>
        </div>
        <div className={styles.hundredStats}>
          <article>
            <span>{aindiaHundredRecursionSummary.total}</span>
            <b>Total</b>
          </article>
          <article>
            <span>{aindiaHundredRecursionSummary.absorbed}</span>
            <b>Absorbed</b>
          </article>
          <article>
            <span>{aindiaHundredRecursionSummary.backlog}</span>
            <b>Backlog</b>
          </article>
          <article>
            <span>{aindiaHundredRecursionSummary.blocked}</span>
            <b>Blocked</b>
          </article>
        </div>
      </div>
      <div className={styles.foreverLoop}>
        <div>
          <Workflow aria-hidden="true" size={27} />
          <span>{aindiaForeverLoop.status}</span>
        </div>
        <h3>Forever loop is on</h3>
        <p>{aindiaForeverLoop.guardrail}</p>
        <b>
          {aindiaForeverLoop.cadence} · {aindiaForeverLoop.receipt}
        </b>
      </div>
      <div className={styles.hundredLedger} aria-label="AIndia 100 recursion sample ledger">
        {ledgerWindow.map((item) => (
          <article data-status={item.status} key={item.receiptId}>
            <span>R{String(item.cycle).padStart(3, "0")}</span>
            <h3>{item.pressure}</h3>
            <p>{item.scenarioTitle}</p>
            <b>{item.gate}</b>
          </article>
        ))}
      </div>
      <div className={styles.macAbsorption}>
        <div>
          <Cpu aria-hidden="true" size={27} />
          <h3>This Mac absorbed into the harness</h3>
          <p>{aindiaMacAbsorption.body}</p>
          <small>{aindiaMacAbsorption.activeConstraint}</small>
        </div>
        <div className={styles.macModelList}>
          {aindiaMacAbsorption.localModels.map((model) => (
            <span key={model}>{model}</span>
          ))}
        </div>
      </div>
      <div className={styles.macRailGrid}>
        {aindiaMacAbsorption.rails.map((rail) => (
          <article data-status={rail.status} key={rail.title}>
            <span>{rail.status}</span>
            <h3>{rail.title}</h3>
            <p>{rail.observed}</p>
            <b>{rail.useInAIndia}</b>
          </article>
        ))}
      </div>
      <div className={styles.recursionGrid}>
        {aindiaRecursionScenarios.map((scenario) => (
          <article key={scenario.id}>
            <div className={styles.optionTop}>
              <Network aria-hidden="true" size={22} />
              <h3>{scenario.title}</h3>
            </div>
            <p>{scenario.shape}</p>
            <div className={styles.scoreStack}>
              {aindiaRecursionScoreLabels.map((label) => (
                <RecursionScoreRail key={label} label={label} score={scenario.scores[label]} />
              ))}
            </div>
            <small>{scenario.failureMode}</small>
            <b>{scenario.absorb}</b>
          </article>
        ))}
      </div>
      <p className={styles.recursionInvariant}>{aindiaPerfectionDoctrine.invariant}</p>
    </section>
  );
}

function FounderRelaySection() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consentToRelay, setConsentToRelay] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "ready" | "error">("idle");
  const [messages, setMessages] = useState<RelayMessage[]>([
    {
      role: "assistant",
      text: "Say it plainly. I will help you make sense of it first. If it needs Paul, I can turn it into a clean relay note, but only if you choose to send it.",
    },
  ]);
  const [mailto, setMailto] = useState("");
  const [receipt, setReceipt] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (!text || state === "sending") return;

    setState("sending");
    setMailto("");
    setReceipt("");
    setMessages((items) => [...items, { role: "user", text }]);

    try {
      const response = await fetch("/api/aindia/founder-relay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text,
          name,
          email,
          consentToRelay,
          languageCode: "auto",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Relay failed");
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text: `${payload.answer} ${payload.nextStep}`,
        },
      ]);
      setMailto(payload.mailto || "");
      setReceipt(payload.receiptId || "");
      setMessage("");
      setState("ready");
    } catch {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text: "I could not prepare the relay right now. Keep the message local and try again in a moment.",
        },
      ]);
      setState("error");
    }
  }

  return (
    <section className={styles.founderRelay} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Founder relay</p>
        <h2>Talk through the confusion. Send only when you choose.</h2>
      </div>
      <div className={styles.relayPanel}>
        <div className={styles.relayDoctrine}>
          <UserRound aria-hidden="true" size={32} />
          <h3>Not a Paul bot. A trust bridge.</h3>
          <p>
            AIndia can listen, answer from the public philosophy, and package the signal for Paul. It does not pretend to be him,
            and it does not forward private content silently.
          </p>
          <ul>
            <li><Check aria-hidden="true" size={15} /> Public-safe first response</li>
            <li><Check aria-hidden="true" size={15} /> One next step, not a maze</li>
            <li><Check aria-hidden="true" size={15} /> Relay requires contact and consent</li>
            <li><Check aria-hidden="true" size={15} /> User sends the email</li>
          </ul>
        </div>
        <form className={styles.relayChat} onSubmit={submit}>
          <div className={styles.relayMessages} aria-live="polite">
            {messages.map((item, index) => (
              <p className={item.role === "user" ? styles.relayUser : styles.relayAssistant} key={`${item.role}-${index}`}>
                {item.text}
              </p>
            ))}
          </div>
          <label className={styles.relayInput}>
            <span>Your question</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Example: I am confused about AI for my shop. What should I trust?"
              rows={4}
            />
          </label>
          <div className={styles.relayContactGrid}>
            <label>
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Optional" />
            </label>
            <label>
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Needed only to relay" inputMode="email" />
            </label>
          </div>
          <label className={styles.relayConsent}>
            <input checked={consentToRelay} onChange={(event) => setConsentToRelay(event.target.checked)} type="checkbox" />
            <span>Prepare a ready-to-send note for Paul if this needs human judgment.</span>
          </label>
          <div className={styles.relayActions}>
            <button type="submit" disabled={state === "sending"}>
              <Send aria-hidden="true" size={17} />
              {state === "sending" ? "Checking..." : "Ask AIndia"}
            </button>
            {mailto ? <a href={mailto}>Open email to Paul</a> : null}
          </div>
          {receipt ? <p className={styles.relayReceipt}>Local relay receipt: <b>{receipt}</b></p> : null}
        </form>
      </div>
    </section>
  );
}

function OwnStarSection() {
  return (
    <section className={styles.ownStar} data-ain-section>
      <div className={styles.sectionHead}>
        <p>{aindiaOwnStar.title}</p>
        <h2>{aindiaOwnStar.subtitle}</h2>
      </div>
      <div className={styles.starPanel}>
        <div>
          <Stamp aria-hidden="true" size={34} />
          <h3>{activeMirrorIndiaPosition.title}</h3>
          <p>{aindiaOwnStar.core}</p>
          <b>{activeMirrorIndiaPosition.proofStandard}</b>
        </div>
        <ul>
          {aindiaDecisionRules.map((rule) => (
            <li key={rule.pressure}>
              <span>{rule.pressure}</span>
              <b>{rule.choose}</b>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.starGrid}>
        {aindiaStarAxioms.map((axiom) => (
          <article key={axiom.title}>
            <h3>{axiom.title}</h3>
            <p>{axiom.runtimeRule}</p>
            <b>{axiom.gate}</b>
          </article>
        ))}
      </div>
      <div className={styles.antiStarGrid}>
        {aindiaAntiStar.map((item) => (
          <article key={item.title}>
            <span>Reject</span>
            <h3>{item.title}</h3>
            <p>{item.reject}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FutureProofSection() {
  return (
    <section className={styles.futureProof} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Future-proofing</p>
        <h2>Do not predict the future. Build for failure modes.</h2>
      </div>
      <div className={styles.futurePanel}>
        <div>
          <ShieldCheck aria-hidden="true" size={32} />
          <h3>{aindiaFutureThesis.title}</h3>
          <p>{aindiaFutureThesis.body}</p>
          <b>{aindiaFutureThesis.evidenceBoundary}</b>
        </div>
        <ul>
          {aindiaFuturePrimitives.map((primitive) => (
            <li key={primitive.title}>
              <span>{primitive.title}</span>
              <p>{primitive.role}</p>
              <b>{primitive.mustExistBefore}</b>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.threatGrid}>
        {aindiaFutureThreats.map((threat) => (
          <article key={threat.title}>
            <h3>{threat.title}</h3>
            <p>{threat.assumption}</p>
            <b>{threat.defense}</b>
          </article>
        ))}
      </div>
      <div className={styles.fiveYearGrid}>
        {aindiaFiveYearBets.map((bet) => (
          <article key={bet.year}>
            <span>{bet.year}</span>
            <p>{bet.scenarioAssumption}</p>
            <b>{bet.aindiaPosition}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function RuntimeSection() {
  return (
    <section className={styles.runtime} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Operating spine</p>
        <h2>Bootloader → hooks → harness → wrappers.</h2>
      </div>
      <div className={styles.runtimeGrid}>
        {aindiaRuntimeLayers.map((layer, index) => (
          <article key={layer.id}>
            <span>{index + 1}</span>
            <Workflow aria-hidden="true" size={25} />
            <h3>{layer.title}</h3>
            <p>{layer.job}</p>
            <b>{layer.failClosedRule}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function WrapperRoadmapSection() {
  return (
    <section className={styles.wrapperRoadmap} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Native wrapper plan</p>
        <h2>PWA now. Android first. iOS next. Providers behind gates.</h2>
      </div>
      <div className={styles.wrapperGrid}>
        {aindiaWrapperMilestones.map((milestone) => (
          <article key={milestone.title}>
            <span>{milestone.ship}</span>
            <h3>{milestone.title}</h3>
            <p>{milestone.owner}</p>
            <ul>
              {milestone.acceptance.map((item) => (
                <li key={item}><Check aria-hidden="true" size={14} /> {item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function DeviceRailsSection() {
  return (
    <section className={styles.deviceRails} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Native tools are the unlock</p>
        <h2>Wrap Android, Apple, Chrome, Sarvam, and cloud as rails.</h2>
      </div>
      <div className={styles.railGrid}>
        {aindiaDeviceRails.map((rail) => {
          const Icon = rail.route === "cloud" ? Cloud : rail.route === "native-ios" || rail.route === "native-android" ? Smartphone : Cpu;
          return (
            <article key={rail.id}>
              <div className={styles.railTop}>
                <Icon aria-hidden="true" size={26} />
                <span>{rail.route.replace("-", " ")}</span>
              </div>
              <h3>{rail.title}</h3>
              <p>{rail.mvpUse}</p>
              <strong>{rail.strongestUse}</strong>
              <small>{rail.constraint}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ContractsSection() {
  const gateRun = evaluateAIndiaGates({
    languageKnown: true,
    localStorageReady: true,
    deviceModelChecked: false,
    wantsOfflineDownload: true,
    onWifiOrUnmetered: false,
    hasStorageHeadroom: true,
    safetyRiskDetected: true,
    wantsCloudRoute: true,
    userApproved: false,
    sensitiveAction: true,
    receiptWritten: false,
  });

  return (
    <section className={styles.contracts} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Contracts before intelligence</p>
        <h2>Rules that run before any model answers.</h2>
      </div>
      <div className={styles.contractGrid}>
        {aindiaContracts.map((contract) => {
          const Icon = contractIcons[contract.id];
          return (
            <article key={contract.id}>
              <Icon aria-hidden="true" size={25} />
              <h3>{contract.title}</h3>
              <p>{contract.userText}</p>
              <small>{contract.enforcement}</small>
            </article>
          );
        })}
      </div>
      <div className={styles.gatePanel}>
        <div>
          <h3>Sample gate run</h3>
          <p>Suspicious payment screenshot, offline helper requested, cloud fallback requested, no approval yet.</p>
        </div>
        <ul>
          {gateRun.map((gate) => (
            <li className={styles[`gate${gate.status}`]} key={gate.gateId}>
              <span>{gate.status}</span>
              <b>{gate.gateId.replaceAll("_", " ")}</b>
              <em>{gate.nextAction}</em>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DeterminismSection() {
  return (
    <section className={styles.determinism} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Wrapper + harness moat</p>
        <h2>The LLM proposes. AIndia decides.</h2>
      </div>
      <div className={styles.determinismPanel}>
        <div>
          <h3>Deterministic harness, not deterministic magic.</h3>
          <p>
            We do not depend on a model being perfectly repeatable. We canonicalize the input, force a fixed answer schema,
            verify the proposal, run gates, and hash the receipt. Same facts, same route.
          </p>
        </div>
        <ul>
          {aindiaDeterminismPrinciples.map((principle) => (
            <li key={principle}><Check aria-hidden="true" size={15} /> {principle}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HardeningSection() {
  return (
    <section className={styles.hardening} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Hardened by default</p>
        <h2>Fail closed before any model or provider route.</h2>
      </div>
      <div className={styles.hardeningGrid}>
        {aindiaHardeningControls.map((control) => (
          <article key={control.id}>
            <AlertTriangle aria-hidden="true" size={24} />
            <h3>{control.title}</h3>
            <p>{control.invariant}</p>
            <b>{control.enforcement}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function OpportunitySection() {
  const today = aindiaOpportunityBacklog.filter((item) => item.priority === "today").slice(0, 6);

  return (
    <section className={styles.opportunities} data-ain-section>
      <div className={styles.sectionHead}>
        <p>What else to add</p>
        <h2>Useful additions, not feature sprawl.</h2>
      </div>
      <div className={styles.opportunityGrid}>
        {today.map((item) => (
          <article key={item.id}>
            <span>{item.requires}</span>
            <h3>{item.title}</h3>
            <p>{item.whyItMatters}</p>
            <b>{item.addNow}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── main thesis page ── */

export default function AIndiaThesisPage() {
  const pageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let context: { revert: () => void } | undefined;
    let cancelled = false;

    async function runMotion() {
      const [{ gsap }, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled || !root) return;

      context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-ain-section]").forEach((section) => {
          gsap.from(section, {
            opacity: 0,
            y: 26,
            duration: 0.62,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true,
            },
          });
        });
      }, root);
    }

    runMotion().catch(() => null);

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <main className={styles.page} ref={pageRef}>
      <header className={styles.hero} style={{ padding: "24px clamp(18px, 3.5vw, 42px)" }}>
        <Link href="/aindia" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ain-gold)", fontWeight: 800, textDecoration: "none", fontSize: 15 }}>
          <ArrowLeft size={16} /> Back to AIndia
        </Link>
        <h1 style={{ margin: "16px 0 0", fontFamily: "var(--ain-display)", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 850, color: "var(--ain-ink)" }}>
          AIndia Thesis
        </h1>
        <p style={{ margin: "6px 0 0", color: "var(--ain-muted)", fontSize: 16 }}>
          Internal thinking surface. Not the product page.
        </p>
      </header>

      <SovereigntyTestSection />
      <OptionSpaceSection />
      <RecursionSection />
      <FounderRelaySection />
      <OwnStarSection />
      <FutureProofSection />
      <RuntimeSection />
      <WrapperRoadmapSection />
      <DeviceRailsSection />
      <ContractsSection />
      <DeterminismSection />
      <HardeningSection />
      <OpportunitySection />
    </main>
  );
}
