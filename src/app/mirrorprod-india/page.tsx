import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ClipboardCheck,
  Languages,
  Mail,
  Megaphone,
  MessageCircle,
  PlaySquare,
} from "lucide-react";
import styles from "./MirrorProdIndiaPage.module.css";

const title = "MirrorProd India - Professional Videos Without Shoots";
const description =
  "MirrorProd India creates founder videos, product ads, awareness campaigns, explainers, reels, and shorts without a traditional video shoot.";

const mailHref =
  "mailto:hello@activemirror.ai?subject=MirrorProd%20India%20sample%20concept&body=I%20want%20a%20MirrorProd%20India%20sample%20concept%20for%3A%0A%0ABusiness%20or%20brand%3A%0AGoal%3A%0ALanguage%3A%0AReference%20links%3A";

const whatsappHref =
  "https://wa.me/919930949469?text=I%20want%20a%20MirrorProd%20India%20sample%20concept.";

const useCases = [
  {
    icon: Megaphone,
    title: "Product ads and launch reels",
    body: "Turn a product, offer, or campaign idea into short-form creative directions that are ready for review.",
  },
  {
    icon: Camera,
    title: "Founder and spokesperson videos",
    body: "Create a professional video path from a photo, a rough script, or a message without booking a crew.",
  },
  {
    icon: Languages,
    title: "India-language variants",
    body: "Shape the same message for English, Hinglish, Hindi, Marathi, Tamil, Telugu, and regional buyer contexts.",
  },
];

const flow = [
  ["01", "Brief", "Capture the goal, audience, channel, tone, and proof points."],
  ["02", "Script", "Convert the raw idea into a tight message and visual plan."],
  ["03", "Review", "Check claims, language, brand fit, and delivery before production."],
  ["04", "Package", "Prepare the output for reels, shorts, ads, status, or sales follow-up."],
];

const languages = ["English", "Hinglish", "Hindi", "Marathi", "Tamil", "Telugu", "Gujarati", "Kannada"];

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://activemirror.ai/mirrorprod-india" },
  openGraph: {
    title: "MirrorProd India | Professional videos without shoots",
    description,
    url: "https://activemirror.ai/mirrorprod-india",
    siteName: "Active Mirror",
    type: "website",
    images: [
      {
        url: "/og-mirrorprod.png",
        width: 1200,
        height: 630,
        alt: "MirrorProd India landing page for professional videos without shoots",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MirrorProd India | Professional videos without shoots",
    description,
    images: ["/og-mirrorprod.png"],
  },
};

export default function MirrorProdIndiaPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "MirrorProd India",
    serviceType: "AI-assisted video production and creative brief service",
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
          <h1>Professional videos without shoots</h1>
          <p className={styles.heroText}>
            Founder videos, product ads, awareness campaigns, explainers, reels, and shorts for Indian brands and teams
            without cameras, crews, or acting skills.
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
          <b>Photo, product shot, script, or rough idea</b>
        </div>
        <div className={styles.summaryItem}>
          <span>Output</span>
          <b>Review-ready video direction and production brief</b>
        </div>
        <div className={styles.summaryItem}>
          <span>Channels</span>
          <b>Reels, shorts, ads, status, explainers</b>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p>What it restores</p>
          <h2>A fast creative route for teams that need the video before they can sell the idea.</h2>
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
          <p>Brief flow</p>
          <h2>The work starts with a locked brief, not a vague prompt.</h2>
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
        <div className={styles.closing}>
          <BadgeCheck aria-hidden="true" size={34} />
          <h2>Send the raw idea. Get a video concept that can be reviewed, edited, and produced.</h2>
          <p>
            MirrorProd India is back on the live Active Mirror origin at this route. The next step is a compact sample
            brief with the target audience, proof points, language, and channel.
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
