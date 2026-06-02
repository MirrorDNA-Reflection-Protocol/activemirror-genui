"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Mic, MicOff, ArrowLeft, Plus } from "lucide-react";
import { useA2UIStream } from "@/lib/mirror/useA2UIStream";
import Image from "next/image";
import TriPanelLayout from "./TriPanelLayout";

const PLACEHOLDERS = [
  "Write a project proposal...",
  "Map out a system architecture...",
  "Analyze market trends with charts...",
  "Research competitor strategies...",
  "Draft a compliance report...",
];

export default function ActiveMirrorHomepage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { submit, a2uiState, isLoading, error } = useA2UIStream("/api/mirror/stream");

  useEffect(() => { setMounted(true); }, []);

  // Cycle placeholder text
  useEffect(() => {
    if (hasInteracted) return;
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hasInteracted]);

  // Focus input
  useEffect(() => {
    if (mounted && !hasInteracted && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 800);
    }
  }, [mounted, hasInteracted]);

  // Speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) setInputValue(prev => (prev + " " + final).trim());
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    setRecognition(rec);
  }, []);

  const handleSubmit = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setHasInteracted(true);
    setInputValue("");
    if (isListening) { recognition?.stop(); setIsListening(false); }
    const next: { role: "user" | "assistant"; content: string }[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    submit({ messages: next });
  }, [messages, submit, isListening, recognition]);

  const handleReset = useCallback(() => {
    setHasInteracted(false);
    setMessages([]);
    setInputValue("");
  }, []);

  const toggleListening = () => {
    if (isListening) recognition?.stop();
    else { setInputValue(""); recognition?.start(); setIsListening(true); }
  };

  const isEmpty = inputValue.trim().length === 0;

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] overflow-hidden">
      {/* Ultra-subtle background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fafafa] to-[#f5f5f7]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-blue-50/40 to-violet-50/20 blur-3xl animate-drift-slow" />
      </div>

      <AnimatePresence mode="wait">
        {!hasInteracted ? (
          /* ═══════ LANDING ═══════ */
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            {mounted && (
              <>
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 120, delay: 0.1 }}
                  className="mb-8"
                >
                  <Image
                    src="/logo.png"
                    alt="Active Mirror"
                    width={56}
                    height={56}
                    className="w-14 h-14 object-contain"
                    priority
                  />
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-4xl sm:text-5xl font-semibold text-[#1d1d1f] tracking-tight text-center leading-[1.1]"
                >
                  Governed AI. Delivered.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="text-[15px] text-[#86868b] mt-4 text-center max-w-lg leading-relaxed"
                >
                  We build and operate AI systems for organizations that need accountability, not just answers.
                </motion.p>

                {/* Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 140, delay: 0.5 }}
                  className="w-full max-w-xl mt-10"
                >
                  <div className="relative bg-white rounded-2xl border border-[#d2d2d7] shadow-sm hover:shadow-md focus-within:shadow-lg focus-within:border-[#0071e3]/40 transition-all duration-300">
                    <div className="flex items-end p-2">
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                          isListening
                            ? 'bg-red-500 text-white scale-110'
                            : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                        }`}
                      >
                        {isListening ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
                      </button>
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(inputValue); }
                        }}
                        placeholder={isListening ? "Listening..." : PLACEHOLDERS[placeholderIdx]}
                        rows={1}
                        className="flex-1 resize-none min-h-[2.5rem] max-h-28 px-3 py-2.5 text-[15px] text-[#1d1d1f] placeholder-[#86868b] outline-none bg-transparent leading-snug"
                      />
                      <button
                        onClick={() => handleSubmit(inputValue)}
                        disabled={isEmpty && !isListening}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:bg-[#d2d2d7] disabled:text-white transition-all duration-200"
                      >
                        <ArrowUp className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </div>

                  {/* Subtle hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-center text-[12px] text-[#86868b] mt-4 tracking-wide"
                  >
                    Documents, charts, graphs, and research surfaces — generated instantly.
                  </motion.p>
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          /* ═══════ SESSION ═══════ */
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-2.5 border-b border-[#d2d2d7]/50 bg-white/80 backdrop-blur-xl shrink-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  <ArrowLeft className="w-[18px] h-[18px]" />
                </button>
                <Image src="/logo.png" alt="Active Mirror" width={28} height={28} className="w-7 h-7 object-contain" />
                <span className="text-[15px] font-medium text-[#1d1d1f]">Active Mirror</span>
              </div>
              <div className="flex items-center gap-2">
                {error && (
                  <span className="text-[11px] text-red-500 font-medium px-2.5 py-1 bg-red-50 rounded-full">Connection issue</span>
                )}
                <button
                  onClick={handleReset}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                  aria-label="New session"
                >
                  <Plus className="w-[18px] h-[18px]" />
                </button>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <TriPanelLayout messages={messages} a2uiState={a2uiState} isLoading={isLoading} />
            </div>

            {/* Input bar */}
            <div className="shrink-0 border-t border-[#d2d2d7]/50 bg-white/80 backdrop-blur-xl px-4 py-2.5">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2 bg-[#f5f5f7] rounded-2xl border border-transparent focus-within:bg-white focus-within:border-[#d2d2d7] focus-within:shadow-sm transition-all duration-200 p-1.5">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
                      isListening ? 'bg-red-500 text-white' : 'text-[#86868b] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(inputValue); }
                    }}
                    placeholder={isListening ? "Listening..." : "Ask anything..."}
                    rows={1}
                    className="flex-1 resize-none min-h-[2.25rem] max-h-28 px-2 py-2 text-[14px] text-[#1d1d1f] placeholder-[#86868b] outline-none bg-transparent leading-snug"
                  />
                  <button
                    onClick={() => handleSubmit(inputValue)}
                    disabled={isEmpty && !isListening}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:bg-[#d2d2d7] transition-all duration-200"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
