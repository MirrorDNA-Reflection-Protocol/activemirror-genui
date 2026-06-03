"use client";

import React, { useMemo } from "react";
import {
  Bot,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe,
  LineChart,
  LockKeyhole,
  MailPlus,
  PlayCircle,
  ShieldCheck,
  Workflow,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { downloadMarkdownArtifact } from "@/lib/mirror/downloadArtifact";
import type { PluginLane } from "@/lib/mirror/lingos";

interface PluginDockSurfaceProps {
  title: string;
  content: string;
  onClose?: () => void;
}

const ICONS = {
  browser: Globe,
  document: FileText,
  chart: LineChart,
  automation: Workflow,
  media: PlayCircle,
  review: ShieldCheck,
  lead: MailPlus,
};

const STATE_STYLE: Record<PluginLane["state"], string> = {
  prepared: "border-blue-100 bg-blue-50 text-blue-700",
  source_ready: "border-sky-100 bg-sky-50 text-sky-700",
  export_ready: "border-emerald-100 bg-emerald-50 text-emerald-700",
  review_required: "border-amber-100 bg-amber-50 text-amber-700",
  gated: "border-gray-200 bg-gray-100 text-gray-700",
};

function parseLanes(content: string): PluginLane[] {
  try {
    const parsed = JSON.parse(content) as { lanes?: PluginLane[] } | PluginLane[];
    const lanes = Array.isArray(parsed) ? parsed : parsed.lanes;
    if (Array.isArray(lanes)) return lanes.filter((lane) => lane?.id && lane?.label).slice(0, 6);
  } catch {
    return [];
  }
  return [];
}

function stateLabel(state: PluginLane["state"]) {
  return state.replace(/_/g, " ");
}

export default function PluginDockSurface({ title, content, onClose }: PluginDockSurfaceProps) {
  const lanes = useMemo(() => parseLanes(content), [content]);

  const downloadDock = () => {
    const markdown = [
      `# ${title || "Capability Dock"}`,
      "",
      "These are prepared capability lanes for this request. They do not claim external execution until reviewed access or a real tool run completes.",
      "",
      ...lanes.map((lane) => [
        `## ${lane.label}`,
        `- State: ${stateLabel(lane.state)}`,
        `- Action: ${lane.action}`,
        `- Description: ${lane.description}`,
        `- Proof: ${lane.proof}`,
        lane.targetUrl ? `- Target: ${lane.targetUrl}` : "",
      ].filter(Boolean).join("\n")),
    ].join("\n");
    downloadMarkdownArtifact(title || "Capability Dock", markdown);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 16, scale: 0.98, filter: "blur(8px)" }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-950 px-5 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{title || "Capability Dock"}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-white/45">Prepared tool lanes</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={downloadDock}
            disabled={lanes.length === 0}
            aria-label="Download capability dock"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} aria-label="Close capability dock" className="flex h-7 w-7 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-red-500/15 hover:text-red-200">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fbfcff_0%,#ffffff_55%,#f8fafc_100%)] p-4">
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Execution truth</div>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Active Mirror prepares the right lane first. Browser, media, automation, device, and send actions remain reviewed or gated until they actually run.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {lanes.map((lane) => {
            const Icon = ICONS[lane.icon] || Bot;
            const isOpenable = lane.targetUrl && lane.state === "source_ready";
            return (
              <article key={lane.id} className="group flex min-h-[190px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${STATE_STYLE[lane.state] || STATE_STYLE.prepared}`}>
                    {stateLabel(lane.state)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-950">{lane.label}</h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-gray-600">{lane.description}</p>
                <div className="mt-3 rounded-lg bg-gray-50 p-2.5 text-[11px] leading-5 text-gray-500">
                  <div className="flex items-start gap-1.5">
                    {lane.state === "gated" || lane.state === "review_required" ? <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                    <span>{lane.proof}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => lane.targetUrl && window.open(lane.targetUrl, "_blank", "noopener,noreferrer")}
                  disabled={!isOpenable}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white"
                >
                  {lane.action}
                  {isOpenable && <ExternalLink className="h-3.5 w-3.5" />}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
