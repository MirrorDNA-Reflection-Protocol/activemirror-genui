"use client";

import { ShieldCheck, Network, BrainCircuit, KeySquare } from "lucide-react";
import { motion } from "motion/react";

const categories = [
  { icon: ShieldCheck, label: "Chetana API", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", prompt: "[SYSTEM AUTO-TRIGGER: Route to Chetana Shield API and analyze synthetic media risks]" },
  { icon: BrainCircuit, label: "MirrorBrain", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", prompt: "[SYSTEM AUTO-TRIGGER: Explore MirrorBrain Sovereign Consciousness Layer and QualiaEngine]" },
  { icon: KeySquare, label: "LingOS State", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", prompt: "[SYSTEM AUTO-TRIGGER: Trigger LingOS Cryptographic State Audit with Ed25519 hash chain]" },
  { icon: Network, label: "6-Tier Router", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", prompt: "[SYSTEM AUTO-TRIGGER: Explain the 6-Tier Model Router and local vs cloud governance]" },
];

interface CategoryIconsProps {
  onSelect?: (category: string) => void;
}

export default function CategoryIcons({ onSelect }: CategoryIconsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="flex justify-center gap-6 sm:gap-8 lg:gap-10 mt-7 lg:mt-10 px-6"
    >
      {categories.map((cat, i) => (
        <motion.button
          key={cat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
          onClick={() => onSelect?.(cat.prompt)}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-2xl ${cat.bg} ${cat.border} border flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all`}
          >
            <cat.icon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${cat.color}`} />
          </div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            {cat.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
