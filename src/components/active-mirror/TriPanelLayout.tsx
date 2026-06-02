import React, { useState, useEffect } from 'react';
import { MirrorSurfaceSpec } from '@/lib/mirror/schema';
import { FileText, Globe, AlertTriangle, ShieldAlert, BarChart3, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface TriPanelLayoutProps {
  messages: { role: "user" | "assistant"; content: string }[];
  partialSurface?: Partial<MirrorSurfaceSpec>;
  isLoading: boolean;
}

const AgentBadge = ({ agentId }: { agentId?: string }) => {
  if (!agentId) return null;
  let color = 'bg-gray-800 text-gray-300 border-gray-700';
  let icon = <Bot className="w-3 h-3" />;
  if (agentId === 'MirrorGate') { color = 'bg-red-900/50 text-red-400 border-red-800'; icon = <ShieldAlert className="w-3 h-3" />; }
  if (agentId === 'Chetana') { color = 'bg-blue-900/50 text-blue-400 border-blue-800'; icon = <BarChart3 className="w-3 h-3" />; }
  if (agentId === 'MirrorProof') { color = 'bg-emerald-900/50 text-emerald-400 border-emerald-800'; icon = <FileText className="w-3 h-3" />; }
  if (agentId === 'MirrorBrain') { color = 'bg-purple-900/50 text-purple-400 border-purple-800'; icon = <Globe className="w-3 h-3" />; }
  
  return (
    <div className={`absolute -top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border shadow-sm ${color} backdrop-blur-md`}>
      {icon} {agentId}
    </div>
  );
};

export default function TriPanelLayout({ messages, partialSurface, isLoading }: TriPanelLayoutProps) {
  const nodes = partialSurface?.new_nodes || [];
  
  const artifactNodes = nodes.filter(n => n?.type === 'artifact_node' || n?.type === 'chart_node');
  const browserNodes = nodes.filter(n => n?.type === 'browser_node');
  const governanceNodes = nodes.filter(n => n?.type === 'governance_node');

  const hasArtifact = artifactNodes.length > 0;
  const hasBrowser = browserNodes.length > 0;

  // Fluid CSS Grid configuration based on the user blueprint
  const getGridConfig = () => {
    const left = hasBrowser ? '400px' : '0px';
    const right = hasArtifact ? '450px' : '0px';
    return {
      gridTemplateColumns: `${left} 1fr ${right}`,
      transition: 'grid-template-columns 400ms cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  return (
    <div className="w-full h-full bg-[#0d0f12] text-slate-100 overflow-hidden grid rounded-xl shadow-2xl" style={getGridConfig()}>
      
      {/* LEFT PANEL: Browser Lookups */}
      <div 
        className="border-r border-slate-800 bg-[#111418] h-full overflow-y-auto"
        style={{ contain: 'paint' }}
      >
        <div className="w-[400px] h-full p-4 space-y-4">
          {browserNodes.map((node, i) => (
            <div key={node?.id || i} className="bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 overflow-visible relative">
              <AgentBadge agentId={node?.agent_id as string} />
              <div className="bg-zinc-950 px-4 py-2 flex items-center gap-2 text-white border-b border-zinc-800 rounded-t-xl">
                <div className="flex gap-1.5 mr-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <Globe className="w-4 h-4 text-zinc-400" />
                <div className="bg-zinc-800 rounded text-xs px-2 py-1 flex-1 font-mono text-center text-zinc-300 truncate">
                  {node?.title || "active-mirror.net/search"}
                </div>
              </div>
              <div className="p-5 min-h-[200px]">
                <h3 className="font-bold text-lg text-zinc-100 mb-3">{node?.title}</h3>
                <div className="text-sm text-zinc-400 space-y-4 whitespace-pre-wrap prose prose-invert max-w-none">
                  <ReactMarkdown>{node?.body || ""}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANEL: Core Chat Thread */}
      <div className="h-full flex flex-col justify-between bg-[#0d0f12] relative overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] shadow-md border ${isUser ? 'bg-zinc-800 text-slate-100 border-zinc-700' : 'bg-[#15191e] text-slate-300 border-slate-800'}`}>
                  <div className="flex items-center gap-2 mb-1 opacity-60 text-[10px] uppercase tracking-wider font-semibold">
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    {isUser ? 'You' : 'Active Mirror'}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown>{msg.content.replace(/\[VAULT CONTEXT:.*?\]\n\n/g, '')}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          <AnimatePresence>
            {governanceNodes.map((node, i) => {
              const isBlocked = node?.severity === 'blocked';
              return (
                <motion.div 
                  key={node?.id || `gov-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mx-auto w-full max-w-[85%] bg-zinc-900 rounded-xl shadow-2xl border overflow-visible relative my-4 ${isBlocked ? 'border-red-900 shadow-red-900/20' : 'border-amber-900 shadow-amber-900/20'}`}
                >
                  <AgentBadge agentId={node?.agent_id as string} />
                  <div className={`px-4 py-3 border-b flex items-center gap-2 text-white rounded-t-xl ${isBlocked ? 'bg-red-950/80 border-red-900' : 'bg-amber-950/80 border-amber-900'}`}>
                    {isBlocked ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    <span className={`font-bold text-xs tracking-widest ${isBlocked ? 'text-red-400' : 'text-amber-400'}`}>
                      {isBlocked ? 'GOVERNANCE LOCK' : 'POLICY WARNING'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-200 mb-2">{node?.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-mono">{node?.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && partialSurface?.thought_process && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 py-3 bg-[#15191e] rounded-xl border border-slate-800 text-slate-400 text-xs font-mono max-w-[85%] mt-4 shadow-xl"
            >
              {partialSurface.thought_process.map((thought, i) => (
                <div key={i} className="mb-1 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>{thought}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 text-slate-500">
                <span className="animate-pulse">_</span> generating surface...
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Document Artifacts */}
      <div 
        className="border-l border-slate-800 bg-[#15191e] h-full overflow-y-auto"
        style={{ contain: 'paint' }}
      >
        <div className="w-[450px] h-full p-6 space-y-6">
          {artifactNodes.map((node, i) => (
            <div key={node?.id || i} className="bg-[#0d0f12] rounded-xl shadow-2xl border border-slate-800 overflow-visible relative">
              <AgentBadge agentId={node?.agent_id as string} />
              <div className="bg-[#111418] px-4 py-3 border-b border-slate-800 flex items-center gap-2 text-slate-300 rounded-t-xl">
                {node?.type === 'chart_node' ? <BarChart3 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                <span className="font-semibold text-xs tracking-wide uppercase">
                  {node?.type === 'chart_node' ? 'Data Visualization' : 'Document Artifact'}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-slate-100 mb-4">{node?.title}</h3>
                <div className="text-[0.925rem] text-slate-300 leading-relaxed prose prose-invert max-w-none">
                  <ReactMarkdown>{node?.body || ""}</ReactMarkdown>
                </div>
                
                {node?.type === 'chart_node' && (
                  <div className="mt-6 h-40 bg-[#111418] rounded-lg flex flex-col justify-end p-2 gap-2 border border-slate-800">
                     <div className="w-full bg-blue-900/40 h-1/4 rounded border border-blue-800/50"></div>
                     <div className="w-full bg-blue-800/50 h-2/4 rounded border border-blue-700/50"></div>
                     <div className="w-full bg-blue-600/60 h-3/4 rounded border border-blue-500/50"></div>
                  </div>
                )}

                {node?.metadata && node.metadata.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Metadata / Citations</div>
                    <div className="flex flex-wrap gap-2">
                      {node.metadata.map((meta: any, idx: number) => (
                        <div key={idx} className="text-xs bg-[#111418] px-2 py-1 rounded text-slate-400 border border-slate-800 font-mono">
                          <span className="text-slate-500">{meta?.key}:</span> {meta?.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
