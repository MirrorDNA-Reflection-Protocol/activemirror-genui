"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Camera,
  Check,
  CircleHelp,
  Cpu,
  DatabaseZap,
  FileSearch,
  Globe2,
  ImagePlus,
  Languages,
  MessageSquareText,
  Mic,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Volume2,
} from "lucide-react";
import {
  aindiaBootloader,
  aindiaOfflineHelperPlan,
  aindiaLanguages,
  aindiaModes,
  detectAIndiaLanguage,
  type AIndiaInputId,
  type AIndiaModeId,
} from "@/lib/aindia/bootloader";
import { aindiaAnswerEngineSteps, aindiaMetaThesis, aindiaModelLayers, type AIndiaModelLayerId } from "@/lib/aindia/modelMatrix";
import SiteTelemetry from "./SiteTelemetry";
import styles from "./AIndiaPage.module.css";

/* ── Task 6: only render pills for languages with working end-to-end ASR + output ── */
const ASR_READY_CODES = new Set(["hi", "en"]);

/* ── Task 3: deterministic demo answers per input type ── */
const demoAnswers: Record<
  AIndiaInputId,
  {
    asking: string;
    answer: string;
    answerHindi: string;
    source: string;
    chetana: null | { status: "safe" | "risky" | "verify"; reason: string };
    nextStep: string;
  }
> = {
  voice: {
    asking: "पूछ रहा हूं...",
    answer: "Aapka sawaal samajh gaya.",
    answerHindi: "नज़दीकी राशन की दुकान सोमवार से शनिवार, सुबह 9 से शाम 7 बजे तक खुली रहती है।",
    source: "Google Maps local data",
    chetana: null,
    nextStep: "Map directions bhejein?",
  },
  photo: {
    asking: "फोटो देख रहा हूं...",
    answer: "Screenshot check kiya.",
    answerHindi: "यह UPI request एक unknown sender से है। Amount ₹12,000 है।",
    source: "On-device OCR",
    chetana: { status: "risky", reason: "Unknown sender + high-value UPI request. Do not pay yet." },
    nextStep: "Sender ka phone number bank app mein verify karein.",
  },
  message: {
    asking: "मैसेज पढ़ रहा हूं...",
    answer: "Message scan kiya.",
    answerHindi: "यह link एक job offer claim कर रहा है। Domain 3 दिन पहले register हुआ है।",
    source: "Link analysis + WHOIS",
    chetana: { status: "verify", reason: "New domain + job claims. Pehle official site se milaiye." },
    nextStep: "Company ki official website par jaake verify karein.",
  },
};

const modelLayerIcons: Record<AIndiaModelLayerId, typeof ShieldCheck> = {
  "os-native-llm": Smartphone,
  "indic-language": Languages,
  speech: Mic,
  "ocr-vision": FileSearch,
  "embeddings-rag": DatabaseZap,
  "search-citations": SearchCheck,
  "safety-fraud": ShieldCheck,
  "action-tools": Bot,
};

/* ── Task 4: two-tier proof component ── */

function ProofLine({ status = "safe" }: { status?: "safe" | "risky" | "verify" }) {
  const [expanded, setExpanded] = useState(false);
  const dotClass =
    status === "risky" ? styles.proofDotRisky : status === "verify" ? styles.proofDotVerify : styles.proofDotSafe;

  return (
    <div>
      <div
        className={styles.proofLine}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
      >
        <span className={dotClass} />
        ✓ Checked · kuch bahar nahi gaya
      </div>
      {expanded && (
        <div className={styles.proofReceipt}>
          <p>route: local-only → sarvam-asr → answer-engine</p>
          <p>gates: 3/3 passed</p>
          <p>hash: a3f8…c91d</p>
        </div>
      )}
    </div>
  );
}

/* ── shared ── */

function Brand() {
  return (
    <Link className={styles.brand} href="/" aria-label="Active Mirror home">
      <span>AI</span>ndia
    </Link>
  );
}

/* ── Task 3: reworked phone demo ── */

function PhoneDemo() {
  const mode: AIndiaModeId = "home";
  const [input, setInput] = useState<AIndiaInputId>("voice");
  const [phase, setPhase] = useState<"idle" | "asking" | "answered">("idle");
  const [sampleText, setSampleText] = useState("नमस्ते");
  const [browserLanguages, setBrowserLanguages] = useState<string[]>([]);
  const activeMode = useMemo(() => aindiaModes.find((item) => item.id === mode) ?? aindiaModes[0], [mode]);
  const detectedLanguage = useMemo(
    () => detectAIndiaLanguage(sampleText, browserLanguages),
    [browserLanguages, sampleText],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setBrowserLanguages(Array.from(navigator.languages ?? [navigator.language]).filter(Boolean));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleInput(id: AIndiaInputId) {
    setInput(id);
    setPhase("asking");
    if (id === "photo") setSampleText("फोटो");
    else if (id === "message") setSampleText("मैसेज");
    else setSampleText("नमस्ते");
    setTimeout(() => setPhase("answered"), 900);
  }

  const demo = demoAnswers[input];
  const chetanaRailClass = demo.chetana
    ? demo.chetana.status === "risky"
      ? styles.chetanaRailRisky
      : styles.chetanaRailVerify
    : null;
  const railStatusClass = demo.chetana
    ? demo.chetana.status === "risky"
      ? styles.railStatusRisky
      : styles.railStatusVerify
    : null;

  /* Task 6: only ASR-ready language pills */
  const readyLanguages = aindiaLanguages.filter((l) => ASR_READY_CODES.has(l.code));

  return (
    <section className={styles.phoneDemo} aria-label="AIndia voice and photo demo">
      <div className={styles.phoneShell} data-ain-motion="phone">
        <div className={styles.statusBar} aria-hidden="true" data-ain-motion="phone-item">
          <span>9:30</span>
          <span className={styles.cameraDot} />
          <span className={styles.statusIcons}>◆ ▮▮</span>
        </div>
        <div className={styles.appTop} data-ain-motion="phone-item">
          <Brand />
          <button className={styles.helpButton} type="button" aria-label="Help">
            <CircleHelp aria-hidden="true" size={26} />
          </button>
        </div>
        <div className={styles.phoneIntro} data-ain-motion="phone-item">
          <h1>पूछो. आपकी भाषा में.</h1>
          <h2>जवाब, source, aur ek safe agla kadam.</h2>
          <p>Sovereign AI for India.</p>
        </div>
        <div className={styles.phoneSide} data-ain-motion="phone-item">
          <button
            className={`${styles.bigMic} ${input === "voice" && phase !== "idle" ? styles.bigMicActive : ""}`}
            data-ain-motion="mic"
            type="button"
            onClick={() => handleInput("voice")}
            aria-label="Press to speak"
          >
            <Mic aria-hidden="true" size={84} strokeWidth={1.85} />
          </button>
          <h3>
            {phase === "asking" ? demo.asking : phase === "answered" ? demo.answer : "दबाइए और पूछिए"}
          </h3>
          <p>{phase === "idle" ? "Press & ask" : phase === "asking" ? "Thinking..." : ""}</p>
        </div>
        <div className={styles.secondaryActions} data-ain-motion="phone-item">
          <button
            className={`${styles.actionTile} ${input === "photo" && phase !== "idle" ? styles.actionTileActive : ""}`}
            type="button"
            onClick={() => handleInput("photo")}
          >
            <Camera aria-hidden="true" size={35} />
            <b>फ़ोटो भेजो</b>
            <span>Screenshot / form</span>
          </button>
          <button
            className={`${styles.actionTile} ${input === "message" && phase !== "idle" ? styles.actionTileActive : ""}`}
            type="button"
            onClick={() => handleInput("message")}
          >
            <MessageSquareText aria-hidden="true" size={35} />
            <b>मैसेज भेजो</b>
            <span>Link / job / UPI</span>
          </button>
        </div>

        {/* answer flow — visible after input */}
        {phase === "answered" && (
          <div className={styles.phoneAnswer} data-ain-motion="phone-item">
            <h4>{demo.answerHindi}</h4>
            <div className={styles.sourceChip}>
              <SearchCheck size={12} /> {demo.source}
            </div>

            {/* Chetana rail — fires only when risk detected */}
            {demo.chetana && chetanaRailClass && railStatusClass && (
              <div className={chetanaRailClass}>
                <h5>Chetana safety rail</h5>
                <div className={railStatusClass}>
                  <ShieldCheck size={14} />
                  {demo.chetana.status === "risky" ? "रुकिए" : "पहले मिलाइए"}
                </div>
                <p className={styles.railReason}>{demo.chetana.reason}</p>
                {/* Task 5: flag until Chetana API is wired */}
                <span className={styles.chetanaFlag}>copy-only — API not wired yet</span>
              </div>
            )}

            <div className={styles.nextStep}>
              <ArrowRight size={14} /> {demo.nextStep}
            </div>

            {/* Task 4: two-tier proof */}
            <ProofLine status={demo.chetana?.status ?? "safe"} />
          </div>
        )}

        <div className={styles.languagePills} id="languages" data-ain-motion="phone-item">
          {readyLanguages.map((language) => (
            <button
              className={
                detectedLanguage.code === language.code || (detectedLanguage.code === "hi" && language.code === "hi")
                  ? styles.languagePillActive
                  : styles.languagePill
              }
              key={language.code}
              type="button"
              onClick={() => {
                setSampleText(language.code === "hi" ? "नमस्ते" : language.native);
                setPhase("idle");
              }}
            >
              {language.native}
            </button>
          ))}
        </div>
        <div className={styles.privacyLine} aria-live="polite" data-ain-motion="phone-item">
          <span />
          डेटा आपके फोन पर · पूछकर ही बाहर
          <button type="button">कैसे?</button>
        </div>
        <div className={styles.statusLine}>
          <ShieldCheck aria-hidden="true" size={15} />
          {detectedLanguage.native} detected from {detectedLanguage.source}. {activeMode.nextStep}
        </div>
      </div>
    </section>
  );
}

/* ── product sections (kept) ── */

function CheckHabitSection() {
  return (
    <section className={styles.checkHabit} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Powered by Chetana</p>
        <h2>Paise, OTP, ya link — risky lage toh AIndia rok deta hai.</h2>
      </div>
      <div className={styles.checkHabitGrid}>
        {[
          { title: "Safe", hindi: "ठीक लग रहा है", body: "No obvious risk. Still confirm before money, identity, or account action." },
          { title: "Risky", hindi: "रुकिए", body: "Payment, OTP, link, job, or sender looks suspicious. Do not act yet." },
          { title: "Verify", hindi: "पहले मिलाइए", body: "bharosa nahi — pehle milaiye. Check bank app, official source, or someone trusted." },
        ].map((item) => (
          <article key={item.title}>
            <span>{item.title}</span>
            <h3>{item.hindi}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <div className={styles.checkLine}>
        <ShieldCheck aria-hidden="true" size={22} />
        <b>Pehle check karo.</b>
        <span>Payment, reply, submit, ya trust karne se pehle.</span>
      </div>
    </section>
  );
}

function SovereignSection() {
  return (
    <section className={styles.sovereign} data-ain-section>
      <div className={styles.sectionHead}>
        <p>Sovereign AI for India</p>
        <h2>Sovereignty is control, not decoration.</h2>
      </div>
      <div className={styles.sovereignGrid}>
        <article>
          <Languages aria-hidden="true" size={29} />
          <h3>Start in the person&apos;s language.</h3>
          <p>Detect script and speech first. English is a rail, not the default assumption.</p>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" size={29} />
          <h3>Safety before action.</h3>
          <p>UPI, OTP, links, files, accounts, and sends pause for checks and approval.</p>
        </article>
        <article>
          <Cpu aria-hidden="true" size={29} />
          <h3>Frontier models are optional engines.</h3>
          <p>Sarvam, Apple, Google, OpenAI, Anthropic, or local models can help. The harness decides the route.</p>
        </article>
        <article>
          <Globe2 aria-hidden="true" size={29} />
          <h3>Help, not extraction.</h3>
          <p>The win is a safer payment, a clearer form, a message not clicked, or a shop task finished.</p>
        </article>
      </div>
    </section>
  );
}

function ModeSection() {
  const [active, setActive] = useState<AIndiaModeId>("shop");
  const activeMode = aindiaModes.find((mode) => mode.id === active) ?? aindiaModes[1];

  return (
    <section className={styles.modes} id="start">
      <div className={styles.sectionHead}>
        <p>Kaam, not gyaan</p>
        <h2>Everyday checks first. SMEs and institutions after habit.</h2>
      </div>
      <div className={styles.modeGrid}>
        {aindiaModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              className={active === mode.id ? styles.modeActive : styles.modeCard}
              key={mode.id}
              type="button"
              onClick={() => setActive(mode.id)}
            >
              <Icon aria-hidden="true" size={28} />
              <b>{mode.title}</b>
              <span>{mode.short}</span>
            </button>
          );
        })}
      </div>
      <article className={styles.modeOutput}>
        <span>Example</span>
        <h3>{activeMode.example}</h3>
        <p>{activeMode.nextStep}</p>
      </article>
      <div className={styles.chetanaBanner}>
        <div className={styles.chetanaBannerIcon}>
          <ShieldCheck aria-hidden="true" size={40} strokeWidth={1.5} />
        </div>
        <div className={styles.chetanaBannerText}>
          <h3>Chetana stays focused on safety</h3>
          <p>When AIndia sees a suspicious message, link, UPI request, or payment screenshot, it routes the check into Chetana/Kavach. No over-smart answer, no silent action.</p>
        </div>
      </div>
    </section>
  );
}

function ModelMatrixSection() {
  return (
    <section className={styles.modelMatrix} data-ain-section>
      <div className={styles.modelIntro}>
        <BrainCircuit aria-hidden="true" size={34} />
        <div>
          <p>Perplexity for India</p>
          <h2>Answer engine, not chatbot.</h2>
        </div>
        <ul>
          {aindiaMetaThesis.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className={styles.answerSteps}>
        {aindiaAnswerEngineSteps.map((step, index) => (
          <article key={step.title}>
            <span>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
      <div className={styles.layerGrid}>
        {aindiaModelLayers.map((layer) => {
          const Icon = modelLayerIcons[layer.id];
          return (
            <article key={layer.id}>
              <Icon aria-hidden="true" size={25} />
              <h3>{layer.title}</h3>
              <p>{layer.job}</p>
              <b>{layer.localFirstPath}</b>
              <ul>
                {layer.candidates.slice(0, 3).map((candidate) => (
                  <li key={candidate}>{candidate}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StackSection() {
  const LanguageIcon = aindiaBootloader.localLanguageRail.icon;
  return (
    <section className={styles.stack} id="safety" data-ain-section>
      <div className={styles.sectionHead}>
        <p>India-specific intelligence</p>
        <h2>Simple outside. Serious inside.</h2>
      </div>
      <div className={styles.stackGrid}>
        <article>
          <Mic aria-hidden="true" size={28} />
          <h3>Familiar Interface</h3>
          <p>Voice, photo, WhatsApp-style input, big buttons, and very few words.</p>
          <ul>
            {aindiaBootloader.wrapper.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={15} /> {item}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" size={28} />
          <h3>Safety First</h3>
          <p>Safety checks happen before action. The answer is one next step, not a long essay.</p>
          <ul>
            {aindiaBootloader.harness.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={15} /> {item}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <LanguageIcon aria-hidden="true" size={28} />
          <h3>Smart Routing</h3>
          <p>Sarvam/local language first, then task mode, then safety check, then spoken next step.</p>
          <ul className={styles.steppedList}>
            {aindiaBootloader.bootSequence.slice(0, 5).map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={15} /> {item}
              </li>
            ))}
          </ul>
        </article>
      </div>
      <div className={styles.localRail}>
        <Volume2 aria-hidden="true" size={23} />
        <span>Sarvam language rail, local-helper path, and Active Mirror safety checks</span>
      </div>
      <article className={styles.browserHelper}>
        <div>
          <h3>Offline helper path</h3>
          <p>
            AIndia should keep files in the browser and download a Sarvam-compatible helper pack after first use when the
            device can support it. The app shell works first; the model helper arrives in the background.
          </p>
        </div>
        <ul>
          {[...aindiaBootloader.browserHelper.storageTargets, ...aindiaBootloader.browserHelper.constraints].map(
            (item) => (
              <li key={item}>
                <Check aria-hidden="true" size={15} /> {item}
              </li>
            ),
          )}
        </ul>
      </article>
      <div className={styles.offlineSteps}>
        {aindiaOfflineHelperPlan.map((step, index) => (
          <article key={step.title}>
            <span>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── main page ── */

export default function AIndiaPage() {
  const pageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => null);
  }, []);

  /* Task 7: GSAP is already deferred via dynamic import — keep it that way */
  useEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let context: { revert: () => void } | undefined;
    let cancelled = false;

    async function runMotion() {
      const [{ gsap }, scrollTriggerModule] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      if (cancelled || !root) return;

      context = gsap.context(() => {
        gsap.from("[data-ain-motion='phone']", {
          opacity: 0,
          y: 22,
          scale: 0.985,
          duration: 0.72,
          ease: "power3.out",
        });
        gsap.from("[data-ain-motion='phone-item']", {
          opacity: 0,
          y: 16,
          duration: 0.58,
          ease: "power3.out",
          stagger: 0.055,
          delay: 0.08,
        });
        gsap.to("[data-ain-motion='mic']", {
          scale: 1.035,
          duration: 1.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
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
      <SiteTelemetry surface="support_page" />
      <header className={styles.hero}>
        <PhoneDemo />
      </header>

      <CheckHabitSection />
      <SovereignSection />
      <ModeSection />
      <ModelMatrixSection />
      <StackSection />

      <section className={styles.finalCta}>
        <div>
          <ImagePlus aria-hidden="true" size={34} />
          <h2>Sovereign AI, aapke haath mein.</h2>
          <p>Voice ya photo se poocho. Jawab, source, aur receipt — sab aapke phone par.</p>
        </div>
        <Link className={styles.finalButton} href="/intake?focus=aindia" data-analytics="aindia_start">
          AIndia try karo <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    </main>
  );
}
