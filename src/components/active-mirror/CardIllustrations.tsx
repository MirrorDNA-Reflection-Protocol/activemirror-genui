"use client";

// Custom SVG illustrations matching the mockup's card artwork

export function MirroringProtocolsIllustration() {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Left device */}
      <rect x="16" y="20" width="44" height="70" rx="6" stroke="#93C5FD" strokeWidth="2" fill="#EFF6FF" />
      <rect x="22" y="30" width="32" height="4" rx="2" fill="#BFDBFE" />
      <rect x="22" y="38" width="24" height="4" rx="2" fill="#BFDBFE" />
      <rect x="22" y="46" width="28" height="4" rx="2" fill="#BFDBFE" />
      <rect x="22" y="54" width="20" height="4" rx="2" fill="#DBEAFE" />

      {/* Right device */}
      <rect x="100" y="20" width="44" height="70" rx="6" stroke="#93C5FD" strokeWidth="2" fill="#EFF6FF" />
      <rect x="106" y="30" width="32" height="4" rx="2" fill="#BFDBFE" />
      <rect x="106" y="38" width="24" height="4" rx="2" fill="#BFDBFE" />
      <rect x="106" y="46" width="28" height="4" rx="2" fill="#BFDBFE" />
      <rect x="106" y="54" width="20" height="4" rx="2" fill="#DBEAFE" />

      {/* Arrows between devices */}
      <path d="M64 42 L96 42" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arr)" />
      <path d="M96 55 L64 55" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arr)" />

      <defs>
        <marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L6 3 L0 6Z" fill="#3B82F6" />
        </marker>
      </defs>

      {/* Shield / lock icon */}
      <circle cx="36" cy="95" r="11" fill="#3B82F6" />
      <path d="M32 93 L36 89 L40 93 L40 99 Q36 102 32 99Z" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="96" r="1.5" fill="white" />
    </svg>
  );
}

export function IdentityVerificationIllustration() {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Face outline */}
      <ellipse cx="80" cy="52" rx="28" ry="34" stroke="#93C5FD" strokeWidth="2" fill="#EFF6FF" />

      {/* Eyes */}
      <ellipse cx="70" cy="46" rx="4" ry="3" fill="#BFDBFE" />
      <ellipse cx="90" cy="46" rx="4" ry="3" fill="#BFDBFE" />
      <circle cx="70" cy="46" r="1.5" fill="#3B82F6" />
      <circle cx="90" cy="46" r="1.5" fill="#3B82F6" />

      {/* Nose and mouth */}
      <path d="M78 54 Q80 58 82 54" stroke="#93C5FD" strokeWidth="1.5" fill="none" />
      <path d="M74 64 Q80 68 86 64" stroke="#93C5FD" strokeWidth="1.5" fill="none" />

      {/* Scan corners */}
      <path d="M44 26 L44 18 L54 18" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M116 26 L116 18 L106 18" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 78 L44 86 L54 86" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M116 78 L116 86 L106 86" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

      {/* Verification badge */}
      <circle cx="110" cy="88" r="13" fill="#3B82F6" />
      <path d="M104 88 L108 92 L116 84" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GenerativeInterfaceIllustration() {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Browser window */}
      <rect x="16" y="12" width="128" height="86" rx="8" stroke="#93C5FD" strokeWidth="2" fill="#EFF6FF" />

      {/* Title bar */}
      <rect x="16" y="12" width="128" height="18" rx="8" fill="#DBEAFE" />
      <rect x="16" y="22" width="128" height="8" fill="#DBEAFE" />
      <circle cx="28" cy="21" r="3" fill="#FCA5A5" />
      <circle cx="38" cy="21" r="3" fill="#FCD34D" />
      <circle cx="48" cy="21" r="3" fill="#86EFAC" />

      {/* Layout blocks */}
      <rect x="24" y="36" width="52" height="8" rx="2" fill="#BFDBFE" />
      <rect x="24" y="48" width="40" height="6" rx="2" fill="#DBEAFE" />
      <rect x="24" y="58" width="48" height="6" rx="2" fill="#DBEAFE" />
      <rect x="24" y="68" width="36" height="6" rx="2" fill="#DBEAFE" />

      {/* Right side blocks */}
      <rect x="86" y="36" width="50" height="24" rx="4" fill="#DBEAFE" />
      <rect x="86" y="64" width="50" height="10" rx="4" fill="#DBEAFE" />

      {/* Generate button */}
      <rect x="24" y="82" width="56" height="12" rx="6" fill="#10B981" />
      <text x="52" y="91" textAnchor="middle" fill="white" fontSize="7" fontWeight="600" fontFamily="system-ui">
        Generate
      </text>

      {/* Cursor */}
      <path d="M18 104 L24 86 L28 96 L34 94" stroke="#3B82F6" strokeWidth="2" fill="none" />
      <path d="M18 104 L24 86 L20 96Z" fill="#3B82F6" />
    </svg>
  );
}

export function IntegrationAPIsIllustration() {
  return (
    <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Code editor window */}
      <rect x="12" y="8" width="96" height="72" rx="8" stroke="#93C5FD" strokeWidth="2" fill="#1E293B" />

      {/* Editor title bar */}
      <rect x="12" y="8" width="96" height="14" rx="8" fill="#334155" />
      <rect x="12" y="16" width="96" height="6" fill="#334155" />

      {/* Code bracket */}
      <text x="24" y="38" fill="#60A5FA" fontSize="11" fontWeight="700" fontFamily="monospace">&lt;/&gt;</text>

      {/* Code lines */}
      <rect x="22" y="46" width="40" height="3" rx="1.5" fill="#60A5FA" opacity="0.6" />
      <rect x="22" y="53" width="52" height="3" rx="1.5" fill="#34D399" opacity="0.6" />
      <rect x="22" y="60" width="36" height="3" rx="1.5" fill="#FBBF24" opacity="0.6" />
      <rect x="22" y="67" width="44" height="3" rx="1.5" fill="#60A5FA" opacity="0.6" />

      {/* Database / server */}
      <ellipse cx="132" cy="42" rx="20" ry="8" stroke="#93C5FD" strokeWidth="2" fill="#EFF6FF" />
      <path d="M112 42 L112 70 Q112 78 132 78 Q152 78 152 70 L152 42" stroke="#93C5FD" strokeWidth="2" fill="#EFF6FF" />
      <ellipse cx="132" cy="56" rx="20" ry="6" stroke="#93C5FD" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="132" cy="70" rx="20" ry="6" stroke="#93C5FD" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Connection arrow */}
      <path d="M108 50 L112 50" stroke="#3B82F6" strokeWidth="2" />
      <circle cx="110" cy="50" r="3" fill="#3B82F6" />
      <path d="M108 56 Q100 56 100 64 L100 90 Q100 96 106 96 L120 96" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M120 92 L128 96 L120 100" fill="#3B82F6" />
    </svg>
  );
}
