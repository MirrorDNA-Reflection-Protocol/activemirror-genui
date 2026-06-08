import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ACTIVE_MIRROR_KERNEL_PROOF_VERSION = "2026.06.08-mirrorkernel-canonical-accuracy-v2";

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

type MirrorKernelControl = {
  label: string;
  state: "enforced" | "gated" | "public_safe";
  keepsFromFrontiers: string;
  control: string;
};

export type MirrorKernelPublicStatus = {
  name: "MirrorKernel";
  version: typeof ACTIVE_MIRROR_KERNEL_PROOF_VERSION;
  state: "active" | "compiled_body_gated" | "body_unavailable";
  publicClaim: string;
  epistemicMode: {
    modelLayer: "probabilistic_proposer";
    runtimeLayer: "canonical_verifier";
    law: string;
  };
  truthfulUtilityPolicy: {
    principle: "accuracy_without_fabrication";
    behavior: string;
  };
  actualization: {
    status: "doctrine_loaded";
    loop: string;
    productWedge: string;
  };
  controlPlane: MirrorKernelControl[];
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
      "MirrorKernel is the Trust by Design identity runtime around models: contextual memory is actualized only when truth, scope, and consent allow it.",
    epistemicMode: {
      modelLayer: "probabilistic_proposer",
      runtimeLayer: "canonical_verifier",
      law: "Probabilistic engines propose; canonical runtime verifies, gates, records, and promotes.",
    },
    truthfulUtilityPolicy: {
      principle: "accuracy_without_fabrication",
      behavior:
        "Never invent proof, access, memory, or certainty. When proof or permission is missing, return facts, assumptions, unknowns, source gaps, and the next safe step.",
    },
    actualization: {
      status: "doctrine_loaded",
      loop: "context -> activation -> governance -> working identity -> action -> writeback",
      productWedge: "Ask any model as me, without giving it all of me.",
    },
    controlPlane: [
      {
        label: "Context firewall",
        state: "enforced",
        keepsFromFrontiers: "reasoning, language, coding, research",
        control: "frontier receives a scoped task packet, not the whole person",
      },
      {
        label: "Memory actualization",
        state: "gated",
        keepsFromFrontiers: "personalization and recall",
        control: "memory activates only when truth scope, consent, and compartment match",
      },
      {
        label: "Writeback firewall",
        state: "enforced",
        keepsFromFrontiers: "summaries, inferred preferences, project notes",
        control: "model output cannot become identity without confirmation and audit",
      },
      {
        label: "Source proof",
        state: "public_safe",
        keepsFromFrontiers: "current-world synthesis",
        control: "facts, assumptions, unknowns, and source gaps stay separated",
      },
      {
        label: "Accuracy mode",
        state: "enforced",
        keepsFromFrontiers: "fast useful synthesis",
        control: "unsupported claims become assumptions or unknowns; blocked routes return a source path or next safe step, not fake certainty",
      },
      {
        label: "Action gate",
        state: "gated",
        keepsFromFrontiers: "tool use and automation",
        control: "files, accounts, devices, sends, and spend require scoped approval",
      },
      {
        label: "Model routing",
        state: "enforced",
        keepsFromFrontiers: "specialist model strengths",
        control: "frontier models stay proposer_only and cannot override policy",
      },
      {
        label: "Canonical promotion",
        state: "enforced",
        keepsFromFrontiers: "creative and probabilistic generation",
        control: "nothing becomes truth, memory, or action until doctrine, source state, consent, and receipts allow it",
      },
    ],
    doctrine: [
      "Probabilistic engines propose; canonical runtime verifies, gates, records, and promotes.",
      "The model proposes; the governed runtime validates and executes.",
      "The frontier knows the world; the mirror knows its user.",
      "Contextual memory actualization is consent-gated.",
      "Accuracy without fabrication: blocked or unverified routes return facts, assumptions, unknowns, source gaps, and the next safe step.",
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
