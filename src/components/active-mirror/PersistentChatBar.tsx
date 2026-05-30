"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface PersistentChatBarProps {
  onSubmit: (prompt: string) => void;
}

export default function PersistentChatBar({ onSubmit }: PersistentChatBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 lg:pb-5 lg:pt-3">
      {/* Gradient fade above bar */}
      <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-2xl xl:max-w-3xl">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl border border-blue-100/80 shadow-[0_4px_32px_rgba(59,130,246,0.1)] px-4 py-3 lg:px-5 lg:py-3.5">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-transparent text-sm lg:text-base text-gray-800 placeholder-gray-400 outline-none"
            placeholder="Ask Active Mirror anything..."
            aria-label="Chat with Active Mirror"
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="w-9 h-9 lg:w-10 lg:h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-md"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
