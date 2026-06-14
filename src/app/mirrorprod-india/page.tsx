import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Languages,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  PlaySquare,
} from "lucide-react";
import styles from "./MirrorProdIndiaPage.module.css";

const title = "MirrorProd India - Micro-Drama Training Packs";
const description =
  "MirrorProd India turns SOPs, product notes, policies, and rough ideas into micro-drama training videos and educational material packs for Indian teams.";

const mailHref =
  "mailto:hello@activemirror.ai?subject=MirrorProd%20India%20sample%20concept&body=I%20want%20a%20MirrorProd%20India%20sample%20concept%20for%3A%0A%0ABusiness%20or%20brand%3A%0AGoal%3A%0ALanguage%3A%0AReference%20links%3A";

const whatsappHref =
  "https://wa.me/919930949469?text=I%20want%20a%20MirrorProd%20India%20sample%20concept.";

const useCases = [
  {
    icon: GraduationCap,
    title: "Micro-drama training",
    body: "Convert one policy, SOP, or mistake pattern into a short episode series that teaches behaviour, not just information.",
  },
  {
    icon: BookOpen,
    title: "Customer education",
    body: "Explain products, services, warranties, safety steps, finance terms, or app flows in a format people can watch and remember.",
  },
  {
    icon: ListChecks,
    title: "Frontline enablement",
    body: "Create role-wise checklists, manager notes, quizzes, posters, and captions from the same source material.",
  },
  {
    icon: Languages,
    title: "India-language variants",
    body: "Adapt the lesson for English, Hinglish, Hindi, Marathi, Tamil, Telugu, Gujarati, Kannada, and regional buyer contexts.",
  },
];

const flow = [
  ["01", "Source", "Start from an SOP, product sheet, policy, deck, photo, or rough voice note."],
  ["02", "Lesson", "Lock the learner, behaviour change, proof points, language, and risk boundary."],
  ["03", "Drama", "Write the short scenes, conflict, correction, recap, and cliffhanger or recall beat."],
  ["04", "Materials", "Generate quiz, poster, captions, manager checklist, and handoff notes."],
  ["05", "Gate", "Review claims, safety, language, brand fit, consent, and render route before production."],
];

const languages = ["English", "Hinglish", "Hindi", "Marathi", "Tamil", "Telugu", "Gujarati", "Kannada"];

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://activemirror.ai/mirrorprod-india" },
  openGraph: {
    title: "MirrorProd India | Micro-drama training packs",
    description,
    url: "https://activemirror.ai/mirrorprod-india",
    siteName: "Active Mirror",
    type: "website",
    images: [
      {
        url: "/og-mirrorprod.png",
        width: 1200,
        height: 630,
        alt: "MirrorProd India landing page for micro-drama training packs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MirrorProd India | Micro-drama training packs",
    description,
    images: ["/og-mirrorprod.png"],
  },
};

export default function MirrorProdIndiaPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "MirrorProd India",
    serviceType: "Micro-drama training video and educational material service",
    description,
    url: "https://activemirror.ai/mirrorprod-india",
    areaServed: { "@type": "Country", name: "India" },
    availableLanguage: languages,
    provider: {
      "@type": "Organization",
      name: "N1 Intelligence (OPC) Pvt Ltd",
      url: "https://activemirror.ai",
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@activemirror.ai",
        contactType: "sales",
      },
    },
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <nav className={styles.nav} aria-label="MirrorProd India">
        <Link className={styles.brand} href="/">
          Active Mirror
        </Link>
        <Link className={styles.navLink} href="/intake?focus=mirrorprod">
          Start brief <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>MirrorProd India</p>
          <h1>Training videos people actually finish</h1>
          <p className={styles.heroText}>
            Turn SOPs, product notes, policies, and rough explanations into short micro-drama lessons, quizzes, posters,
            captions, and language variants for Indian teams and customers.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.primaryCta} href={mailHref}>
              <Mail aria-hidden="true" size={18} />
              Request a sample concept
            </a>
            <a className={styles.secondaryCta} href={whatsappHref} rel="noreferrer" target="_blank">
              <MessageCircle aria-hidden="true" size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className={styles.summaryStrip} aria-label="MirrorProd India summary">
        <div className={styles.summaryItem}>
          <span>Input</span>
          <b>SOP, product note, policy, deck, or voice note</b>
        </div>
        <div className={styles.summaryItem}>
          <span>Output</span>
          <b>Micro-drama lesson plus educational material pack</b>
        </div>
        <div className={styles.summaryItem}>
          <span>Use</span>
          <b>Staff training, customer education, onboarding</b>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>The wedge</p>
          <h2>Micro-drama learning for businesses that cannot afford slow training systems.</h2>
        </div>
        <div className={styles.grid}>
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article className={styles.card} key={item.title}>
                <Icon aria-hidden="true" size={30} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>Training flow</p>
          <h2>The work starts with a source and a behaviour goal, not a vague prompt.</h2>
        </div>
        <div className={styles.flow}>
          {flow.map(([number, heading, body]) => (
            <article className={styles.flowStep} key={number}>
              <span>{number}</span>
              <h3>{heading}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className={styles.languageBand} aria-label="Supported language starting points">
          {languages.map((language) => (
            <span key={language}>{language}</span>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>What makes it different</p>
          <h2>A governed story engine before any render tool.</h2>
        </div>
        <div className={styles.differenceGrid}>
          <article>
            <FileCheck2 aria-hidden="true" size={28} />
            <h3>Claim-checked</h3>
            <p>Facts, assumptions, unknowns, and review needs stay visible before the script becomes a video.</p>
          </article>
          <article>
            <Megaphone aria-hidden="true" size={28} />
            <h3>Drama with a job</h3>
            <p>Every episode teaches one action: prevent a mistake, sell better, explain a step, or onboard faster.</p>
          </article>
          <article>
            <ClipboardCheck aria-hidden="true" size={28} />
            <h3>Materials included</h3>
            <p>The pack includes scripts, captions, quiz questions, poster copy, manager notes, and render prompts.</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.closing}>
          <BadgeCheck aria-hidden="true" size={34} />
          <h2>Send one messy training problem. Get a reviewable micro-drama learning pack.</h2>
          <p>
            MirrorProd India is a production-control layer for training and educational content. The next step is a
            compact sample pack with the learner, behaviour goal, proof points, language, scenes, quiz, and render route.
          </p>
          <div className={styles.ctaRow}>
            <a className={styles.primaryCta} href={mailHref}>
              <ClipboardCheck aria-hidden="true" size={18} />
              Start the brief
            </a>
            <Link className={styles.secondaryCta} href="/mirror">
              <PlaySquare aria-hidden="true" size={18} />
              Open Active Mirror
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
