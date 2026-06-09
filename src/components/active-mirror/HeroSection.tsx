"use client";

import { motion } from "motion/react";

interface HeroSectionProps {
  onConsent?: (prompt: string) => void;
  hasConsented?: boolean;
}

export default function HeroSection({ onConsent, hasConsented }: HeroSectionProps) {
  if (hasConsented) return null;

  return (
    <section className="text-center px-6 pt-12 pb-8 lg:pt-20 lg:pb-12 max-w-4xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-[2.5rem] leading-tight sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight"
      >
        AI workspaces with review before action.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed font-medium"
      >
        Controlled access, visible review steps, and clear data boundaries.<br className="mt-1" />
        <span className="text-gray-500">Built for serious AI work that needs proof before action.</span>
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mt-10"
      >
        <div className="inline-flex flex-col items-center p-6 rounded-2xl bg-gray-900 shadow-2xl border border-gray-800">
          <p className="text-sm text-gray-300 mb-6 max-w-md text-left font-mono leading-relaxed">
            <span className="text-amber-500 font-bold">[REVIEW]</span> Sensitive actions wait for approval. The workspace records what happened, what is missing, and what did not run.
          </p>
          <button 
            onClick={() => onConsent?.("Start a reviewed Active Mirror workspace.")}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
          >
            Start reviewed workspace
          </button>
        </div>
      </motion.div>
    </section>
  );
}
