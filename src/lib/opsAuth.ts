import { createHmac, timingSafeEqual } from "node:crypto";

export const OPS_COOKIE_NAME = "am_ops";

function adminToken() {
  return process.env.MIRROR_ANALYTICS_ADMIN_TOKEN || "";
}

function opsSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || adminToken();
}

export function isLocalHost(host: string | null | undefined) {
  const hostname = (host || "").split(":")[0]?.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function hasOpsTokenConfigured() {
  return Boolean(adminToken());
}

export function validOpsToken(value: string) {
  const token = adminToken();
  return Boolean(token && safeEqual(value, token));
}

export function opsCookieValue() {
  const secret = opsSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update("active-mirror:ops:funnel:v1").digest("hex");
}

export function validOpsCookie(value: string | undefined) {
  const expected = opsCookieValue();
  return Boolean(value && expected && safeEqual(value, expected));
}

export function authorizedOpsAccess(input: { host?: string | null; authorization?: string | null; cookie?: string }) {
  if (isLocalHost(input.host)) return true;
  const auth = input.authorization || "";
  if (auth.startsWith("Bearer ") && validOpsToken(auth.slice("Bearer ".length).trim())) return true;
  return validOpsCookie(input.cookie);
}
