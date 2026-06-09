"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface AIJourneyPromptProps {
  onSubmit: (prompt: string) => void;
}

export default function AIJourneyPrompt({ onSubmit }: AIJourneyPromptProps) {
  const [value, setValue] = useState("Build a reviewed workflow for a real business task.");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="mx-5 mt-6 lg:mx-auto lg:max-w-2xl"
    >
      <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-4 lg:p-5">
        {/* Label */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            AI Journey Start
          </span>
        </div>

        {/* Input row */}
        <div className="flex items-center gap-3 bg-white/70 rounded-xl border border-gray-100 px-4 py-3 lg:py-3.5">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-transparent text-sm lg:text-base text-gray-800 placeholder-gray-400 outline-none"
            placeholder="Ask anything..."
            aria-label="Ask Active Mirror"
          />
          <button
            onClick={handleSubmit}
            className="w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            aria-label="Send prompt"
          >
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
