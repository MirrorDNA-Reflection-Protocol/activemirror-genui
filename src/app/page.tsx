import ActiveMirrorSite from "@/components/active-mirror/ActiveMirrorSite";

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
      "Active Mirror is a Made-in-India sovereign runtime and trust layer around frontier and local models.",
    featureList: [
      "Trust by Design runtime",
      "Static public teaser with no model call",
      "Work OS product route",
      "MirrorGate governance",
      "Proof ledger and governed export path",
      "Revocation, continuity, critique, and ratchet contracts",
      "Local-first deployment posture",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ActiveMirrorSite />
    </>
  );
}
