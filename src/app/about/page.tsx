import ActiveMirrorSite from "@/components/active-mirror/ActiveMirrorSite";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bring one workflow your current AI cannot safely finish. Active Mirror scopes it, builds a reviewable workspace, and keeps sources, approvals, and next actions visible.",
  alternates: {
    canonical: "https://activemirror.ai/about",
  },
};

export default function AboutPage() {
  return <ActiveMirrorSite />;
}
