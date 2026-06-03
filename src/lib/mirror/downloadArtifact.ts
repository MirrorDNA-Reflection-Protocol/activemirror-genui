"use client";

function slugFromTitle(title: string) {
  return (title || "active-mirror-artifact")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "active-mirror-artifact";
}

export function markdownFilename(title: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${slugFromTitle(title)}-${stamp}.md`;
}

export function downloadMarkdownArtifact(title: string, content: string) {
  const safeContent = content || "";
  const wrapped = safeContent.startsWith("#")
    ? safeContent
    : `# ${title || "Active Mirror Artifact"}\n\n${safeContent}`;
  const blob = new Blob([wrapped], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = markdownFilename(title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
