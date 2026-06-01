"use client";

import { motion } from "motion/react";
import { User, Cpu } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatHistoryPanelProps {
  messages: Message[];
}

export default function ChatHistoryPanel({ messages }: ChatHistoryPanelProps) {
  // Filter out system injected context for UI display
  const displayMessages = messages.map(m => ({
    ...m,
    content: m.content.replace(/\[VAULT CONTEXT:.*?\]\n\n/, '')
  })).filter(m => m.content.trim() !== "");

  return (
    <div className="flex flex-col gap-4 w-full h-[calc(100vh-200px)] overflow-y-auto pr-2 pb-10 scrollbar-hide">
      {displayMessages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-100 text-blue-600" : "bg-gray-900 text-gray-200"}`}>
            {msg.role === "user" ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
          </div>
          <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm"}`}>
            {msg.role === "assistant" && msg.content.includes("{") ? (
              <span className="text-gray-400 italic">Generating responsive surface...</span>
            ) : (
              msg.content
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
