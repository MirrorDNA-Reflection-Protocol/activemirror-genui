"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, ScanFace, CheckCircle2 } from "lucide-react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import type { MirrorMode, MirrorSurfaceSpec } from "@/lib/mirror/types";
import { getSurfaceByMode } from "@/lib/mirror/demo-surfaces";
import MirrorHeader from "./MirrorHeader";
import HeroSection from "./HeroSection";
import AIJourneyPrompt from "./AIJourneyPrompt";
import CategoryIcons from "./CategoryIcons";
import GenUIPanel from "./GenUIPanel";
import PersistentChatBar from "./PersistentChatBar";
import ErrorBoundary from "./ErrorBoundary";
import SpatialCanvas from "./SpatialCanvas";

import { mirrorSurfaceSchema } from "@/lib/mirror/schema";

export default function ActiveMirrorHomepage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vaultSyncing, setVaultSyncing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authStatus, setAuthStatus] = useState("INITIATING SCAN...");

  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAuthStatus("BIOMETRIC VERIFICATION...");
      await new Promise(resolve => setTimeout(resolve, 800));
      setAuthStatus("CLEARANCE GRANTED: MD");
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsAuthenticating(false);
    };
    sequence();
  }, []);

  const { submit, object: partialSurface, isLoading, error } = useObject({
    api: "/api/mirror/query",
    schema: mirrorSurfaceSchema,
  });

  const handlePromptSubmit = useCallback((prompt: string) => {
    setHasInteracted(true);
    
    // Memory Context
    let vaultContext = "";
    if (typeof window !== "undefined") {
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes("my name is ")) {
        const name = prompt.split(/my name is /i)[1].split(/[.,]/)[0];
        localStorage.setItem("mirror_user_name", name);
        setVaultSyncing(true);
        setTimeout(() => setVaultSyncing(false), 2000);
      }
      const storedName = localStorage.getItem("mirror_user_name");
      if (storedName) {
        vaultContext = `[VAULT CONTEXT: The user's name is ${storedName}. Address them by name.]\n\n`;
      }
    }

    const newMessages: { role: "user" | "assistant"; content: string }[] = [
      ...messages,
      { role: "user", content: vaultContext + prompt }
    ];
    setMessages(newMessages);
    submit({ messages: newMessages });
  }, [messages, submit]);

  const handleModeChange = useCallback((mode: MirrorMode) => {
    const spec = getSurfaceByMode(mode);
    // Not streaming for instant mode switches, but we can't easily set useObject state.
    // For a real app we might bypass useObject or use a separate state.
    // For now, we simulate a prompt to the AI to re-generate the surface in that mode.
    handlePromptSubmit(`Switch to ${mode} mode and explain its value.`);
  }, [handlePromptSubmit]);

  const handlePromptSelect = useCallback((prompt: string) => {
    handlePromptSubmit(prompt);
  }, [handlePromptSubmit]);

  return (
    <div className="relative min-h-screen">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white to-blue-50/80" />
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-orange-100/40 to-transparent blur-3xl animate-drift-slow" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-tl from-blue-100/40 to-transparent blur-3xl animate-drift-slow-reverse" />
        <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-violet-50/30 to-transparent blur-3xl animate-drift-medium" />
      </div>

      <div className="relative pb-24 lg:pb-28 flex flex-col min-h-screen overflow-hidden">
        {/* Biometric Pre-Auth Interstitial */}
        <AnimatePresence>
          {isAuthenticating && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
            >
              <div className="relative">
                <motion.div 
                  animate={{ y: [0, 80, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                />
                <ScanFace className="w-20 h-20 text-gray-800" />
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 font-mono text-xs text-blue-500 tracking-[0.3em] flex items-center gap-2"
              >
                {authStatus === "CLEARANCE GRANTED: MD" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                <span className={authStatus === "CLEARANCE GRANTED: MD" ? "text-emerald-500" : ""}>
                  {authStatus}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <MirrorHeader 
          vaultSyncing={vaultSyncing} 
          onAutoPrompt={handlePromptSubmit}
        />

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!hasInteracted ? (
              <motion.div
              key="landing"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <HeroSection onConsent={handlePromptSubmit} />
              <AIJourneyPrompt onSubmit={handlePromptSubmit} />
              <CategoryIcons onSelect={handlePromptSubmit} />
              <GenUIPanel onSelect={handlePromptSubmit} />
            </motion.div>
          ) : (
            <motion.div
              key="surface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="px-2"
            >
              <div className="mx-4 lg:mx-8 xl:mx-12 mt-4 lg:mt-8 h-[75vh] w-full rounded-2xl overflow-hidden relative">
                {error && (
                  <div className="absolute top-4 right-4 z-50 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm shadow-xl">
                    <strong>Connection Error:</strong> {error.message}
                  </div>
                )}
                {isLoading && !partialSurface && !error && (
                  <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md border border-gray-200">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Generating UI...</span>
                  </div>
                )}
                <SpatialCanvas 
                  messages={messages} 
                  partialSurface={partialSurface} 
                  isLoading={isLoading} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <PersistentChatBar onSubmit={handlePromptSubmit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
