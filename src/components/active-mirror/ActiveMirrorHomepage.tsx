"use client";

import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Mic,
  MicOff,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useA2UIStream } from "@/lib/mirror/useA2UIStream";
import Image from "next/image";
import TriPanelLayout from "./TriPanelLayout";
import GovernedGenUIWorkbench from "./GovernedGenUIWorkbench";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

type MirrorSeed = {
  v: 1;
  id: string;
  createdAt: string;
  turnLimit: number;
  surfaceBias: "finish";
};

type QaStatus = {
  freeTurnLimit?: number;
  promptPreview?: string;
  swStatus?: "ready" | "failed";
};

type SpeechAlternativeLike = {
  transcript: string;
};

type SpeechResultLike = {
  isFinal: boolean;
  0: SpeechAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const MIRROR_SEED_KEY = "active-mirror.mirrorseed.v1";
const subscribeStatic = () => () => {};
let mirrorSeedCache: MirrorSeed | null | undefined;

function createMirrorSeed(): MirrorSeed {
  const id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return {
    v: 1,
    id: `ms-${id}`,
    createdAt: new Date().toISOString(),
    turnLimit: 999999,
    surfaceBias: "finish",
  };
}

function getQaModeSnapshot() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("qa");
}

function getServerQaModeSnapshot() {
  return false;
}

function getMirrorSeedSnapshot() {
  if (typeof window === "undefined") return null;
  if (mirrorSeedCache !== undefined) return mirrorSeedCache;

  try {
    const stored = window.localStorage.getItem(MIRROR_SEED_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MirrorSeed;
      if (parsed?.v === 1 && parsed.id) {
        mirrorSeedCache = parsed;
        return mirrorSeedCache;
      }
    }

    const seed = createMirrorSeed();
    window.localStorage.setItem(MIRROR_SEED_KEY, JSON.stringify(seed));
    mirrorSeedCache = seed;
    return mirrorSeedCache;
  } catch {
    mirrorSeedCache = createMirrorSeed();
    return mirrorSeedCache;
  }
}

function getServerMirrorSeedSnapshot() {
  return null;
}

export default function ActiveMirrorHomepage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [qaStatus, setQaStatus] = useState<QaStatus | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mirrorSeed = useSyncExternalStore(subscribeStatic, getMirrorSeedSnapshot, getServerMirrorSeedSnapshot);
  const qaMode = useSyncExternalStore(subscribeStatic, getQaModeSnapshot, getServerQaModeSnapshot);

  const { submit, a2uiState, isLoading, error } = useA2UIStream("/api/mirror/stream");

  useEffect(() => {
    if (!qaMode) return;

    fetch("/api/mirror/system", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((status: QaStatus | null) => setQaStatus(prev => ({ ...(prev || {}), ...(status || {}) })))
      .catch(() => setQaStatus(null));
  }, [qaMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then(() => setQaStatus(prev => ({ ...(prev || {}), swStatus: "ready" })))
        .catch(() => setQaStatus(prev => ({ ...(prev || {}), swStatus: "failed" })));
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Focus input
  useEffect(() => {
    if (!hasInteracted && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 800);
    }
  }, [hasInteracted]);

  // Speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const speechWindow = window as SpeechRecognitionWindow;
    const SR = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) setInputValue(prev => (prev + " " + final).trim());
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;

    return () => {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      if (recognitionRef.current === rec) recognitionRef.current = null;
    };
  }, []);

  const handleSubmit = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setHasInteracted(true);
    setInputValue("");
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    const next: { role: "user" | "assistant"; content: string }[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    submit({ messages: next });
  }, [messages, submit, isListening]);

  const handleReset = useCallback(() => {
    setHasInteracted(false);
    setMessages([]);
    setInputValue("");
  }, []);

  const handleInstall = useCallback(async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice.catch(() => null);
      setInstallPrompt(null);
      return;
    }

    window.open("/manifest.json", "_blank", "noopener,noreferrer");
  }, [installPrompt]);

  const toggleListening = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setInputValue(""); recognitionRef.current?.start(); setIsListening(true); }
  };

  const isEmpty = inputValue.trim().length === 0;

  return (
    <div className="relative min-h-dvh h-dvh flex flex-col bg-[#090d12] overflow-hidden">
      <AnimatePresence mode="wait">
        {!hasInteracted ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-h-0 overflow-y-auto"
          >
            <GovernedGenUIWorkbench
              value={inputValue}
              onValueChange={setInputValue}
              onSubmit={handleSubmit}
              onToggleListening={toggleListening}
              isListening={isListening}
              inputRef={inputRef}
              disableSubmit={false}
              mirrorSeedId={mirrorSeed?.id}
              onInstall={handleInstall}
              installLabel={installPrompt ? "Install app" : "PWA ready"}
              qaSlot={
                qaMode ? (
                    <QaTestStrip
                      status={qaStatus}
                      onSubmit={handleSubmit}
                    />
                  ) : null
              }
            />
          </motion.div>
        ) : (
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
                  aria-label="Back to landing"
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
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
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
                    aria-label="Generate surface"
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

function QaTestStrip({
  status,
  onSubmit,
}: {
  status: QaStatus | null;
  onSubmit: (prompt: string) => void;
}) {
  const prompts = [
    {
      label: "Demo",
      prompt: "Run the official Active Mirror demo.",
    },
    {
      label: "Spec",
      prompt: "Generate a downloadable spec for an Active Mirror sales demo.",
    },
    {
      label: "Research",
      prompt: "Research browser OS and generated UI tools; show a source preview and downloadable brief.",
    },
    {
      label: "Company",
      prompt: "My company is Acme Clinics. Show how Active Mirror can help us with patient operations without making medical claims.",
    },
    {
      label: "Small Biz",
      prompt: "Active Mirror for small business: generate a customer intake, offer page, quote path, follow-up automation, and downloadable action pack.",
    },
    {
      label: "Audio",
      prompt: "Generate an audio workbench with narration script, consent gate, and transcript export.",
    },
  ];
  const unlocked =
    status?.freeTurnLimit && status.freeTurnLimit > 1000
      ? "Unlocked"
      : status?.freeTurnLimit
        ? `${status.freeTurnLimit} turns`
        : "Checking";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.34 }}
      className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.035] p-3 text-left shadow-sm"
      data-testid="qa-test-strip"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
            QA Mode
          </div>
          <div className="text-xs text-slate-500">
            Canonical: activemirror.ai. Preview: live GenUI
          </div>
        </div>
        <span className="rounded-md bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
          Turns: {unlocked}
        </span>
        <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${status?.swStatus === "failed" ? "bg-red-400/10 text-red-200" : "bg-cyan-300/10 text-cyan-200"}`}>
          SW: {status?.swStatus || "checking"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
        {prompts.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSubmit(item.prompt)}
            className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10"
          >
            {item.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
