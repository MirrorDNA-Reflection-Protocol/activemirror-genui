import WorkOSFrontDoor from "@/components/active-mirror/WorkOSFrontDoor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mirror",
  description:
    "Use Active Mirror to reflect a request, build the workspace, and keep evidence, approvals, saved context, and next actions visible.",
  alternates: {
    canonical: "https://activemirror.ai/mirror",
  },
};

export default function MirrorPage() {
  return <WorkOSFrontDoor />;
}
