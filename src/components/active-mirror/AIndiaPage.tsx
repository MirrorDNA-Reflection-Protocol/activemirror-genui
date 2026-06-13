"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Camera,
  Check,
  CircleHelp,
  Cpu,
  Globe2,
  ImagePlus,
  Languages,
  MessageSquareText,
  Mic,
  SearchCheck,
  ShieldCheck,
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
import { aindiaAnswerEngineSteps, aindiaMetaThesis } from "@/lib/aindia/modelMatrix";
import SiteTelemetry from "./SiteTelemetry";
import styles from "./AIndiaPage.module.css";

/* ── Language support: AI4Bharat IndicConformer ASR covers all 22 scheduled Indian languages.
   Sarvam speech APIs cover translation + TTS. All bootloader languages are ASR-ready.
   Expand to full 22 as bootloader data grows. ── */
const ASR_READY_CODES = new Set(["hi", "ta", "te", "mr", "kn", "bn", "en"]);

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
    asking: "सुन रहा हूं...",
    answer: "Jawab mil gaya.",
    answerHindi: "Vitamin D ke liye subah 10-11 baje 15-20 minute dhoop mein baithein. Supplements doctor se poocho.",
    source: "WHO guidelines + ICMR",
    chetana: null,
    nextStep: "Nearest lab mein test book karein?",
  },
  photo: {
    asking: "फोटो पढ़ रहा हूं...",
    answer: "Form samajh gaya.",
    answerHindi: "Yeh Aadhaar update form hai. Section 2 mein apna naya address bharein. Proof mein bijli ka bill chalega.",
    source: "UIDAI form guide",
    chetana: null,
    nextStep: "Nearest Aadhaar centre ka address bhejein?",
  },
  message: {
    asking: "मैसेज पढ़ रहा हूं...",
    answer: "Message padh liya.",
    answerHindi: "यह link एक job offer claim कर रहा है। Domain 3 दिन पहले register हुआ है।",
    source: "Link analysis + WHOIS",
    chetana: { status: "risky", reason: "Naya domain + fake job offer signs. Link mat kholiye." },
    nextStep: "Company ki official website par jaake verify karein.",
  },
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
          <h1>पूछो. कुछ भी.</h1>
          <h2>Jawab source ke saath. Aapki bhasha mein.</h2>
          <p>Health, forms, shopping, sarkari kaam — har jawab mein source dikhta hai.</p>
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
            {phase === "asking" ? demo.asking : phase === "answered" ? demo.answer : "कुछ भी पूछो"}
          </h3>
          <p>{phase === "idle" ? "Tap & ask anything" : phase === "asking" ? "Soch raha hoon..." : ""}</p>
        </div>
        <div className={styles.secondaryActions} data-ain-motion="phone-item">
          <button
            className={`${styles.actionTile} ${input === "photo" && phase !== "idle" ? styles.actionTileActive : ""}`}
            type="button"
            onClick={() => handleInput("photo")}
          >
            <Camera aria-hidden="true" size={35} />
            <b>फ़ोटो भेजो</b>
            <span>Form / bill / document</span>
          </button>
          <button
            className={`${styles.actionTile} ${input === "message" && phase !== "idle" ? styles.actionTileActive : ""}`}
            type="button"
            onClick={() => handleInput("message")}
          >
            <MessageSquareText aria-hidden="true" size={35} />
            <b>मैसेज भेजो</b>
            <span>Link / message / forward</span>
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
                <h5>Safety check</h5>
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
          {aindiaLanguages.map((language) => {
            const ready = ASR_READY_CODES.has(language.code);
            return (
              <button
                className={
                  detectedLanguage.code === language.code || (detectedLanguage.code === "hi" && language.code === "hi")
                    ? styles.languagePillActive
                    : styles.languagePill
                }
                key={language.code}
                type="button"
                style={ready ? undefined : { opacity: 0.5 }}
                title={ready ? language.label : `${language.label} — coming soon`}
                onClick={() => {
                  if (ready) {
                    setSampleText(language.code === "hi" ? "नमस्ते" : language.native);
                    setPhase("idle");
                  }
                }}
              >
                {language.native}
              </button>
            );
          })}
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
        <p>ChatGPT mein yeh nahi milega</p>
        <h2>Risky lage toh AIndia rok deta hai — pehle.</h2>
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
        <p>Why AIndia</p>
        <h2>Your data stays on your phone. Your language comes first.</h2>
      </div>
      <div className={styles.sovereignGrid}>
        <article>
          <Languages aria-hidden="true" size={29} />
          <h3>Apni bhasha mein.</h3>
          <p>Hindi, English, aur jaldi aur bhi. AIndia aapki bhasha samajhta hai — English zaruri nahi.</p>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" size={29} />
          <h3>Pehle check, phir action.</h3>
          <p>Payment, OTP, link, ya form — AIndia pehle check karta hai, phir aapko batata hai kya karein.</p>
        </article>
        <article>
          <Cpu aria-hidden="true" size={29} />
          <h3>Phone par hi chalta hai.</h3>
          <p>Internet slow ho ya na ho — basic checks aapke phone par local hote hain. Data bahar nahi jaata.</p>
        </article>
        <article>
          <Globe2 aria-hidden="true" size={29} />
          <h3>Kaam ka jawab, gyaan nahi.</h3>
          <p>Lamba essay nahi milega. Ek clear jawab, source ke saath, aur ek next step.</p>
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
        <p>Kya check kar sakte ho</p>
        <h2>Ghar ke sawaal se lekar dukaan ke kaam tak.</h2>
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
          <h3>Suspicious lagta hai? AIndia rokta hai.</h3>
          <p>Koi bhi shaky message, link, UPI request, ya payment screenshot — AIndia pehle warning deta hai. Bina aapki permission koi action nahi hota.</p>
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
          <p>Kaise kaam karta hai</p>
          <h2>Sawaal poocho. Jawab source ke saath.</h2>
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
    </section>
  );
}

function StackSection() {
  const LanguageIcon = aindiaBootloader.localLanguageRail.icon;
  return (
    <section className={styles.stack} id="safety" data-ain-section>
      <div className={styles.sectionHead}>
        <p>Aapke phone ke liye</p>
        <h2>Sasta phone. Slow internet. Phir bhi chalta hai.</h2>
      </div>
      <div className={styles.stackGrid}>
        <article>
          <Mic aria-hidden="true" size={28} />
          <h3>Bole ya photo bhejo</h3>
          <p>Mic dabao aur bolo, ya photo le lo. Type karna zaruri nahi.</p>
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
          <h3>Pehle check, phir bataye</h3>
          <p>Koi bhi action se pehle safety check hota hai. Lamba essay nahi — ek clear next step.</p>
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
          <h3>Internet na ho toh bhi</h3>
          <p>Basic checks phone par hi hote hain. Internet aaye toh aur smart ho jaata hai.</p>
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
          <h3>Offline mode</h3>
          <p>
            Pehli baar use karne ke baad AIndia ek chhota helper pack download karta hai. Uske baad basic checks bina internet ke bhi chalte hain.
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

      <ModeSection />
      <ModelMatrixSection />
      <SovereignSection />
      <CheckHabitSection />
      <StackSection />

      <section className={styles.finalCta}>
        <div>
          <ImagePlus aria-hidden="true" size={34} />
          <h2>Abhi try karo. Free hai.</h2>
          <p>Voice ya photo se poocho. Jawab, source, aur receipt — sab aapke phone par.</p>
        </div>
        <Link className={styles.finalButton} href="/intake?focus=aindia" data-analytics="aindia_start">
          AIndia try karo <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    </main>
  );
}
