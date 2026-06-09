import PublicSystemPage from "@/components/active-mirror/PublicSystemPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare",
  description: "How Active Mirror differs from default chatbots, tool wrappers, and enterprise audit tools.",
  alternates: { canonical: "https://activemirror.ai/compare" },
};

export default function ComparePage() {
  return <PublicSystemPage kind="compare" />;
}
