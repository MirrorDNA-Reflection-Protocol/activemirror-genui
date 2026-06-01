"use client";

import { useState, useCallback, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Sparkles, ArrowUp, Mic, MicOff } from "lucide-react";

interface PersistentChatBarProps {
  onSubmit: (prompt: string) => void;
}

export default function PersistentChatBar({ onSubmit }: PersistentChatBarProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setValue((prev) => (prev + " " + finalTranscript).trim());
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setValue(""); // clear before speaking
      recognition?.start();
      setIsListening(true);
    }
  };

  const submit = useCallback(() => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    }
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, onSubmit, isListening, recognition]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      submit();
    },
    [submit],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const isEmpty = value.trim().length === 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      {/* Gradient fade to blend with page content above */}
      <div className="h-16 bg-gradient-to-t from-white/80 to-transparent  " />

      {/* Glass bar */}
      <div className="pointer-events-auto border-t border-zinc-200/60 bg-white/70 backdrop-blur-xl pb-2">
        
        {/* Meta-UI Macros */}
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 shrink-0">Macros</span>
          <button onClick={() => onSubmit("Initialize KYC for AM-994-01A")} className="shrink-0 px-3 py-1 bg-white border border-emerald-200 text-emerald-600 rounded-full text-xs font-medium hover:bg-emerald-50 transition-colors">
            Init KYC
          </button>
          <button onClick={() => onSubmit("Generate Architecture Spec")} className="shrink-0 px-3 py-1 bg-white border border-purple-200 text-purple-600 rounded-full text-xs font-medium hover:bg-purple-50 transition-colors">
            System Spec
          </button>
          <button onClick={() => onSubmit("Full Cryptographic Audit")} className="shrink-0 px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors">
            Audit Trail
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-1"
        >
          {/* Voice button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
            aria-label="Toggle voice input"
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text input */}
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Orchestrate your session..."}
            rows={1}
            className="max-h-40 min-h-[2.5rem] flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-100/80 px-4 py-2.5 text-sm leading-snug text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-300 focus:bg-white      "
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isEmpty && !isListening}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-opacity hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed   "
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
