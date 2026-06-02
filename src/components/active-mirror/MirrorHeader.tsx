"use client";

import Image from "next/image";
import { Plus, ArrowLeft, Shield, CloudSync, LogOut, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

interface MirrorHeaderProps {
  vaultSyncing?: boolean;
  onAutoPrompt?: (prompt: string) => void;
  onReset?: () => void;
  hasInteracted?: boolean;
}

export default function MirrorHeader({ vaultSyncing = false, onAutoPrompt, onReset, hasInteracted = false }: MirrorHeaderProps) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || null;
  const isAdmin = role === "ADMIN";

  return (
    <header className="flex items-center justify-between px-5 py-4 lg:px-8 lg:py-5">
      {/* Logo + Back */}
      <div className="flex items-center gap-2">
        {hasInteracted && (
          <button
            onClick={onReset}
            className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        )}
        <a href="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
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
        </a>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {vaultSyncing && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mr-2">
            <CloudSync className="w-3.5 h-3.5 animate-pulse" />
            <span>Vault Sync</span>
          </div>
        )}
        
        {session ? (
          <>
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isAdmin 
                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" 
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
              aria-label="Role Status"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? "Admin: ON" : "Role: " + role}</span>
            </button>
            <button
              onClick={() => signOut()}
              className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 transition-colors text-gray-600"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-medium transition-colors"
            aria-label="Log in"
          >
            <User className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
        )}
        
        <button
          onClick={() => onAutoPrompt?.("[SYSTEM AUTO-TRIGGER: Orchestrate a new session]")}
          className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
          aria-label="New session"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
