import ActiveMirrorSite from "@/components/active-mirror/ActiveMirrorSite";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Active Mirror is a Made-in-India sovereign runtime and trust layer around frontier and local models.",
  alternates: {
    canonical: "https://activemirror.ai/about",
  },
};

export default function AboutPage() {
  return <ActiveMirrorSite />;
}
