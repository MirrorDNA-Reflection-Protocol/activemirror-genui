import ActiveMirrorHomepage from "@/components/active-mirror/ActiveMirrorHomepage";
import { SessionProvider } from "next-auth/react";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Active Mirror",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, PWA",
    url: "https://activemirror.ai",
    creator: {
      "@type": "Organization",
      name: "N1 Intelligence (OPC) Pvt Ltd",
    },
    description:
      "Active Mirror is a generated work OS for documents, browser research, charts, proof trails, files, vaults, and governed AI workflows.",
    featureList: [
      "Generated documents and PDF-ready artifacts",
      "Browser research surfaces",
      "Charts and data views",
      "Governance and proof trails",
      "Local MirrorSeed personalization",
      "Vault-ready paid continuity",
      "PWA installation",
      "Generated access and waitlist forms",
    ],
  };

  return (
    <SessionProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ActiveMirrorHomepage />
    </SessionProvider>
  );
}
