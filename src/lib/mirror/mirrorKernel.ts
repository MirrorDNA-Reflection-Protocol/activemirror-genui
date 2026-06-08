import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ACTIVE_MIRROR_KERNEL_PROOF_VERSION = "2026.06.08-mirrorkernel-public-proof-v1";

type CapabilityKernelStatus = {
  status: "compiled" | "missing" | "body_unavailable";
  compiledAt?: string;
  skills?: string[];
  automationServices?: string[];
};

type KerneldStatus = {
  status: "online" | "body_unavailable";
  reason: string;
};

export type MirrorKernelPublicStatus = {
  name: "MirrorKernel";
  version: typeof ACTIVE_MIRROR_KERNEL_PROOF_VERSION;
  state: "active" | "compiled_body_gated" | "body_unavailable";
  publicClaim: string;
  doctrine: string[];
  capabilityKernel: CapabilityKernelStatus;
  kerneld: KerneldStatus;
  privacyBoundary: string;
};

const CAPABILITY_RECEIPT_PATH =
  process.env.MIRROR_CAPABILITY_KERNEL_RECEIPT ||
  (process.env.HOME
    ? join(
        process.env.HOME,
        ".mirrordna",
        "runtime",
        "capability-kernel-root",
        "observability",
        "capability_kernel.receipt.json",
      )
    : "");

async function readCapabilityKernelReceipt(): Promise<CapabilityKernelStatus> {
  try {
    if (!CAPABILITY_RECEIPT_PATH) return { status: "missing" };

    const raw = await readFile(CAPABILITY_RECEIPT_PATH, "utf8");
    const receipt = JSON.parse(raw) as {
      status?: string;
      compiled_at?: string;
      skills?: string[];
      automation_services?: string[];
    };

    if (receipt.status === "success" || receipt.status === "partial") {
      return {
        status: "compiled",
        compiledAt: receipt.compiled_at,
        skills: Array.isArray(receipt.skills) ? receipt.skills.slice(0, 6) : [],
        automationServices: Array.isArray(receipt.automation_services)
          ? receipt.automation_services.slice(0, 6)
          : [],
      };
    }

    return { status: "body_unavailable" };
  } catch {
    return { status: "missing" };
  }
}

async function checkKerneld(): Promise<KerneldStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600);

  try {
    const response = await fetch("http://127.0.0.1:8867/health", {
      cache: "no-store",
      signal: controller.signal,
    });

    if (response.ok) {
      return {
        status: "online",
        reason: "health endpoint returned ok",
      };
    }

    return {
      status: "body_unavailable",
      reason: `health endpoint returned HTTP ${response.status}`,
    };
  } catch {
    return {
      status: "body_unavailable",
      reason: "private body kernel endpoint is not reachable from this public route",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getMirrorKernelPublicStatus(): Promise<MirrorKernelPublicStatus> {
  const [capabilityKernel, kerneld] = await Promise.all([
    readCapabilityKernelReceipt(),
    checkKerneld(),
  ]);

  const state =
    kerneld.status === "online"
      ? "active"
      : capabilityKernel.status === "compiled"
        ? "compiled_body_gated"
        : "body_unavailable";

  return {
    name: "MirrorKernel",
    version: ACTIVE_MIRROR_KERNEL_PROOF_VERSION,
    state,
    publicClaim:
      "MirrorKernel is the Trust by Design runtime around models: deterministic policy decides what may be routed, remembered, executed, or proved.",
    doctrine: [
      "The model proposes; the governed runtime validates and executes.",
      "Frontier models are proposer-only.",
      "Private files, vaults, devices, sends, and account actions stay approval-gated.",
      "No proof surface may expose private runtime paths or raw body topology.",
    ],
    capabilityKernel,
    kerneld,
    privacyBoundary:
      "Public site receives only a redacted kernel proof packet. Fresh private body truth is marked body_unavailable unless the body is reachable.",
  };
}
