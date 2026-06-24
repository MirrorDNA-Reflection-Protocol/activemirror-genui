import WorkOSFrontDoor from "@/components/active-mirror/WorkOSFrontDoor";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mirror",
  description:
    "Use Active Mirror to reflect a request, build the workspace, and keep evidence, approvals, saved context, and next actions visible.",
  alternates: {
    canonical: "https://activemirror.ai/mirror",
  },
};

type MirrorPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MirrorPage({ searchParams }: MirrorPageProps) {
  const params = searchParams ? await searchParams : {};
  const hasQaFlag = params.qa !== undefined;

  if (hasQaFlag) {
    const target = new URL("https://activemirror.ai/mirror");
    const prompt = params.prompt;
    if (typeof prompt === "string" && prompt.trim()) {
      target.searchParams.set("prompt", prompt);
    }
    redirect(`${target.pathname}${target.search}`);
  }

  return <WorkOSFrontDoor />;
}
