"use client";

import Image from "next/image";
import { Plus, CalendarDays, Menu } from "lucide-react";

export default function MirrorHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-4 lg:px-8 lg:py-5">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-10 h-10 lg:w-12 lg:h-12">
          <Image
            src="/logo.png"
            alt="Active Mirror"
            width={48}
            height={48}
            className="w-full h-full object-contain"
            priority
          />
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
