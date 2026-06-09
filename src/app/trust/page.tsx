import PublicSystemPage from "@/components/active-mirror/PublicSystemPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Boundary",
  description: "What Active Mirror sends, stores, asks for, records, and refuses to do silently.",
  alternates: { canonical: "https://activemirror.ai/trust" },
};

export default function TrustPage() {
  return <PublicSystemPage kind="trust" />;
}
