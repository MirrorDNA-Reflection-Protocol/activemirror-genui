export const FREE_TURNS_UNLOCKED = process.env.MIRROR_FREE_TURNS_UNLOCKED !== "false";
export const FREE_TURN_LIMIT = Number(
  process.env.MIRROR_FREE_TURN_LIMIT || (FREE_TURNS_UNLOCKED ? 999999 : 5)
);
export const MAX_PROMPT_CHARS = Number(process.env.MIRROR_MAX_PROMPT_CHARS || 1200);
export const MAX_CONTEXT_MESSAGES = Number(process.env.MIRROR_MAX_CONTEXT_MESSAGES || 6);
export const PUBLIC_RATE_LIMIT_PER_MINUTE = Number(process.env.MIRROR_PUBLIC_RATE_LIMIT_PER_MINUTE || 12);
export const PUBLIC_RATE_LIMIT_PER_DAY = Number(process.env.MIRROR_PUBLIC_RATE_LIMIT_PER_DAY || 60);

export type BudgetDecision =
  | { allowed: true; remainingTurns: number; usedTurns: number }
  | { allowed: false; remainingTurns: 0; usedTurns: number; reason: "free_turn_limit" };

export function normalizeMessages(messages: unknown): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-MAX_CONTEXT_MESSAGES)
    .map((message) => {
      const record = message as Record<string, unknown>;
      const role: "user" | "assistant" = record.role === "assistant" ? "assistant" : "user";
      const content = String(record.content || "").slice(0, MAX_PROMPT_CHARS);
      return { role, content };
    })
    .filter((message) => message.content.trim().length > 0);
}

export function getUserTurnCount(messages: { role: "user" | "assistant"; content: string }[]) {
  return messages.filter((message) => message.role === "user").length;
}

export function checkFreeTurnBudget(messages: { role: "user" | "assistant"; content: string }[]): BudgetDecision {
  const usedTurns = getUserTurnCount(messages);
  if (FREE_TURNS_UNLOCKED) {
    return {
      allowed: true,
      remainingTurns: FREE_TURN_LIMIT,
      usedTurns,
    };
  }

  if (usedTurns > FREE_TURN_LIMIT) {
    return { allowed: false, remainingTurns: 0, usedTurns, reason: "free_turn_limit" };
  }

  return {
    allowed: true,
    remainingTurns: Math.max(FREE_TURN_LIMIT - usedTurns, 0),
    usedTurns,
  };
}
