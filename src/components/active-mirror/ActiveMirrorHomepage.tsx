"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, ArrowUp, Mic, MicOff, ArrowLeft, FileText, Network, BarChart3, Shield } from "lucide-react";
import { useA2UIStream } from "@/lib/mirror/useA2UIStream";
import Image from "next/image";
import TriPanelLayout from "./TriPanelLayout";

const SUGGESTED_PROMPTS = [
  { icon: FileText, text: "Draft a product spec", prompt: "Draft a product requirements document for Active Mirror with objectives, user stories, and success metrics", color: "text-blue-500" },
  { icon: Network, text: "System architecture", prompt: "Show me the full system architecture with all agents, services, and data flows as an interactive graph", color: "text-violet-500" },
  { icon: BarChart3, text: "Market analysis", prompt: "Analyze the enterprise AI market — show growth trends, competitor landscape, and our positioning with charts", color: "text-emerald-500" },
  { icon: Shield, text: "Security audit", prompt: "Run a comprehensive security governance audit on this session and show compliance posture", color: "text-amber-500" },
];

export default function ActiveMirrorHomepage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { submit, a2uiState, isLoading, error } = useA2UIStream("/api/mirror/stream");

  // Chat materializes on mount
  useEffect(() => {
    const timer = setTimeout(() => setChatVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Focus input when chat appears
  useEffect(() => {
    if (chatVisible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [chatVisible]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (event: any) => {
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if (final) setInputValue(prev => (prev + " " + final).trim());
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  const handleSubmit = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setHasInteracted(true);
    setInputValue("");

    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    }

    const newMessages: { role: "user" | "assistant"; content: string }[] = [
      ...messages,
      { role: "user", content: trimmed }
    ];
    setMessages(newMessages);
    submit({ messages: newMessages });
  }, [messages, submit, isListening, recognition]);

  const handleReset = useCallback(() => {
    setHasInteracted(false);
    setMessages([]);
    setInputValue("");
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setInputValue("");
      recognition?.start();
      setIsListening(true);
    }
  };

  const isEmpty = inputValue.trim().length === 0;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Subtle animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-blue-100/20 to-transparent blur-3xl animate-drift-slow" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-tl from-violet-100/20 to-transparent blur-3xl animate-drift-slow-reverse" />
      </div>

      {/* Header — minimal, appears after interaction */}
      <AnimatePresence>
        {hasInteracted && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/70 backdrop-blur-xl shrink-0 z-10"
          >
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleReset}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="Active Mirror" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Active Mirror</span>
            </div>
            {error && (
              <div className="text-xs text-red-500 font-medium px-3 py-1 bg-red-50 rounded-full border border-red-100">
                Connection error — retrying
              </div>
            )}
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!hasInteracted ? (
            /* ========= LANDING: Chat materializes ========= */
            <motion.div
              key="landing"
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="h-full flex flex-col items-center justify-center px-6"
            >
              <AnimatePresence>
                {chatVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    transition={{ type: 'spring', damping: 22, stiffness: 140, delay: 0.1 }}
                    className="w-full max-w-2xl"
                  >
                    {/* Logo + Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex flex-col items-center mb-10"
                    >
                      <div className="relative w-16 h-16 mb-5 animate-float">
                        <Image src="/logo.png" alt="Active Mirror" width={64} height={64} className="w-full h-full object-contain drop-shadow-lg" />
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient">Active Mirror</h1>
                      <p className="text-sm sm:text-base text-gray-500 mt-3 text-center max-w-md leading-relaxed">
                        Ask for a document and it appears. Ask for research and it opens.
                        <span className="block mt-1 text-gray-400">AI that builds what you ask for.</span>
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                          <span>GPT-4.1 Connected</span>
                        </div>
                        <div className="w-px h-3 bg-gray-200" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Governed</span>
                        <div className="w-px h-3 bg-gray-200" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Sovereign</span>
                      </div>
                    </motion.div>

                    {/* Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="bg-white/80 backdrop-blur-xl rounded-2xl border border-indigo-200/50 shadow-xl shadow-indigo-100/30 p-2 animate-border-glow"
                    >
                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                          aria-label="Voice input"
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                        <textarea
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(inputValue);
                            }
                          }}
                          placeholder={isListening ? "Listening..." : "What do you want to create?"}
                          rows={1}
                          className="flex-1 resize-none min-h-[2.5rem] max-h-32 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent leading-snug"
                        />
                        <button
                          onClick={() => handleSubmit(inputValue)}
                          disabled={isEmpty && !isListening}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          aria-label="Send"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>

                    {/* Suggested Prompts */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 w-full"
                    >
                      {SUGGESTED_PROMPTS.map((item, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0 + i * 0.1 }}
                          onClick={() => handleSubmit(item.prompt)}
                          className="group flex flex-col items-center gap-2 px-4 py-3.5 bg-white/60 border border-gray-200/80 rounded-xl hover:bg-white hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        >
                          <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                          <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{item.text}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ========= ACTIVE SESSION: Chat + Surfaces ========= */
            <motion.div
              key="session"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Surfaces area */}
              <div className="flex-1 overflow-hidden">
                <TriPanelLayout
                  messages={messages}
                  a2uiState={a2uiState}
                  isLoading={isLoading}
                />
              </div>

              {/* Persistent input bar */}
              <div className="shrink-0 border-t border-gray-100 bg-white/80 backdrop-blur-xl px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-end gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(inputValue);
                      }
                    }}
                    placeholder={isListening ? "Listening..." : "Continue the conversation..."}
                    rows={1}
                    className="flex-1 resize-none min-h-[2.5rem] max-h-32 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-300 focus:bg-white transition-colors leading-snug"
                  />
                  <button
                    onClick={() => handleSubmit(inputValue)}
                    disabled={isEmpty && !isListening}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
