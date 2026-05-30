"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import type { MirrorSurfaceSpec, MirrorMode } from "@/lib/mirror/types";
import JourneyModeChips from "./JourneyModeChips";
import MirrorComponentRenderer from "./MirrorComponentRenderer";
import GovernanceStrip from "./GovernanceStrip";
import ProofDrawer from "./ProofDrawer";
import RedTeamDrawer from "./RedTeamDrawer";
import LeadCaptureCard from "./LeadCaptureCard";

interface GeneratedSurfacePanelProps {
  surface: MirrorSurfaceSpec;
  onModeChange: (mode: MirrorMode) => void;
  onPromptSelect: (prompt: string) => void;
}

export default function GeneratedSurfacePanel({
  surface,
  onModeChange,
  onPromptSelect,
}: GeneratedSurfacePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-5 mt-6 lg:mx-auto lg:max-w-4xl xl:max-w-5xl"
    >
      <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/30 via-white/60 to-orange-50/20 backdrop-blur-xl shadow-[0_2px_32px_rgba(59,130,246,0.08)] overflow-hidden">
        {/* Panel header */}
        <div className="px-5 pt-5 pb-4 lg:px-6 lg:pt-6 lg:pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-500 uppercase tracking-wider">
              Generated Surface
            </span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">
            {surface.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {surface.summary}
          </p>
        </div>

        {/* Journey mode chips */}
        <div className="px-5 pb-4 lg:px-6">
          <JourneyModeChips
            activeMode={surface.mode}
            onSelect={onModeChange}
          />
        </div>

        {/* Governance strip */}
        <div className="px-5 pb-4 lg:px-6">
          <GovernanceStrip
            autonomyLevel={surface.autonomy_level}
            authorityBoundary={surface.authority_boundary}
            memoryBoundary={surface.memory_boundary}
            agentIdentity={surface.agent_identity}
          />
        </div>

        {/* Component cards */}
        <div className="px-5 pb-4 lg:px-6">
          <MirrorComponentRenderer components={surface.components} />
        </div>

        {/* Lead capture for high intent */}
        {surface.lead_intent === "high" && (
          <div className="px-5 pb-4 lg:px-6">
            <LeadCaptureCard />
          </div>
        )}

        {/* Red team drawer for red_team mode */}
        {surface.mode === "red_team" && (
          <div className="px-5 pb-4 lg:px-6">
            <RedTeamDrawer />
          </div>
        )}

        {/* Actions row */}
        <div className="px-5 pb-4 lg:px-6 flex flex-wrap items-center gap-2">
          <ProofDrawer evidence={surface.evidence} />

          {surface.actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                if (action.action_type === "suggest_prompt") {
                  onPromptSelect(action.label);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/80 text-sm text-gray-600 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all"
            >
              {action.label}
              {action.requires_approval && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* Suggested prompts */}
        <div className="px-5 pb-5 lg:px-6 lg:pb-6">
          <p className="text-xs text-gray-400 mb-2 font-medium">
            Suggested next
          </p>
          <div className="flex flex-wrap gap-2">
            {surface.suggested_prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onPromptSelect(prompt)}
                className="px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-100/60 text-xs text-blue-600 hover:bg-blue-100/60 hover:border-blue-200 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
