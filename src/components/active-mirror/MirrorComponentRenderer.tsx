"use client";

import { motion } from "motion/react";
import {
  Shield,
  Activity,
  ScanFace,
  DollarSign,
  Check,
  Briefcase,
  Lock,
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
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  onAction?: (action: string) => void;
}

export default function MirrorComponentRenderer({
  components,
  onAction,
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
            {/* Rich Components */}
            {comp.type === "data_table_card" && Array.isArray(comp.metadata?.columns) && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs lg:text-sm text-left text-gray-500">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                    <tr>
                      {(comp.metadata!.columns as string[]).map((col, idx) => (
                        <th key={idx} className="px-4 py-2 border-b">{col as React.ReactNode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(comp.metadata!.rows as string[][])?.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b last:border-0 hover:bg-gray-50/50">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-2">{cell as React.ReactNode}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {comp.type === "chart_card" && Array.isArray(comp.metadata?.data) && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-100 flex items-center justify-center h-48 w-full shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comp.metadata!.data as any[]}>
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {comp.type === "form_card" && Array.isArray(comp.metadata?.fields) && (
              <form 
                className="mt-4 space-y-3 p-3 bg-white/50 rounded-lg border border-gray-100"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData.entries());
                  if (onAction) {
                    onAction(`[FORM_SUBMIT]: The user submitted the ${comp.title} form with data: ${JSON.stringify(data)}. Process this and generate the next surface.`);
                  }
                }}
              >
                {(comp.metadata!.fields as {name: string, type: string, placeholder: string}[]).map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1 uppercase tracking-wider">{field.name}</label>
                    <input 
                      name={field.name}
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      required
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                ))}
                <button type="submit" className="w-full mt-2 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition-colors relative group overflow-hidden">
                  <span className="relative z-10">Submit Securely</span>
                  <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              </form>
            )}

            {comp.type === "proof_map_card" && Array.isArray(comp.metadata?.nodes) && (
              <div className="mt-4 bg-gray-900 rounded-xl p-4 overflow-hidden relative font-mono shadow-inner border border-gray-800">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-800" />
                {(comp.metadata!.nodes as {hash: string, timestamp: string, label: string, verified: boolean}[]).map((node, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (i * 0.08) + 0.3 + (idx * 0.4) }}
                    className="relative flex items-start gap-4 mb-4 last:mb-0"
                  >
                     <div className={`relative z-10 w-5 h-5 mt-1 rounded-full border-2 border-gray-900 flex items-center justify-center shrink-0 ${node.verified ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                       {node.verified && <CheckCircle className="w-3 h-3 text-white" />}
                     </div>
                     <div className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 group hover:border-gray-600 transition-colors">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] text-emerald-400/80 font-semibold">{node.timestamp}</span>
                         {node.verified && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">VERIFIED</span>}
                       </div>
                       <p className="text-xs text-gray-300 font-medium mb-2">{node.label}</p>
                       <div className="bg-black/50 rounded p-1.5 overflow-hidden">
                         <span className="text-[9px] text-gray-500 break-all">{node.hash}</span>
                       </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            )}

            {comp.type === "agent_identity_card" && (
              <div className="mt-4 bg-gray-900 rounded-xl p-4 overflow-hidden relative font-mono shadow-inner border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-gray-200">AUTONOMOUS SUB-AGENT DELEGATED</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                </div>
                <div className="space-y-3 border-t border-gray-800 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">DELEGATED BY:</span>
                    <span className="text-gray-300 font-medium">{String(comp.metadata?.delegated_by || 'User Session')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">AGENT SCOPE:</span>
                    <span className="text-blue-400 font-medium">{String(comp.metadata?.scope || 'Background execution')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">EXPIRES:</span>
                    <span className="text-amber-400 font-medium">{String(comp.metadata?.expires || '24h')}</span>
                  </div>
                </div>
              </div>
            )}

            {comp.type === "workflow_card" && (
              <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200">Execution Pipeline</h4>
                    <p className="text-xs text-blue-400/80">Autonomous Mode</p>
                  </div>
                  <div className="ml-auto">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">PHASE</span>
                    <span className="text-gray-300 font-medium tracking-wide">MONITORING</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-2/3 animate-pulse rounded-full" />
                  </div>
                  <p className="text-[10px] text-gray-500 text-right mt-1">Estimating completion: Ongoing</p>
                </div>
              </div>
            )}

            {comp.type === "kyc_risk_card" && (
              <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-2xl relative overflow-hidden font-mono">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                   <div className="w-full h-0.5 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scan" style={{ animation: 'scan 3s linear infinite' }} />
                </div>
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes scan {
                    0% { transform: translateY(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(150px); opacity: 0; }
                  }
                `}} />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Compliance Scan</span>
                  </div>
                  <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-bold text-emerald-400 animate-pulse">
                    CLEARED
                  </div>
                </div>
                
                <div className="space-y-3 relative z-10">
                   <div className="flex justify-between border-b border-gray-800 pb-2">
                     <span className="text-xs text-gray-500">ENTITY ID</span>
                     <span className="text-xs text-gray-300 font-medium">{(comp.metadata?.entity_id as string) || 'AM-994-01A'}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-800 pb-2">
                     <span className="text-xs text-gray-500">RISK SCORE</span>
                     <span className="text-xs text-emerald-400 font-bold">{(comp.metadata?.risk_score as string) || '12 / 100 (LOW)'}</span>
                   </div>
                   <div className="flex justify-between pb-1">
                     <span className="text-xs text-gray-500">AML STATUS</span>
                     <span className="text-xs text-gray-300">PASS - No PEP Matches</span>
                   </div>
                </div>
              </div>
            )}

            {/* Information Barrier (Chinese Wall) Card */}
            {comp.type === "memory_boundary_card" && (
              <div className="mt-4 bg-gray-900 border border-yellow-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden font-sans">
                <div className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-10 h-10 rounded bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                    <ShieldOff className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-100 uppercase tracking-wide">{comp.title || "Information Barrier Conflict"}</h4>
                    <p className="text-xs text-yellow-500 mt-1 font-medium">{String(comp.metadata?.subtitle || "ACTION BLOCKED - COMPLIANCE POLICY")}</p>
                    <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                      {comp.body || "Cross-referencing data across institutional boundaries is strictly prohibited."}
                    </p>
                    <div className="mt-4 p-3 bg-gray-950/50 border border-gray-800 rounded text-xs text-gray-500 font-mono">
                      ERR_CODE: SEC_FINRA_COMPLIANCE_LOCK<br />
                      RESTRICTION: MULTI-TENANT ISOLATION
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Authority Boundary (Step-Up MFA) Card */}
            {comp.type === "authority_boundary_card" && (
              <div className="mt-4 bg-gray-900 border border-blue-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden font-sans">
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none" />
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-100 uppercase tracking-wide">{comp.title || "Authorization Required"}</h4>
                      <div className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded text-[9px] font-bold text-blue-400 tracking-wider">
                        {String(comp.metadata?.level || "LEVEL 4 (SUPERVISOR)")}
                      </div>
                    </div>
                    <p className="text-xs text-blue-400 mt-1 font-medium">{String(comp.metadata?.subtitle || "ACTION EXCEEDS SESSION AUTHORITY")}</p>
                    <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                      {comp.body || "This operation requires secondary approval from a supervisor or higher."}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-3 p-3 bg-gray-950/50 border border-gray-800 rounded">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                      <span className="text-xs text-gray-300 font-mono">Step-Up MFA Push Notification sent to Supervisor Device...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1. Lead Card (CRM Capture) */}
            {comp.type === "lead_card" && (
              <div className="mt-4 bg-gray-900 border border-indigo-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">CRM Lead Captured</h4>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-wider">Salesforce Integration</p>
                  </div>
                  <div className="ml-auto text-xs font-mono text-gray-500">
                    ID: {(comp.metadata?.lead_id as string) || "LD-9932-A"}
                  </div>
                </div>
                <div className="p-3 bg-gray-950/50 rounded-md space-y-2 border border-gray-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Status</span>
                    <span className="text-emerald-400 font-medium animate-pulse">Contract Dispatched</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Route</span>
                    <span className="text-gray-300">Enterprise Trading Desk</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Comparison Card (Competitive Matrix) */}
            {comp.type === "comparison_card" && (
              <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-2xl">
                <h4 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-purple-400" />
                  Competitive Intelligence
                </h4>
                <div className="grid grid-cols-2 gap-px bg-gray-800 rounded overflow-hidden border border-gray-800">
                  <div className="bg-gray-950 p-3 text-center">
                    <div className="text-xs font-bold text-blue-400 mb-2">ACTIVE MIRROR</div>
                    <div className="text-[10px] text-gray-400 space-y-1">
                      <div>0ms Latency</div>
                      <div>Zero Knowledge</div>
                      <div>Agentic Routing</div>
                    </div>
                  </div>
                  <div className="bg-gray-950 p-3 text-center">
                    <div className="text-xs font-bold text-gray-500 mb-2">LEGACY COMPETITOR</div>
                    <div className="text-[10px] text-gray-600 space-y-1">
                      <div>API Rate Limits</div>
                      <div>Public Cloud</div>
                      <div>Static Scripts</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Pricing Card (Institutional Tiering) */}
            {comp.type === "pricing_card" && (
              <div className="mt-4 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5 shadow-2xl text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 mb-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Enterprise Tier</h4>
                <div className="text-3xl font-bold text-white my-2 flex justify-center items-start">
                  <span className="text-lg mt-1 text-gray-500">$</span>
                  {(comp.metadata?.price as string) || "Custom"}
                </div>
                <p className="text-xs text-gray-500 mb-4">Per Node / Billed Annually</p>
                <div className="space-y-2 text-left bg-gray-900/50 p-3 rounded border border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Check className="w-3 h-3 text-emerald-500" /> Dedicated VPC
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Check className="w-3 h-3 text-emerald-500" /> White-glove SLA
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Check className="w-3 h-3 text-emerald-500" /> 1M Daily Tokens
                  </div>
                </div>
              </div>
            )}

            {/* 4. Risk Card (Volatility Warning) */}
            {comp.type === "risk_card" && (
              <div className="mt-4 bg-orange-950/20 border border-orange-500/30 rounded-xl p-5 shadow-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-orange-500">Market Volatility Warning</h4>
                    <p className="text-xs text-gray-400 mt-2">
                      The requested asset is currently exhibiting elevated Beta ({(comp.metadata?.beta as string) || "2.4"}). Stop-loss limits are strongly recommended before execution.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Governance Card (Compliance Override Alert) */}
            {comp.type === "governance_card" && (
              <motion.div 
                animate={{ x: [-5, 5, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className="mt-4 bg-red-950/20 border border-red-500/30 rounded-xl p-5 shadow-2xl font-mono"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <ShieldOff className="w-4 h-4" />
                    <span className="text-xs font-bold">GOVERNANCE LOCK</span>
                  </div>
                  <div className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-red-500/50 pl-3">
                  {comp.body || "A hard governance lock has been triggered. This prompt violates institutional acceptable use policies."}
                </p>
              </motion.div>
            )}

            {/* 6. Source Card (Data Citations) */}
            {comp.type === "source_card" && (
              <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-2xl">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Data Provenance</h4>
                <div className="flex items-center gap-3 p-2 bg-gray-950 rounded border border-gray-800">
                  <Database className="w-4 h-4 text-blue-400" />
                  <div className="text-xs text-gray-300">Bloomberg Terminal via FIX API</div>
                  <div className="ml-auto text-[10px] text-gray-600 bg-gray-900 px-2 py-0.5 rounded">VERIFIED</div>
                </div>
              </div>
            )}

            {/* 7. Spec Card (Technical Spec) */}
            {comp.type === "spec_card" && (
              <div className="mt-4 bg-gray-950 border border-gray-800 rounded-xl p-0 shadow-2xl overflow-hidden font-mono">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
                  <Code className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-400">deployment.yaml</span>
                </div>
                <div className="p-4 text-xs text-emerald-400 whitespace-pre">
                  {(comp.metadata?.code as string) || "spec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1"}
                </div>
              </div>
            )}

            {/* 8. Proof Card (ZK Signatures) */}
            {comp.type === "proof_card" && (
              <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-200">Zero-Knowledge Signature</h4>
                  <p className="text-[10px] text-gray-500 mt-1 break-all">
                    {(comp.metadata?.signature as string) || "0x98fB43e9F7A2C5..."}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
