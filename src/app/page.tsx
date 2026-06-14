import ActiveMirrorSite from "@/components/active-mirror/ActiveMirrorSite";

export default function Page() {
  const description =
    "Bring one important piece of work. Active Mirror builds a reviewable AI workspace and maps what should run locally, in cloud AI, under human review, and on the record.";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://activemirror.ai/#organization",
        name: "N1 Intelligence (OPC) Pvt Ltd",
        url: "https://activemirror.ai",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://activemirror.ai/#app",
        name: "Active Mirror",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Reviewable AI workspace",
        operatingSystem: "Web, PWA",
        url: "https://activemirror.ai",
        creator: { "@id": "https://activemirror.ai/#organization" },
        description,
        featureList: [
          "Reviewable business workspaces",
          "Hybrid AI architecture control maps",
          "Local and cloud model routing plans",
          "Evidence and assumption separation",
          "Sensitive-context approval boundaries",
          "Exportable briefs and work records",
          "Governed deployment planning",
          "Truth, order, and consented memory promise layer",
          "Indian language-ready workspaces and training surfaces",
        ],
        offers: {
          "@type": "Offer",
          category: "72-hour proof sprint",
          url: "https://activemirror.ai/intake?focus=pilot",
        },
      },
      {
        "@type": "Service",
        "@id": "https://activemirror.ai/#proof-sprint",
        name: "Active Mirror 72-hour proof sprint",
        provider: { "@id": "https://activemirror.ai/#organization" },
        serviceType: "AI workflow proof sprint",
        url: "https://activemirror.ai/intake?focus=pilot",
        description:
          "A scoped proof sprint that turns one qualified AI workflow into a reviewable workspace with sources, gaps, approvals, and a deploy-or-don't plan.",
        audience: [
          { "@type": "Audience", audienceType: "Teams that need reviewable AI work" },
          { "@type": "Audience", audienceType: "Companies controlling AI workflows" },
          { "@type": "Audience", audienceType: "Public-sector programs needing accountable AI work" },
        ],
      },
      {
        "@type": "ItemList",
        "@id": "https://activemirror.ai/#starting-points",
        name: "Active Mirror common starting points",
        itemListElement: [
          "AI workflow proof sprint",
          "Hybrid AI architecture review",
          "AI control map",
          "Reviewable AI workspace",
          "AI governance evidence trail",
          "Private-context AI workflow",
        ].map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <ActiveMirrorSite />
    </>
  );
}
