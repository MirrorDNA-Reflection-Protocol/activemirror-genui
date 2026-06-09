import PublicSystemPage from "@/components/active-mirror/PublicSystemPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evidence Examples",
  description: "Public-safe examples for evidence records, decision notes, model-change notes, and removal effects.",
  alternates: { canonical: "https://activemirror.ai/glass" },
};

export default function GlassPage() {
  return <PublicSystemPage kind="glass" />;
}
