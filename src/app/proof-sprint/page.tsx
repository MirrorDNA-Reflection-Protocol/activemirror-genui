import PublicSystemPage from "@/components/active-mirror/PublicSystemPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "72-Hour Proof Sprint",
  description: "What Active Mirror returns from a 72-hour proof sprint: a working surface, visible evidence, and a deploy-or-don't decision.",
  alternates: { canonical: "https://activemirror.ai/proof-sprint" },
};

export default function ProofSprintPage() {
  return <PublicSystemPage kind="proof-sprint" />;
}
