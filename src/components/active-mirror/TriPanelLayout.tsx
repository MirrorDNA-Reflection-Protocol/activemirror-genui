"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AlertTriangle, ShieldAlert, Bot, Sparkles, FileText, Network, BarChart3, BookOpen, Plug, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

import DocumentSurface from './surfaces/DocumentSurface';
import BrowserSurface from './surfaces/BrowserSurface';
import ChartSurface from './surfaces/ChartSurface';
import MirrorGraph from './surfaces/MirrorGraph';
import LeadCaptureCard from './LeadCaptureCard';
import PluginDockSurface from './surfaces/PluginDockSurface';
import { downloadMarkdownArtifact } from '@/lib/mirror/downloadArtifact';

interface TriPanelLayoutProps {
  messages: { role: "user" | "assistant"; content: string }[];
  a2uiState?: {
    components?: SurfaceNode[];
    dataModel?: Record<string, string>;
  };
  isLoading: boolean;
}

type SurfaceNode = {
  id: string;
  type: string;
  parent_id?: string;
  props?: {
    agent_id?: string | null;
    title?: string | null;
    severity?: string | null;
    surface_kind?: string | null;
  };
};

export default function TriPanelLayout({ messages, a2uiState, isLoading }: TriPanelLayoutProps) {
  const nodes = useMemo(() => a2uiState?.components || [], [a2uiState?.components]);
  const dataModel = useMemo(() => a2uiState?.dataModel || {}, [a2uiState?.dataModel]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [closedSurfaces, setClosedSurfaces] = useState<Set<string>>(new Set());
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsNarrow(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, dataModel]);

  const surfaceNodes = nodes.filter((n) =>
    n?.type && n.type !== 'fluid_grid' && !closedSurfaces.has(n?.id)
  );
  const governanceNodes = surfaceNodes.filter((n) => n?.type === 'governance_node');
  const displaySurfaces = surfaceNodes.filter((n) => n?.type !== 'governance_node');
  const hasSurfaces = displaySurfaces.length > 0;
  const stackSurfaces = hasSurfaces && isNarrow;
  const isGovernedWorkspace = (dataModel["generated_preview.title"] || "").toLowerCase().includes("governed genui");

  const closeSurface = (id: string) => {
    setClosedSurfaces(prev => new Set([...prev, id]));
  };

  const downloadWorkspacePack = () => {
    const sections = displaySurfaces
      .map((node) => {
        const title = dataModel[`${node.id}.title`] || node?.props?.title || node.id;
        const content = dataModel[`${node.id}.content`] || '';
        if (!content.trim()) return '';
        if (node?.props?.surface_kind === 'plugin_dock') {
          return `## ${title}\n\nPrepared capability dock is included in the workspace preview.`;
        }
        return `## ${title}\n\n${content}`;
      })
      .filter(Boolean);

    downloadMarkdownArtifact(
      'Active Mirror Workspace Pack',
      [
        '# Active Mirror Workspace Pack',
        '',
        'Generated in the public preview. Browser, media, automation, device, and live-send actions remain gated until they actually run.',
        '',
        ...sections,
      ].join('\n')
    );
  };

  const renderSurface = (node: SurfaceNode) => {
    const agentId = node?.props?.agent_id || 'ActiveMirror';
    const title = dataModel[`${node.id}.title`] || node?.props?.title || '';
    const content = dataModel[`${node.id}.content`] || '';
    const onClose = () => closeSurface(node.id);

    if (node?.props?.surface_kind === 'plugin_dock') {
      return <PluginDockSurface key={node.id} title={title} content={content} onClose={onClose} />;
    }

    switch (node.type) {
      case 'artifact_node':
        return <DocumentSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
      case 'browser_node':
        return <BrowserSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
      case 'chart_node':
        return <ChartSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
      case 'lead_node':
        return (
          <DocumentSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose}>
            <LeadCaptureCard />
          </DocumentSurface>
        );
      default:
        return <DocumentSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
    }
  };

  return (
    <div className={`flex h-full w-full overflow-hidden ${stackSurfaces ? 'flex-col' : 'flex-row'}`}>
      {/* LEFT: Chat Thread */}
      <motion.div
        animate={stackSurfaces
          ? { width: '100%', maxWidth: '100%', height: 'clamp(180px, 32vh, 280px)' }
          : { width: hasSurfaces ? '380px' : '100%', maxWidth: hasSurfaces ? '380px' : '640px', height: '100%' }
        }
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className={`flex flex-col min-h-0 shrink-0 ${hasSurfaces ? '' : 'mx-auto'}`}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-6 space-y-4">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const cleanContent = msg.content
              .replace(/\[VAULT CONTEXT:.*?\]\n\n/g, '')
              .replace(/\[SYSTEM AUTO-TRIGGER:.*?\]/g, '')
              .trim();
            if (!cleanContent) return null;

            return (
              <motion.div
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0071e3] to-[#5856d6] flex items-center justify-center mr-2.5 mt-0.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] ${isUser
                  ? 'bg-[#1d1d1f] text-white rounded-2xl rounded-br-sm px-4 py-2.5'
                  : 'text-[#1d1d1f] py-1'
                }`}>
                  <div className={`text-[14px] leading-relaxed ${isUser ? '' : 'prose prose-sm max-w-none prose-p:text-[#424245] prose-headings:text-[#1d1d1f] prose-strong:text-[#1d1d1f]'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Governance warnings inline in chat */}
          <AnimatePresence>
            {governanceNodes.map((node) => {
              const severity = node?.props?.severity || 'info';
              const isBlocked = severity === 'blocked';
              const isWarning = severity === 'warning';
              const title = dataModel[`${node.id}.title`] || node?.props?.title || '';
              const content = dataModel[`${node.id}.content`] || '';
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl border-2 p-3.5 ${isBlocked
                    ? 'border-red-200 bg-red-50'
                    : isWarning
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-blue-100 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {isBlocked
                      ? <ShieldAlert className="w-4 h-4 text-red-500" />
                      : isWarning
                        ? <AlertTriangle className="w-4 h-4 text-amber-500" />
                        : <Bot className="w-4 h-4 text-blue-500" />
                    }
                    <span className={`text-xs font-bold uppercase tracking-wider ${isBlocked ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-blue-600'}`}>
                      {isBlocked ? 'Review Lock' : isWarning ? 'Risk Note' : 'Trust Check'}
                    </span>
                  </div>
                  {title && <div className={`text-sm font-semibold mb-1 ${isBlocked ? 'text-red-800' : isWarning ? 'text-amber-800' : 'text-blue-900'}`}>{title}</div>}
                  <div className={`text-xs leading-relaxed ${isBlocked ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-blue-800'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Thinking indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="space-y-1.5 pt-1">
                {dataModel["thought_process"] ? (
                  <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-100">
                    {(JSON.parse(dataModel["thought_process"]) as string[]).map((thought: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-500 font-mono py-0.5">
                        <span className="text-blue-400 mt-0.5 shrink-0">●</span>
                        <span>{thought}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Contextual visual — what was generated */}
          <AnimatePresence>
            {hasSurfaces && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 flex flex-col items-start gap-4 py-6 w-full overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 w-full">
                  {displaySurfaces.map((node) => {
                    const typeMap: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
                      artifact_node: { icon: FileText, label: 'Document', color: 'text-blue-500 bg-blue-50/80 border-blue-100' },
                      browser_node: { icon: BookOpen, label: 'Preview', color: 'text-sky-500 bg-sky-50/80 border-sky-100' },
                      chart_node: { icon: BarChart3, label: 'Chart', color: 'text-emerald-500 bg-emerald-50/80 border-emerald-100' },
                      lead_node: { icon: Sparkles, label: 'Access', color: 'text-violet-500 bg-violet-50/80 border-violet-100' },
                      graph_node: { icon: Network, label: 'Graph', color: 'text-violet-500 bg-violet-50/80 border-violet-100' },
                    };
                    const info = node?.props?.surface_kind === 'plugin_dock'
                      ? { icon: Plug, label: 'Tools', color: 'text-gray-700 bg-gray-100/80 border-gray-200' }
                      : typeMap[node.type] || typeMap.artifact_node;
                    const Icon = info.icon;
                    const title = dataModel[`${node.id}.title`] || info.label;
                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-medium ${info.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="max-w-[120px] truncate">{title}</span>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.15, 0.5, 0.15] }}
                      transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                      className="w-1 h-1 rounded-full bg-[#0071e3]"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* RIGHT: Surfaces Area */}
      <AnimatePresence>
        {hasSurfaces && (
          <motion.div
            initial={stackSurfaces ? { opacity: 0, width: '100%' } : { opacity: 0, width: 0 }}
            animate={stackSurfaces ? { opacity: 1, width: '100%' } : { opacity: 1, width: 'auto' }}
            exit={stackSurfaces ? { opacity: 0, width: '100%' } : { opacity: 0, width: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className={`flex-1 min-h-0 ${stackSurfaces ? 'w-full border-t' : 'h-full border-l'} border-gray-100 overflow-hidden`}
          >
            <div className="flex h-full flex-col overflow-hidden bg-[#f7f8fa]">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white/85 px-4 py-3 backdrop-blur">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Generated Workspace</div>
                  <div className="text-sm font-semibold text-gray-950">
                    {isGovernedWorkspace ? "Provenance, doctrine, approvals, and receipts" : "Preview, artifact, proof, and next step"}
                  </div>
                </div>
                <div className="hidden items-center gap-2 text-[11px] font-medium text-gray-500 sm:flex">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    {isGovernedWorkspace ? "Governed route" : "Solution path"}
                  </span>
                  <button
                    type="button"
                    onClick={downloadWorkspacePack}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download pack
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                <div className="flex min-h-full flex-col gap-4 pb-6">
                  {displaySurfaces.some((n) => n?.type === 'graph_node') ? (
                    displaySurfaces.map((node) => {
                      if (node.type === 'graph_node') {
                        const agentId = node?.props?.agent_id || 'ActiveMirror';
                        const title = dataModel[`${node.id}.title`] || node?.props?.title || '';
                        return (
                          <div key={node.id} className={`${stackSurfaces ? 'h-[min(78vh,720px)] min-h-[430px]' : 'h-[min(78vh,760px)] min-h-[620px]'} shrink-0`}>
                            <MirrorGraph
                              title={title}
                              content={dataModel[`${node.id}.content`] || ''}
                              agentId={agentId}
                              onClose={() => closeSurface(node.id)}
                            />
                          </div>
                        );
                      }
                      return <div key={node.id} className={`${stackSurfaces ? 'h-[min(70vh,680px)] min-h-[420px]' : 'h-[min(56vh,560px)] min-h-[320px]'} shrink-0`}>{renderSurface(node)}</div>;
                    })
                  ) : displaySurfaces.length === 1 ? (
                    <div className={`h-full ${stackSurfaces ? 'min-h-[420px]' : 'min-h-[520px]'} shrink-0`}>{renderSurface(displaySurfaces[0])}</div>
                  ) : (
                    displaySurfaces.map((node, i) => (
                      <div
                        key={node.id}
                        className={`shrink-0 ${i === 0 || node.type === 'browser_node' ? `${stackSurfaces ? 'h-[min(78vh,720px)] min-h-[430px]' : 'h-[min(78vh,760px)] min-h-[560px]'}` : `${stackSurfaces ? 'h-[min(62vh,600px)] min-h-[340px]' : 'h-[min(58vh,620px)] min-h-[360px]'}`}`}
                      >
                        {renderSurface(node)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
