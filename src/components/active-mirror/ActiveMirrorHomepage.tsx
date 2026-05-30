"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { MirrorMode, MirrorSurfaceSpec } from "@/lib/mirror/types";
import { getDemoSurfaceSpec, getSurfaceByMode } from "@/lib/mirror/demo-surfaces";
import MirrorHeader from "./MirrorHeader";
import HeroSection from "./HeroSection";
import AIJourneyPrompt from "./AIJourneyPrompt";
import CategoryIcons from "./CategoryIcons";
import GenUIPanel from "./GenUIPanel";
import GeneratedSurfacePanel from "./GeneratedSurfacePanel";
import PersistentChatBar from "./PersistentChatBar";

export default function ActiveMirrorHomepage() {
  const [surface, setSurface] = useState<MirrorSurfaceSpec | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handlePromptSubmit = useCallback((prompt: string) => {
    const spec = getDemoSurfaceSpec(prompt);
    setSurface(spec);
    setHasInteracted(true);
  }, []);

  const handleModeChange = useCallback((mode: MirrorMode) => {
    const spec = getSurfaceByMode(mode);
    setSurface(spec);
  }, []);

  const handlePromptSelect = useCallback((prompt: string) => {
    const spec = getDemoSurfaceSpec(prompt);
    setSurface(spec);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white to-blue-50/80" />
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-orange-100/40 to-transparent blur-3xl animate-drift-slow" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-tl from-blue-100/40 to-transparent blur-3xl animate-drift-slow-reverse" />
        <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-violet-50/30 to-transparent blur-3xl animate-drift-medium" />
      </div>

      {/* Content */}
      <div className="relative pb-24 lg:pb-28">
        <MirrorHeader />

        <AnimatePresence mode="wait">
          {!hasInteracted ? (
            <motion.div
              key="landing"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSection />
              <AIJourneyPrompt onSubmit={handlePromptSubmit} />
              <CategoryIcons />
              <GenUIPanel />
            </motion.div>
          ) : (
            <motion.div
              key="surface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Compact hero when surface is shown */}
              <div className="text-center px-6 pt-4 pb-2 lg:pt-6">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Active Mirror
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Governed AI Interface
                </p>
              </div>

              {surface && (
                <GeneratedSurfacePanel
                  surface={surface}
                  onModeChange={handleModeChange}
                  onPromptSelect={handlePromptSelect}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PersistentChatBar onSubmit={handlePromptSubmit} />
    </div>
  );
}
