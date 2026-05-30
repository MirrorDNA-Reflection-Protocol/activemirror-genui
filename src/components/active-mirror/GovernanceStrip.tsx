"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  Lightbulb,
  ShieldAlert,
  Ban,
  ChevronDown,
  ChevronUp,
  User,
  Database,
  Lock,
} from "lucide-react";
import type {
  AutonomyLevel,
  MemoryBoundary,
  AgentIdentity,
} from "@/lib/mirror/types";

const AUTONOMY_CONFIG: Record<
  AutonomyLevel,
  { label: string; icon: typeof Eye; color: string }
> = {
  observe: {
    label: "Observe only",
    icon: Eye,
    color: "bg-blue-100 text-blue-700",
  },
  advise: {
    label: "Advice only",
    icon: Lightbulb,
    color: "bg-green-100 text-green-700",
  },
  act_with_approval: {
    label: "Approval required",
    icon: ShieldAlert,
    color: "bg-amber-100 text-amber-700",
  },
  autonomous_blocked: {
    label: "Autonomous action blocked",
    icon: Ban,
    color: "bg-red-100 text-red-700",
  },
};

interface GovernanceStripProps {
  autonomyLevel: AutonomyLevel;
  authorityBoundary: string[];
  memoryBoundary: MemoryBoundary;
  agentIdentity: AgentIdentity;
}

export default function GovernanceStrip({
  autonomyLevel,
  authorityBoundary,
  memoryBoundary,
  agentIdentity,
}: GovernanceStripProps) {
  const [showAuthority, setShowAuthority] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);

  const auto = AUTONOMY_CONFIG[autonomyLevel];
  const AutoIcon = auto.icon;

  return (
    <div className="space-y-2">
      {/* Autonomy pill */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${auto.color}`}
        >
          <AutoIcon className="w-3.5 h-3.5" />
          {auto.label}
        </span>

        {/* Schema badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
          <Lock className="w-3 h-3" />
          Schema-rendered
        </span>
      </div>

      {/* Collapsible sections */}
      <div className="space-y-1.5">
        {/* Authority Boundary */}
        <CollapsibleSection
          label="Authority Boundary"
          icon={<ShieldAlert className="w-3.5 h-3.5 text-gray-500" />}
          open={showAuthority}
          onToggle={() => setShowAuthority(!showAuthority)}
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {authorityBoundary.map((item) => {
              const isNegative = item.toLowerCase().startsWith("cannot");
              return (
                <span
                  key={item}
                  className={`inline-flex px-2.5 py-1 rounded-lg text-xs ${
                    isNegative
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-green-50 text-green-600 border border-green-100"
                  }`}
                >
                  {item}
                </span>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* Memory Boundary */}
        <CollapsibleSection
          label="Memory Boundary"
          icon={<Database className="w-3.5 h-3.5 text-gray-500" />}
          open={showMemory}
          onToggle={() => setShowMemory(!showMemory)}
        >
          <div className="grid grid-cols-2 gap-2 pt-2">
            <MemoryRow
              label="Session memory"
              active={memoryBoundary.session}
            />
            <MemoryRow
              label="Vault memory"
              active={memoryBoundary.vault}
              note="Not connected in demo"
            />
            <MemoryRow
              label="Client data"
              active={memoryBoundary.client_data}
              note="Not available"
            />
            <MemoryRow
              label="Proof trail"
              active={memoryBoundary.proof_trail}
            />
            <MemoryRow
              label="Sales memory"
              active={memoryBoundary.sales_memory}
              note="Optional"
            />
          </div>
        </CollapsibleSection>

        {/* Agent Identity */}
        <CollapsibleSection
          label="Agent Identity"
          icon={<User className="w-3.5 h-3.5 text-gray-500" />}
          open={showIdentity}
          onToggle={() => setShowIdentity(!showIdentity)}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 text-xs">
            <span className="text-gray-500">Acting as</span>
            <span className="text-gray-800 font-medium">
              {agentIdentity.acting_as}
            </span>
            <span className="text-gray-500">Delegated by</span>
            <span className="text-gray-800 font-medium">
              {agentIdentity.delegated_by}
            </span>
            <span className="text-gray-500">Scope</span>
            <span className="text-gray-800 font-medium">
              {agentIdentity.scope}
            </span>
            <span className="text-gray-500">Expires</span>
            <span className="text-gray-800 font-medium">
              {agentIdentity.expires}
            </span>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

function CollapsibleSection({
  label,
  icon,
  open,
  onToggle,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white/60 backdrop-blur-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-gray-700">{label}</span>
        </div>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MemoryRow({
  label,
  active,
  note,
}: {
  label: string;
  active: boolean;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          active ? "bg-green-400" : "bg-gray-300"
        }`}
      />
      <span className="text-gray-600">
        {label}
        {!active && note && (
          <span className="text-gray-400 ml-1">({note})</span>
        )}
      </span>
    </div>
  );
}
