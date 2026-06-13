import { NextRequest, NextResponse } from "next/server";

export const AINDIA_API_MAX_BODY_BYTES = 4_096;

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Origin",
} as const;

export type AIndiaJsonReadResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: NextResponse };

export function aindiaJsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
) {
  return NextResponse.json(body, {
    status: init.status,
    headers: {
      ...noStoreHeaders,
      ...init.headers,
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readAIndiaJsonObject(
  request: NextRequest,
  maxBodyBytes = AINDIA_API_MAX_BODY_BYTES,
): Promise<AIndiaJsonReadResult> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      response: aindiaJsonResponse({ error: "Content-Type must be application/json." }, { status: 415 }),
    };
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const parsedLength = Number(contentLength);
    if (!Number.isFinite(parsedLength) || parsedLength < 0) {
      return {
        ok: false,
        response: aindiaJsonResponse({ error: "Invalid Content-Length." }, { status: 400 }),
      };
    }
    if (parsedLength > maxBodyBytes) {
      return {
        ok: false,
        response: aindiaJsonResponse({ error: "Request too large." }, { status: 413 }),
      };
    }
  }

  try {
    const body = await request.json();
    if (!isRecord(body)) {
      return {
        ok: false,
        response: aindiaJsonResponse({ error: "JSON body must be an object." }, { status: 400 }),
      };
    }
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: aindiaJsonResponse({ error: "Malformed JSON body." }, { status: 400 }),
    };
  }
}

export function cleanAIndiaText(value: unknown, max = 900) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanAIndiaStringList(value: unknown, maxItems = 12, maxItemLength = 120) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => cleanAIndiaText(item, maxItemLength)).filter(Boolean)),
  ).slice(0, maxItems);
}

export function isAIndiaRelayEmail(value: string) {
  if (!value || value.length > 254 || /[\s\u0000-\u001F\u007F]/.test(value)) return false;
  return /^[^\s@]{1,64}@[^\s@]{1,180}\.[^\s@]{2,20}$/.test(value);
}
