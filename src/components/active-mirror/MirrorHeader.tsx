"use client";

import { Plus, CalendarDays, Menu } from "lucide-react";

export default function MirrorHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-4 lg:px-8 lg:py-5">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-10 h-10 lg:w-12 lg:h-12">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#logo-grad)" />
            <path
              d="M12 36V12L24 28L36 12V36"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M12 12L18 20"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M36 12L30 20"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>
        <span className="text-lg lg:text-xl font-semibold text-gray-900 tracking-tight">
          Active Mirror
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        <button
          className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
          aria-label="New session"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
        </button>
        <button
          className="relative w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
          aria-label="Calendar"
        >
          <CalendarDays className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            25
          </span>
        </button>
        <button
          className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
