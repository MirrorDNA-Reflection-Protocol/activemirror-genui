import { createElement, type ReactNode } from "react";

export type TrustRouteState = "local" | "cloud" | "hybrid" | "blocked" | "unknown";
export type TrustRiskState = "safe" | "verify" | "risky" | "blocked";
export type TrustConsentState = "not_required" | "requested" | "granted" | "denied";
export type TrustSourceState = "source_pack" | "live_source" | "user_provided" | "model_inferred" | "unavailable";

export type TrustReceiptField = {
  label: string;
  value: ReactNode;
  tone?: TrustRiskState | "neutral";
};

export type TrustReceipt = {
  id: string;
  title: string;
  summary: string;
  local: {
    state: TrustRouteState;
    label: string;
    detail?: string;
  };
  cloud: {
    state: TrustRouteState;
    label: string;
    detail?: string;
  };
  source: {
    state: TrustSourceState;
    label: string;
    detail?: string;
    url?: string;
  };
  risk: {
    state: TrustRiskState;
    label: string;
    detail?: string;
  };
  consent: {
    state: TrustConsentState;
    label: string;
    detail?: string;
  };
  receipt: {
    id: string;
    issuedAt?: string;
    hash?: string;
    route?: string;
  };
  fields?: TrustReceiptField[];
  defaultOpen?: boolean;
};

export function formatReceiptIssuedAt(issuedAt?: string) {
  if (!issuedAt) return "Not recorded";

  const parsed = new Date(issuedAt);
  if (Number.isNaN(parsed.getTime())) return issuedAt;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function trustReceiptRows(receipt: TrustReceipt): TrustReceiptField[] {
  return [
    {
      label: "Local",
      value: withDetail(receipt.local.label, receipt.local.detail),
      tone: routeTone(receipt.local.state),
    },
    {
      label: "Cloud",
      value: withDetail(receipt.cloud.label, receipt.cloud.detail),
      tone: routeTone(receipt.cloud.state),
    },
    {
      label: "Source",
      value: receipt.source.url ? (
        createElement("a", { href: receipt.source.url, target: "_blank", rel: "noreferrer" }, receipt.source.label)
      ) : (
        withDetail(receipt.source.label, receipt.source.detail)
      ),
      tone: sourceTone(receipt.source.state),
    },
    {
      label: "Risk",
      value: withDetail(receipt.risk.label, receipt.risk.detail),
      tone: receipt.risk.state,
    },
    {
      label: "Consent",
      value: withDetail(receipt.consent.label, receipt.consent.detail),
      tone: consentTone(receipt.consent.state),
    },
    {
      label: "Receipt",
      value: receipt.receipt.hash
        ? `${receipt.receipt.id} · ${receipt.receipt.hash}`
        : receipt.receipt.id,
      tone: "neutral",
    },
    {
      label: "Issued",
      value: formatReceiptIssuedAt(receipt.receipt.issuedAt),
      tone: "neutral",
    },
    ...(receipt.receipt.route
      ? [
          {
            label: "Route",
            value: receipt.receipt.route,
            tone: "neutral" as const,
          },
        ]
      : []),
    ...(receipt.fields ?? []),
  ];
}

function withDetail(label: string, detail?: string) {
  return detail ? `${label} · ${detail}` : label;
}

function routeTone(state: TrustRouteState): TrustReceiptField["tone"] {
  if (state === "blocked") return "blocked";
  if (state === "cloud" || state === "hybrid") return "verify";
  if (state === "unknown") return "risky";
  return "safe";
}

function sourceTone(state: TrustSourceState): TrustReceiptField["tone"] {
  if (state === "live_source" || state === "source_pack" || state === "user_provided") return "safe";
  if (state === "model_inferred") return "verify";
  return "risky";
}

function consentTone(state: TrustConsentState): TrustReceiptField["tone"] {
  if (state === "granted" || state === "not_required") return "safe";
  if (state === "requested") return "verify";
  return "blocked";
}
