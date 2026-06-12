import ActiveMirrorSite from "@/components/active-mirror/ActiveMirrorSite";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bring one important piece of work. Active Mirror builds a reviewable AI workspace and maps what should run locally, in cloud AI, under human review, and on the record.",
  alternates: {
    canonical: "https://activemirror.ai/about",
  },
};

export default function AboutPage() {
  return <ActiveMirrorSite />;
}
