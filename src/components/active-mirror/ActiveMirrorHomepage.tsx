"use client";

import { useState, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Mic, MicOff, ArrowLeft, Plus, User, Users, Building2, Landmark, Download, Network, Languages, Video, AudioLines } from "lucide-react";
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

const STARTERS = [
  {
    label: "Ecosystem",
    icon: Network,
    prompt: "Show the Active Mirror operating map: trust layer, launch surface, proof view, workspace boundary, and generated app preview.",
  },
  {
    label: "Individual",
    icon: User,
    prompt: "Generate my individual software-on-demand workspace: personal project app preview, finish plan, export pack, and fastest next step.",
  },
  {
    label: "Team",
    icon: Users,
    prompt: "Generate a team software-on-demand workspace: shared project app preview, roles, handoff file, timeline, and export pack.",
  },
  {
    label: "Enterprise",
    icon: Building2,
    prompt: "Generate an enterprise software-on-demand workspace: buyer app preview, trust-by-design brief, pilot plan, and reviewed access path.",
  },
  {
    label: "Government",
    icon: Landmark,
    prompt: "Generate a public-sector software-on-demand workspace: civic-service app preview, consent boundary, evidence checklist, proof surface, and reviewed access path.",
  },
  {
    label: "Global",
    icon: Languages,
    prompt: "Generate a global Active Mirror workspace: localized app preview in English, Hindi, Arabic, and Spanish with onboarding labels and regional access path.",
  },
  {
    label: "Video",
    icon: Video,
    prompt: "Generate a Veo-ready Active Mirror video workbench: storyboard, prompt, safety gate, cost gate, source previews for the video API, and access path for rendering.",
  },
  {
    label: "Audio",
    icon: AudioLines,
    prompt: "Generate an Active Mirror audio workbench: voice brief, podcast outline, narration script, consent and likeness boundary, render cost gate, locale caveats when relevant, and transcript/export path.",
  },
];

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
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
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
      .then((status: QaStatus | null) => setQaStatus(status))
      .catch(() => setQaStatus(null));
  }, [qaMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
    <div className="min-h-dvh h-dvh flex flex-col bg-[#fafafa] overflow-hidden">
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
            className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center px-6 py-6 max-[360px]:justify-start"
          >
            {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 120, delay: 0.1 }}
                  className="mb-8 max-[640px]:mb-5 max-[360px]:mb-4"
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
                  Active Mirror
                </motion.h1>

                {/* Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 140, delay: 0.5 }}
                  className="w-full max-w-2xl mt-10 max-[640px]:mt-6 max-[360px]:mt-5"
                >
                  <div className="relative bg-white rounded-2xl border border-[#d2d2d7] shadow-sm hover:shadow-md focus-within:shadow-lg focus-within:border-[#0071e3]/40 transition-all duration-300">
                    <div className="flex items-end p-2">
                      <button
                        type="button"
                        onClick={toggleListening}
                        aria-label={isListening ? "Stop voice input" : "Start voice input"}
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
                        aria-label="Generate surface"
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
                    Preview turns are unlocked while we tune the experience.
                  </motion.p>

                  {mirrorSeed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.28 }}
                      className="text-center text-[11px] text-[#a1a1a6] mt-1"
                    >
                      MirrorSeed local: {mirrorSeed.id.slice(0, 11)}. No tracking profile.
                    </motion.p>
                  )}

                  {qaMode && (
                    <QaTestStrip
                      status={qaStatus}
                      onSubmit={handleSubmit}
                    />
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.35, duration: 0.35 }}
                    className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 max-[640px]:mt-4"
                  >
                    {STARTERS.map((starter, index) => {
                      const Icon = starter.icon;
                      return (
                        <motion.button
                          key={starter.label}
                          type="button"
                          onClick={() => handleSubmit(starter.prompt)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.45 + index * 0.07 }}
                          className="group flex h-16 max-[640px]:h-14 flex-col items-center justify-center gap-1 rounded-xl border border-[#d2d2d7] bg-white/80 text-[#424245] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0071e3]/40 hover:bg-white hover:shadow-md"
                          aria-label={`Start as ${starter.label}`}
                        >
                          <Icon className="h-4 w-4 text-[#0071e3] transition-transform group-hover:scale-110" />
                          <span className="text-[12px] font-medium">{starter.label}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={handleInstall}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.75 }}
                    className="mx-auto mt-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-[#86868b] transition-colors hover:bg-white hover:text-[#1d1d1f] max-[640px]:hidden"
                    aria-label={installPrompt ? "Install Active Mirror app" : "Open PWA manifest"}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {installPrompt ? "Install app" : "PWA ready"}
                  </motion.button>
                </motion.div>
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
      className="mx-auto mt-4 w-full max-w-xl rounded-2xl border border-sky-100 bg-white/80 p-3 text-left shadow-sm"
      data-testid="qa-test-strip"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">
            QA Mode
          </div>
          <div className="text-xs text-[#6e6e73]">
            Canonical: activemirror.ai · Preview: live GenUI
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          Turns: {unlocked}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {prompts.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSubmit(item.prompt)}
            className="rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-3 py-2 text-xs font-medium text-[#1d1d1f] transition-colors hover:border-[#0071e3]/40 hover:bg-white"
          >
            {item.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
