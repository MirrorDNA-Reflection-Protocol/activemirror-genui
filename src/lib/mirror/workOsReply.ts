export type WorkOsReplyArtifact = {
  title: string;
};

export const MAX_WORK_OS_CHAT_REPLY_CHARS = 180;
export const MAX_WORK_OS_ARTIFACT_TITLE_CHARS = 90;
export const MAX_WORK_OS_ARTIFACT_FIELD_CHARS = 500;
export const MAX_WORK_OS_ARTIFACT_ITEM_CHARS = 360;
export const MAX_WORK_OS_PROOF_LABEL_CHARS = 160;

const ARTIFACT_SYNTAX_MARKERS = ["`", "{", "}", "[", "]", "|"];
const ARTIFACT_BODY_PATTERN =
  /\b(objective|targetMarket|keyActivities|timeline|executive summary|market analysis|business setup|product development|marketing|operations|assumptions|unknowns|nextAction|blocks)\b/i;

export function compactWorkOsReply(
  rawReply: string,
  artifact: WorkOsReplyArtifact | null,
  refined = false,
): string {
  const cleaned = rawReply.replace(/\s+/g, " ").trim();
  const lines = rawReply
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hasArtifactSyntax = ARTIFACT_SYNTAX_MARKERS.some((marker) => rawReply.includes(marker));
  const looksLikeArtifactBody =
    cleaned.length > MAX_WORK_OS_CHAT_REPLY_CHARS ||
    lines.length > 2 ||
    hasArtifactSyntax ||
    lines.some((line) => /^([-*]|\d+[.)]|#{1,6}\s)/.test(line)) ||
    /\*\*/.test(cleaned) ||
    ARTIFACT_BODY_PATTERN.test(cleaned);

  if (!cleaned || looksLikeArtifactBody) {
    return artifact ? workOsArtifactReply(artifact, refined) : "What should this become: a plan, draft, brief, or checklist?";
  }

  return cleaned.length > MAX_WORK_OS_CHAT_REPLY_CHARS
    ? `${cleaned.slice(0, MAX_WORK_OS_CHAT_REPLY_CHARS - 3).trim()}...`
    : cleaned;
}

function workOsArtifactReply(artifact: WorkOsReplyArtifact, refined: boolean): string {
  const verb = refined ? "refined" : "drafted";
  const title = artifact.title.replace(/\s+/g, " ").trim();
  const shortTitle =
    title.length > MAX_WORK_OS_ARTIFACT_TITLE_CHARS
      ? `${title.slice(0, MAX_WORK_OS_ARTIFACT_TITLE_CHARS - 3).trim()}...`
      : title;
  return `I ${verb} ${shortTitle} and kept proof gaps visible below.`;
}
