"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileSearch, X, ChevronDown, ChevronUp } from "lucide-react";
import type { EvidenceItem } from "@/lib/mirror/types";

interface ProofDrawerProps {
  evidence: EvidenceItem[];
  isAdmin?: boolean;
}

const CONFIDENCE_STYLES = {
  low: "bg-amber-100 text-amber-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-green-100 text-green-700",
};

const APPROVAL_STYLES = {
  not_required: "bg-gray-100 text-gray-600",
  required: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};

export default function ProofDrawer({ evidence, isAdmin = false }: ProofDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/80 text-sm text-gray-600 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all"
      >
        <FileSearch className="w-4 h-4" />
        Show Proof
      </button>

      {/* Drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl lg:left-auto lg:right-0 lg:top-0 lg:bottom-0 lg:w-[480px] lg:max-h-full lg:rounded-t-none lg:rounded-l-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Proof Trail
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close proof drawer"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Demo notice */}
              <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
                [DEMO] These values are simulated for demonstration purposes.
                No live backend is connected.
              </div>

              {/* Evidence items */}
              <div className="p-5 space-y-3">
                {evidence.map((item, i) => (
                  <EvidenceCard key={i} item={item} index={i} isAdmin={isAdmin} />
                ))}
              </div>

              {/* Schema badge */}
              <div className="px-5 pb-5">
                <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-medium text-gray-700">
                    Schema-rendered UI, not model-rendered code
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    The model proposes interface intent. MirrorGate validates
                    it. The approved component catalog renders it.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function EvidenceCard({ item, index, isAdmin }: { item: EvidenceItem; index: number; isAdmin?: boolean }) {
  const [expanded, setExpanded] = useState(index === 0);
  const actualApprovalState = (isAdmin && item.approval_state === "required") ? "approved" : item.approval_state;

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800 pr-4 line-clamp-1">
          {item.claim}
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
              <Row label="Source" value={item.source} />
              <Row
                label="Confidence"
                value={
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      CONFIDENCE_STYLES[item.confidence]
                    }`}
                  >
                    {item.confidence}
                  </span>
                }
              />
              <Row label="Last Updated" value={item.last_updated} />
              <Row label="Model Used" value={item.model_used} />
              <Row label="Policy Check" value={item.policy_check} />
              <Row
                label="Approval State"
                value={
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      APPROVAL_STYLES[actualApprovalState]
                    }`}
                  >
                    {actualApprovalState.replace("_", " ")} {isAdmin && item.approval_state === "required" && "(Override)"}
                  </span>
                }
              />
              <Row
                label="Audit Event ID"
                value={
                  <code className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                    {item.audit_event_id}
                  </code>
                }
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-800 text-right">{value}</span>
    </div>
  );
}
