"use client";

import { motion } from "motion/react";
import {
  BookOpen,
  Play,
  ShieldCheck,
  Wrench,
  Swords,
  Briefcase,
} from "lucide-react";
import type { MirrorMode } from "@/lib/mirror/types";

const modes: { mode: MirrorMode; label: string; icon: typeof BookOpen }[] = [
  { mode: "explain", label: "Explain", icon: BookOpen },
  { mode: "demo", label: "Demo", icon: Play },
  { mode: "audit", label: "Audit", icon: ShieldCheck },
  { mode: "build", label: "Build", icon: Wrench },
  { mode: "red_team", label: "Red Team", icon: Swords },
  { mode: "sales", label: "Sales", icon: Briefcase },
];

interface JourneyModeChipsProps {
  activeMode: MirrorMode;
  onSelect: (mode: MirrorMode) => void;
}

export default function JourneyModeChips({
  activeMode,
  onSelect,
}: JourneyModeChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap justify-center gap-2 px-5 lg:gap-2.5"
    >
      {modes.map((m) => {
        const isActive = activeMode === m.mode;
        return (
          <button
            key={m.mode}
            onClick={() => onSelect(m.mode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white/60 backdrop-blur-sm text-gray-600 border border-gray-200/80 hover:bg-white hover:border-blue-200 hover:text-blue-600"
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        );
      })}
    </motion.div>
  );
}
