import type { Metadata } from "next";
import AIndiaPage from "@/components/active-mirror/AIndiaPage";
import { aindiaBootloader } from "@/lib/aindia/bootloader";

const description =
  "AIndia — poocho kuch bhi, jawab source ke saath. Voice, photo, ya text mein — aapki bhasha mein.";

export const metadata: Metadata = {
  title: "AIndia — Jawab Source Ke Saath",
  description,
  manifest: "/api/aindia/manifest",
  alternates: { canonical: "https://activemirror.ai/aindia" },
  openGraph: {
    title: "AIndia — Jawab Source Ke Saath",
    description,
    url: "https://activemirror.ai/aindia",
    siteName: "Active Mirror",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AIndia — jawab source ke saath, aapki bhasha mein" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIndia — Jawab Source Ke Saath",
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
      "Ask by voice, photo, or text in Indian languages",
      "Answer engine with visible source citations",
      "22-language roadmap through AI4Bharat and Sarvam rails",
      "Local supervisor decides whether local, source-pack, safety, or frontier route is allowed",
      "Safety rail flags risky payments, links, and scams before action",
      "Data stays on device — cloud only with explicit consent",
      "Offline app shell and helper-pack path where the device supports it",
      "Two-tier proof: plain check line + expandable technical receipt",
      "DPDP-aligned consent gates, local receipts, and erasure support roadmap",
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
