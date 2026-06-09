export type SiteAnalyticsPayload = {
  event: string;
  path?: string;
  referrer?: string;
  sessionId?: string;
  pageId?: string;
  target?: string;
  label?: string;
  href?: string;
  section?: string;
  device?: string;
  viewport?: string;
  durationMs?: number;
  utm?: Record<string, string>;
  meta?: Record<string, string | number | boolean>;
};

const SESSION_KEY = "active_mirror.analytics.session";
const UTM_KEY = "active_mirror.analytics.utm";

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function sessionId() {
  if (typeof window === "undefined") return "";
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = randomId("s");
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

function deviceClass() {
  if (typeof window === "undefined") return "unknown";
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

function viewport() {
  if (typeof window === "undefined") return "";
  return `${window.innerWidth}x${window.innerHeight}`;
}

function captureUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const current: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"]) {
    const value = params.get(key);
    if (value) current[key] = value.slice(0, 120);
  }
  if (Object.keys(current).length) {
    window.sessionStorage.setItem(UTM_KEY, JSON.stringify(current));
    return current;
  }
  try {
    return JSON.parse(window.sessionStorage.getItem(UTM_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function newPageId() {
  return randomId("p");
}

export function trackSiteEvent(payload: SiteAnalyticsPayload) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    ...payload,
    path: payload.path || `${window.location.pathname}${window.location.search}`,
    referrer: payload.referrer ?? document.referrer,
    sessionId: payload.sessionId || sessionId(),
    device: payload.device || deviceClass(),
    viewport: payload.viewport || viewport(),
    utm: payload.utm || captureUtm(),
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics", blob)) return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => null);
}
