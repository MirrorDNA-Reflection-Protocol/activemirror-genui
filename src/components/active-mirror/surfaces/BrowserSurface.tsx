"use client";

import React from 'react';
import { X, ExternalLink, BookOpen, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface BrowserSurfaceProps {
  title: string;
  content: string;
  agentId: string;
  onClose?: () => void;
}

export default function BrowserSurface({ title, content, agentId, onClose }: BrowserSurfaceProps) {
  const sourceCards = extractSourceCards(content);

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94, filter: 'blur(14px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 20, scale: 0.96, filter: 'blur(8px)' }}
      transition={{ type: 'spring', damping: 26, stiffness: 200 }}
      className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden flex flex-col h-full"
    >
      {/* Reference Chrome */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-tight">{title || 'Research'}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{agentId} / references</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Reference Body */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="px-6 py-5">
          {sourceCards.length > 0 && (
            <div className="mb-5 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Source Previews
              </div>
              <div className="grid gap-2">
                {sourceCards.map((source) => (
                  <button
                    key={`${source.url}-${source.title}`}
                    type="button"
                    onClick={() => handleLinkClick(source.url)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2.5 text-left transition-colors hover:border-sky-200 hover:bg-sky-50"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-sky-700">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        {source.host}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] font-semibold text-gray-900">
                        {source.title}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-sky-700 group-hover:text-sky-900">
                      Open source
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-800 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-ul:text-gray-600 prose-blockquote:border-sky-300 prose-blockquote:bg-sky-50/50">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <button
                    onClick={() => href && handleLinkClick(href)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer bg-transparent border-none p-0"
                  >
                    {children}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </button>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function extractSourceCards(markdown: string) {
  const markdownLinks = Array.from(markdown.matchAll(/\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g)).map((match) => ({
    title: match[1].trim(),
    url: match[2].trim(),
  }));
  const bareLinks = Array.from(markdown.matchAll(/(^|\s)(https?:\/\/[^\s)]+)/g)).map((match) => ({
    title: match[2].trim(),
    url: match[2].trim(),
  }));

  const seen = new Set<string>();
  return [...markdownLinks, ...bareLinks]
    .map((source) => {
      try {
        const parsed = new URL(source.url);
        return {
          title: source.title.replace(/^https?:\/\//, '').slice(0, 96),
          url: parsed.toString(),
          host: parsed.hostname.replace(/^www\./, ''),
        };
      } catch {
        return null;
      }
    })
    .filter((source): source is { title: string; url: string; host: string } => {
      if (!source || seen.has(source.url)) return false;
      seen.add(source.url);
      return true;
    })
    .slice(0, 4);
}
