import type { Metadata } from "next";
import AIndiaPage from "@/components/active-mirror/AIndiaPage";
import { aindiaBootloader } from "@/lib/aindia/bootloader";

const description =
  "AIndia is a sovereign AI harness for India: ask by voice, photo, or text in your language. Get an answer, a source, and one safe next step — with a receipt.";

export const metadata: Metadata = {
  title: "AIndia - Sovereign AI for India",
  description,
  manifest: "/api/aindia/manifest",
  alternates: { canonical: "https://activemirror.ai/aindia" },
  openGraph: {
    title: "AIndia - Sovereign AI for India",
    description,
    url: "https://activemirror.ai/aindia",
    siteName: "Active Mirror",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AIndia — sovereign AI harness for India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIndia - Sovereign AI for India",
    description,
    images: ["/og.png"],
  },
};

export default function AIndiaRoute() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://activemirror.ai/aindia#app",
    name: "AIndia",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web, PWA",
    url: "https://activemirror.ai/aindia",
    creator: {
      "@type": "Organization",
      name: "N1 Intelligence (OPC) Pvt Ltd",
      url: "https://activemirror.ai",
    },
    areaServed: "India",
    description,
    featureList: [
      "Voice-first Indian-language input",
      "Photo and screenshot input",
      "Answer engine with source citations",
      "Sarvam local language rail",
      "Chetana safety rail for risk detection",
      "Two-tier proof: plain check line + expandable technical receipt",
      "Consent gates for cloud and frontier-model fallback",
      "Deterministic harness where the LLM proposes and AIndia decides",
      "Local receipts and optional smart-contract notarization adapter",
      "One next-step output",
      "SME, household, field-work, and learning modes",
    ],
    softwareHelp: {
      "@type": "CreativeWork",
      name: "AIndia bootloader",
      text: `${aindiaBootloader.wrapper.join(", ")}; ${aindiaBootloader.harness.join(", ")}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <AIndiaPage />
    </>
  );
}
