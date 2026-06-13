import type { Metadata } from "next";
import AIndiaThesisPage from "@/components/active-mirror/AIndiaThesisPage";

export const metadata: Metadata = {
  title: "AIndia Thesis (Internal)",
  robots: { index: false, follow: false },
};

export default function AIndiaThesisRoute() {
  return <AIndiaThesisPage />;
}
