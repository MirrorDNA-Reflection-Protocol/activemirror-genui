import type { Metadata } from "next";
import LegalPage from "@/components/active-mirror/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Active Mirror handles submitted workflows, contact details, telemetry, and review requests.",
  alternates: { canonical: "https://activemirror.ai/privacy" },
};

const sections = [
  {
    title: "What we collect",
    body: [
      "We collect the information you choose to send through the site, intake forms, workspace prompts, email links, or direct messages. That can include your name, company, email address, workflow description, and any context you include in the request.",
      "We also collect basic operational data such as page route, referrer, timestamps, browser class, error state, and security logs so the site can be measured, debugged, and protected.",
    ],
  },
  {
    title: "What not to send",
    body: [
      "The public workspace is a preview surface. Do not submit passwords, private keys, regulated personal data, confidential customer records, or account access unless we have agreed to a reviewed private route for that work.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "To respond to your request and prepare a scoped workflow or proof sprint.",
      "To operate, secure, and improve Active Mirror surfaces.",
      "To separate public-safe requests from work that needs a reviewed private route.",
      "To keep lightweight records of approvals, gaps, and next actions when a workflow requires them.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "We do not sell personal information. We may use infrastructure, email, analytics, hosting, or AI providers to operate the service, but only for the purpose of handling the request or running the product.",
      "A specific proof sprint or deployment may need its own written data boundary, provider route, and review process before sensitive work starts.",
    ],
  },
  {
    title: "Retention",
    body: [
      "We keep request records only as long as needed for follow-up, operational proof, security, legal, or service continuity. You can ask us to delete or correct information where deletion is feasible and not blocked by a legitimate record-keeping need.",
    ],
  },
  {
    title: "India DPDP rights",
    body: [
      "If the Digital Personal Data Protection Act, 2023 applies to your request, you may contact us to ask what personal data we hold, request correction, request erasure, withdraw consent where consent is the basis, or raise a grievance.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Send privacy questions or requests to paul@activemirror.ai. Include enough context for us to identify the request, but do not include sensitive credentials in the email.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy"
      title="Privacy"
      lede="Plain-language privacy terms for people and teams using the Active Mirror site, public workspace, and intake routes."
      updated="June 11, 2026"
      sections={sections}
    />
  );
}
