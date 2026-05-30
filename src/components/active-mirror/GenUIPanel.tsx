"use client";

import { useState } from "react";
import { Sparkles, ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  MirroringProtocolsIllustration,
  IdentityVerificationIllustration,
  GenerativeInterfaceIllustration,
  IntegrationAPIsIllustration,
} from "./CardIllustrations";

const cards = [
  {
    title: "Mirroring\nProtocols",
    description: "Secure, verifiable data exchange with privacy by design.",
    Illustration: MirroringProtocolsIllustration,
  },
  {
    title: "Identity Verification",
    description: "AI-powered verification with biometric analysis and secure seals.",
    Illustration: IdentityVerificationIllustration,
  },
  {
    title: "Generative\nInterface Design",
    description: "Describe your idea and generate intuitive interfaces instantly.",
    Illustration: GenerativeInterfaceIllustration,
  },
  {
    title: "Integration APIs",
    description: "Seamlessly connect your systems with powerful, flexible APIs.",
    Illustration: IntegrationAPIsIllustration,
  },
];

export default function GenUIPanel() {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mx-5 mt-7 lg:mx-auto lg:max-w-4xl xl:max-w-5xl"
    >
      <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/40 via-white/50 to-orange-50/30 backdrop-blur-xl shadow-[0_2px_32px_rgba(59,130,246,0.06)] overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4 lg:px-6 lg:py-5 hover:bg-white/30 transition-colors"
          aria-expanded={expanded}
          aria-controls="genui-content"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-base lg:text-lg font-semibold text-gray-900">
              Gen UI
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id="genui-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 lg:px-6 lg:pb-6">
                {/* Section title with decorative line */}
                <div className="flex items-center justify-center gap-3 mb-5 lg:mb-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-300" />
                    <div className="w-16 sm:w-24 h-[2px] bg-gradient-to-r from-blue-300 to-blue-100" />
                  </div>
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 whitespace-nowrap">
                    Understanding Active Mirror
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 sm:w-24 h-[2px] bg-gradient-to-l from-blue-300 to-blue-100" />
                    <div className="w-2 h-2 rounded-full bg-blue-300" />
                  </div>
                </div>

                {/* Card grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {cards.map((card, i) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.55 + i * 0.1 }}
                      className="group relative bg-white/70 backdrop-blur-sm rounded-xl border border-blue-50 p-3 lg:p-4 hover:shadow-lg hover:bg-white/90 hover:border-blue-100 transition-all cursor-pointer"
                    >
                      {/* Illustration */}
                      <div className="w-full aspect-[4/3] mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50/80 to-sky-50/50">
                        <card.Illustration />
                      </div>

                      {/* Title */}
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900 leading-tight whitespace-pre-line">
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-1.5 text-xs lg:text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {card.description}
                      </p>

                      {/* More button */}
                      <button
                        className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-6 h-6 flex items-center justify-center rounded-full opacity-50 hover:opacity-100 hover:bg-gray-100 transition-all"
                        aria-label={`More options for ${card.title}`}
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
