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
      "Bring one workflow your current AI cannot safely finish. Active Mirror scopes it, builds a reviewable workspace, and keeps sources, approvals, and next actions visible.",
    featureList: [
      "Reviewable business workspaces",
      "Evidence and assumption separation",
      "Sensitive-context approval boundaries",
      "Exportable briefs and work records",
      "Local or cloud deployment planning",
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
