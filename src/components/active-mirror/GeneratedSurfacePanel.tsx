"use client";

import { motion } from "motion/react";
import { Sparkles, Volume2 } from "lucide-react";
import type { MirrorSurfaceSpec, MirrorMode } from "@/lib/mirror/types";
import JourneyModeChips from "./JourneyModeChips";
import MirrorComponentRenderer from "./MirrorComponentRenderer";
import GovernanceStrip from "./GovernanceStrip";
import ProofDrawer from "./ProofDrawer";
import RedTeamDrawer from "./RedTeamDrawer";
import LeadCaptureCard from "./LeadCaptureCard";

interface GeneratedSurfacePanelProps {
  surface: MirrorSurfaceSpec; // This might be partial during streaming
  onModeChange: (mode: MirrorMode) => void;
  onPromptSelect: (prompt: string) => void;
  isAdmin?: boolean;
}

export default function GeneratedSurfacePanel({
  surface,
  onModeChange,
  onPromptSelect,
  isAdmin = false,
}: GeneratedSurfacePanelProps) {
  // Defensive defaults for streaming partial data
  const mode = surface?.mode || "explain";
  const title = surface?.title || "Generating Surface...";
  const summary = surface?.summary || "Preparing the reviewed workspace and formatting the useful output...";
  const autonomyLevel = surface?.autonomy_level || "observe";
  const authorityBoundary = surface?.authority_boundary || [];
  const memoryBoundary = surface?.memory_boundary || { session: true, vault: false, client_data: false, proof_trail: false, sales_memory: false };
  const agentIdentity = surface?.agent_identity || { acting_as: "Orchestrator", delegated_by: "System", scope: "Initial", expires: "Session" };
  const components = surface?.components || [];
  const evidence = surface?.evidence || [];
  const actions = surface?.actions || [];
  const suggestedPrompts = surface?.suggested_prompts || [];

  const handleTTS = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-0 sm:mx-5 mt-6 lg:mx-auto lg:max-w-4xl xl:max-w-5xl"
    >
      <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/30 via-white/60 to-orange-50/20 backdrop-blur-xl shadow-[0_2px_32px_rgba(59,130,246,0.08)] overflow-hidden">
        {/* Panel header */}
        <div className="px-4 pt-5 pb-4 lg:px-6 lg:pt-6 lg:pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-500 uppercase tracking-wider">
                Generated Surface
              </span>
            </div>
            <button
              onClick={handleTTS}
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
              title="Listen to summary"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {summary}
          </p>

          {/* Morphic Agentic Thought Stream */}
          {surface?.thought_process && surface.thought_process.length > 0 && (
            <div className="mt-4 space-y-2">
              {surface.thought_process.map((thought, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs font-mono text-gray-500"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  {thought}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Journey mode chips */}
        <div className="px-4 pb-4 lg:px-6 overflow-x-auto pb-2 scrollbar-hide">
          <JourneyModeChips
            activeMode={mode}
            onSelect={onModeChange}
          />
        </div>

        {/* Governance strip */}
        <div className="px-4 pb-4 lg:px-6">
          <GovernanceStrip
            autonomyLevel={autonomyLevel}
            authorityBoundary={authorityBoundary}
            memoryBoundary={memoryBoundary}
            agentIdentity={agentIdentity}
          />
        </div>

        {/* Component cards */}
        <div className="px-4 pb-4 lg:px-6">
          <MirrorComponentRenderer components={components} onAction={onPromptSelect} />
        </div>

        {/* Lead capture for high intent */}
        {surface?.lead_intent === "high" && (
          <div className="px-4 pb-4 lg:px-6">
            <LeadCaptureCard />
          </div>
        )}

        {/* Red team drawer for red_team mode */}
        {mode === "red_team" && (
          <div className="px-4 pb-4 lg:px-6">
            <RedTeamDrawer />
          </div>
        )}

        {/* Actions row */}
        <div className="px-4 pb-4 lg:px-6 flex flex-wrap items-center gap-2">
          {evidence.length > 0 && <ProofDrawer evidence={evidence} isAdmin={isAdmin} />}

          {actions.map((action, i) => {
            if (!action || !action.label) return null;
            const isBlocked = action.requires_approval && !isAdmin;
            return (
              <button
                key={i}
                onClick={() => {
                  if (isBlocked) return;
                  if (action.action_type === "suggest_prompt") {
                    onPromptSelect(action.label);
                  }
                }}
                disabled={isBlocked}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-all text-sm
                  ${isBlocked 
                    ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-70" 
                    : "bg-white/60 backdrop-blur-sm border-gray-200/80 text-gray-600 hover:bg-white hover:border-blue-200 hover:text-blue-600"}
                `}
              >
                {action.label}
                {action.requires_approval && (
                  <span className={`ml-1 w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-green-400" : "bg-amber-400 animate-pulse"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Suggested prompts */}
        {suggestedPrompts.length > 0 && (
          <div className="px-4 pb-5 lg:px-6 lg:pb-6">
            <p className="text-xs text-gray-400 mb-2 font-medium">
              Suggested next
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, i) => prompt ? (
                <button
                  key={i}
                  onClick={() => onPromptSelect(prompt)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-100/60 text-xs text-blue-600 hover:bg-blue-100/60 hover:border-blue-200 transition-all text-left"
                >
                  {prompt}
                </button>
              ) : null)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
