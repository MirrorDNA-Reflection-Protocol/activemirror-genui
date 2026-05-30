"use client";

import { motion } from "motion/react";
import {
  Shield,
  ScanFace,
  Layout,
  Code,
  MessageCircle,
  Search,
  ShieldCheck,
  CheckCircle,
  Play,
  FileText,
  AlertTriangle,
  GitBranch,
  UserCheck,
  ArrowRight,
  Target,
  GitMerge,
  Plug,
  Package,
  Calendar,
  Building,
  MapPin,
  TrendingUp,
  AlertOctagon,
  ShieldOff,
  FileWarning,
  Database,
  type LucideIcon,
} from "lucide-react";
import type { MirrorComponent } from "@/lib/mirror/types";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield,
  "scan-face": ScanFace,
  layout: Layout,
  code: Code,
  "message-circle": MessageCircle,
  search: Search,
  "shield-check": ShieldCheck,
  "check-circle": CheckCircle,
  play: Play,
  "file-text": FileText,
  "alert-triangle": AlertTriangle,
  "git-branch": GitBranch,
  "user-check": UserCheck,
  "arrow-right": ArrowRight,
  target: Target,
  "git-merge": GitMerge,
  plug: Plug,
  package: Package,
  calendar: Calendar,
  building: Building,
  "map-pin": MapPin,
  "trending-up": TrendingUp,
  "alert-octagon": AlertOctagon,
  "shield-off": ShieldOff,
  "file-warning": FileWarning,
  database: Database,
};

const SEVERITY_STYLES: Record<string, string> = {
  info: "border-blue-100 bg-blue-50/40",
  low: "border-green-100 bg-green-50/40",
  medium: "border-amber-100 bg-amber-50/40",
  high: "border-red-100 bg-red-50/40",
  blocked: "border-red-200 bg-red-50/60",
};

const SEVERITY_ICON_STYLES: Record<string, string> = {
  info: "text-blue-500 bg-blue-100",
  low: "text-green-500 bg-green-100",
  medium: "text-amber-500 bg-amber-100",
  high: "text-red-500 bg-red-100",
  blocked: "text-red-600 bg-red-200",
};

interface MirrorComponentRendererProps {
  components: MirrorComponent[];
}

export default function MirrorComponentRenderer({
  components,
}: MirrorComponentRendererProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {components.map((comp, i) => {
        const Icon = ICON_MAP[comp.icon || "shield"] || Shield;
        const severity = comp.severity || "info";
        const cardStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
        const iconStyle =
          SEVERITY_ICON_STYLES[severity] || SEVERITY_ICON_STYLES.info;

        return (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={`rounded-xl border p-4 lg:p-5 ${cardStyle} hover:shadow-md transition-shadow`}
          >
            {/* Icon + Title */}
            <div className="flex items-start gap-3 mb-2">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyle}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm lg:text-base font-semibold text-gray-900 leading-tight">
                  {comp.title}
                </h4>
              </div>
            </div>

            {/* Body */}
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mt-1">
              {comp.body}
            </p>

            {/* Bullets */}
            {comp.bullets && comp.bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {comp.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-xs text-gray-500"
                  >
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Severity badge */}
            {severity !== "info" && (
              <div className="mt-3 flex">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${iconStyle}`}
                >
                  {severity}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
