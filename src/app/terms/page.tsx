import type { Metadata } from "next";
import LegalPage from "@/components/active-mirror/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "The practical terms for using Active Mirror public surfaces and requesting a proof sprint.",
  alternates: { canonical: "https://activemirror.ai/terms" },
};

const sections = [
  {
    title: "What Active Mirror is",
    body: [
      "Active Mirror provides reviewable AI workspaces, public previews, and scoped proof-sprint services. The public site is an entry point, not a guarantee that every workflow can or should be automated.",
    ],
  },
  {
    title: "Proof sprints and services",
    body: [
      "A 72-hour proof sprint starts only after the workflow is qualified. If the workflow is not a fit, we can say no before deeper work starts. Commercial terms, data handling, delivery scope, and support obligations are set by a separate written agreement or email confirmation.",
    ],
  },
  {
    title: "No professional advice",
    body: [
      "Active Mirror may help prepare briefs, source routes, review packets, checklists, and workflow drafts. It does not provide legal, medical, financial, procurement, security, or compliance advice. Review qualified matters with the right professional before acting.",
    ],
  },
  {
    title: "Your responsibilities",
    items: [
      "Send only information you have the right to share.",
      "Do not submit secrets, credentials, private keys, or regulated personal data through public routes.",
      "Do not use the site to request unlawful, deceptive, harmful, privacy-invasive, or unauthorized activity.",
      "Review outputs before use, especially where people, money, access, public claims, or regulated decisions are involved.",
    ],
  },
  {
    title: "Outputs and ownership",
    body: [
      "Unless a separate agreement says otherwise, you keep your rights in the material you provide. We may use submitted context to respond, scope, demonstrate, or deliver the requested workflow. Generated drafts and workspaces should be reviewed before business use.",
    ],
  },
  {
    title: "Availability",
    body: [
      "The public workspace may change, pause, or fail. We aim to keep the front door honest: unavailable data, blocked access, and unverified claims should stay visible rather than be hidden as confident answers.",
    ],
  },
  {
    title: "Liability boundary",
    body: [
      "To the maximum extent permitted by law, Active Mirror and N1 Intelligence (OPC) Pvt. Ltd. are not liable for indirect, incidental, consequential, or business-loss damages from public preview use. Any paid engagement may define a different boundary in writing.",
    ],
  },
  {
    title: "Governing terms",
    body: [
      "These public terms are governed by laws applicable to N1 Intelligence (OPC) Pvt. Ltd. in India, unless a signed agreement says otherwise. Questions can be sent to paul@activemirror.ai.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Terms"
      title="Terms"
      lede="The practical rules for using the public site, trying the workspace, and asking for a scoped proof sprint."
      updated="June 11, 2026"
      sections={sections}
    />
  );
}
