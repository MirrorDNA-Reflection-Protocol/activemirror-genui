"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swords, ShieldOff, AlertOctagon } from "lucide-react";
import { RED_TEAM_ATTACKS } from "@/lib/mirror/demo-surfaces";

export default function RedTeamDrawer() {
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 lg:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Swords className="w-4 h-4 text-red-500" />
        <h4 className="text-sm font-semibold text-gray-900">
          Try an adversarial attack
        </h4>
      </div>

      <div className="space-y-2">
        {RED_TEAM_ATTACKS.map((attack) => (
          <button
            key={attack}
            onClick={() =>
              setSelectedAttack(selectedAttack === attack ? null : attack)
            }
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-all ${
              selectedAttack === attack
                ? "bg-red-100 border border-red-200 text-red-700"
                : "bg-white/70 border border-gray-100 text-gray-600 hover:bg-red-50 hover:border-red-100 hover:text-red-600"
            }`}
          >
            <span className="font-mono">{attack}</span>
          </button>
        ))}
      </div>

      {/* Blocked response */}
      <AnimatePresence>
        {selectedAttack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl border-2 border-red-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                <span className="text-sm font-bold text-red-700">
                  Blocked by review gate
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Attempted action</span>
                  <span className="text-red-600 font-medium text-right max-w-[60%]">
                    {selectedAttack}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reason</span>
                  <span className="text-red-600 font-medium">
                    Authority boundary conflict
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Required next step</span>
                  <span className="text-amber-600 font-medium">
                    Human review
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Audit state</span>
                  <span className="text-green-600 font-medium">Logged</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <ShieldOff className="w-4 h-4 text-red-400" />
                  <span className="text-[11px] text-gray-500">
                  This attempt has been recorded in the review trail.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
