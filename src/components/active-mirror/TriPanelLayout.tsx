"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Bot, User, Sparkles, FileText, Network, BarChart3, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

import DocumentSurface from './surfaces/DocumentSurface';
import BrowserSurface from './surfaces/BrowserSurface';
import ChartSurface from './surfaces/ChartSurface';
import MirrorGraph from './surfaces/MirrorGraph';

interface TriPanelLayoutProps {
  messages: { role: "user" | "assistant"; content: string }[];
  a2uiState: any;
  isLoading: boolean;
}

export default function TriPanelLayout({ messages, a2uiState, isLoading }: TriPanelLayoutProps) {
  const nodes = a2uiState?.components || [];
  const dataModel = a2uiState?.dataModel || {};
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

  const surfaceNodes = nodes.filter((n: any) =>
    n?.type && n.type !== 'fluid_grid' && !closedSurfaces.has(n?.id)
  );
  const governanceNodes = surfaceNodes.filter((n: any) => n?.type === 'governance_node');
  const displaySurfaces = surfaceNodes.filter((n: any) => n?.type !== 'governance_node');
  const hasSurfaces = displaySurfaces.length > 0;
  const stackSurfaces = hasSurfaces && isNarrow;

  const closeSurface = (id: string) => {
    setClosedSurfaces(prev => new Set([...prev, id]));
  };

  const renderSurface = (node: any, index: number) => {
    const agentId = node?.props?.agent_id || 'ActiveMirror';
    const title = dataModel[`${node.id}.title`] || node?.props?.title || '';
    const content = dataModel[`${node.id}.content`] || '';
    const onClose = () => closeSurface(node.id);

    switch (node.type) {
      case 'artifact_node':
        return <DocumentSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
      case 'browser_node':
        return <BrowserSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
      case 'chart_node':
        return <ChartSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
      default:
        return <DocumentSurface key={node.id} title={title} content={content} agentId={agentId} onClose={onClose} />;
    }
  };

  return (
    <div className={`flex h-full w-full overflow-hidden ${stackSurfaces ? 'flex-col' : 'flex-row'}`}>
      {/* LEFT: Chat Thread */}
      <motion.div
        animate={stackSurfaces
          ? { width: '100%', maxWidth: '100%', height: '34%' }
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
                    <ReactMarkdown>{cleanContent}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Governance warnings inline in chat */}
          <AnimatePresence>
            {governanceNodes.map((node: any) => {
              const isBlocked = node?.props?.severity === 'blocked';
              const title = dataModel[`${node.id}.title`] || node?.props?.title || '';
              const content = dataModel[`${node.id}.content`] || '';
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl border-2 p-3.5 ${isBlocked
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {isBlocked
                      ? <ShieldAlert className="w-4 h-4 text-red-500" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500" />
                    }
                    <span className={`text-xs font-bold uppercase tracking-wider ${isBlocked ? 'text-red-600' : 'text-amber-600'}`}>
                      {isBlocked ? 'Governance Lock' : 'Policy Warning'}
                    </span>
                  </div>
                  {title && <div className={`text-sm font-semibold mb-1 ${isBlocked ? 'text-red-800' : 'text-amber-800'}`}>{title}</div>}
                  <div className={`text-xs leading-relaxed ${isBlocked ? 'text-red-700' : 'text-amber-700'}`}>
                    <ReactMarkdown>{content}</ReactMarkdown>
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
                  {displaySurfaces.map((node: any) => {
                    const typeMap: Record<string, { icon: any; label: string; color: string }> = {
                      artifact_node: { icon: FileText, label: 'Document', color: 'text-blue-500 bg-blue-50/80 border-blue-100' },
                      browser_node: { icon: BookOpen, label: 'Reference', color: 'text-sky-500 bg-sky-50/80 border-sky-100' },
                      chart_node: { icon: BarChart3, label: 'Chart', color: 'text-emerald-500 bg-emerald-50/80 border-emerald-100' },
                      graph_node: { icon: Network, label: 'Graph', color: 'text-violet-500 bg-violet-50/80 border-violet-100' },
                    };
                    const info = typeMap[node.type] || typeMap.artifact_node;
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
            initial={stackSurfaces ? { opacity: 0, height: 0 } : { opacity: 0, width: 0 }}
            animate={stackSurfaces ? { opacity: 1, height: '66%' } : { opacity: 1, width: 'auto' }}
            exit={stackSurfaces ? { opacity: 0, height: 0 } : { opacity: 0, width: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className={`flex-1 min-h-0 ${stackSurfaces ? 'w-full border-t' : 'h-full border-l'} border-gray-100 overflow-hidden`}
          >
            <div className="h-full p-4 space-y-4 overflow-y-auto">
              {/* Check if any node is a graph type — give it full height */}
              {displaySurfaces.some((n: any) => n?.type === 'graph_node') ? (
                // Graph gets full space
                displaySurfaces.map((node: any) => {
                  if (node.type === 'graph_node') {
                    const agentId = node?.props?.agent_id || 'ActiveMirror';
                    const title = dataModel[`${node.id}.title`] || node?.props?.title || '';
                    return (
                      <div key={node.id} className="h-full">
                        <MirrorGraph
                          title={title}
                          content={dataModel[`${node.id}.content`] || ''}
                          agentId={agentId}
                          onClose={() => closeSurface(node.id)}
                        />
                      </div>
                    );
                  }
                  return <div key={node.id} className="h-[45%] min-h-[280px]">{renderSurface(node, 0)}</div>;
                })
              ) : displaySurfaces.length === 1 ? (
                // Single surface gets full height
                <div className="h-full">{renderSurface(displaySurfaces[0], 0)}</div>
              ) : (
                // Multiple surfaces split space
                displaySurfaces.map((node: any, i: number) => (
                  <div key={node.id} className="h-[48%] min-h-[280px]">{renderSurface(node, i)}</div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
