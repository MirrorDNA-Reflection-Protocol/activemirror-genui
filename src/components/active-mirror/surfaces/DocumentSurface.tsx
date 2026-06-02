"use client";

import React, { useState } from 'react';
import { FileText, X, Download, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentSurfaceProps {
  title: string;
  content: string;
  agentId?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

function filenameFromTitle(title: string) {
  const base = (title || "active-mirror-artifact")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "active-mirror-artifact"}.md`;
}

export default function DocumentSurface({ title, content, onClose, children }: DocumentSurfaceProps) {
  const [copied, setCopied] = useState(false);

  const copyContent = async () => {
    await navigator.clipboard?.writeText(content || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadContent = () => {
    const blob = new Blob([content || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filenameFromTitle(title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.92, filter: 'blur(12px)' }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 40, scale: 0.95, filter: 'blur(8px)' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden flex flex-col h-full min-h-0 animate-surface-enter"
    >
      {/* Document Chrome */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 leading-tight">{title || 'Document'}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Downloadable artifact</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyContent}
            disabled={!content}
            aria-label={copied ? "Copied artifact" : "Copy artifact"}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={downloadContent}
            disabled={!content}
            aria-label="Download artifact"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} aria-label="Close surface" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Document Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <article className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-100 prose-h1:pb-3 prose-h2:text-lg prose-h2:mt-6 prose-h3:text-base prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-800 prose-ul:text-gray-600 prose-li:text-gray-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-700 prose-code:text-xs prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50/50 prose-blockquote:text-gray-700 prose-blockquote:py-2 prose-blockquote:rounded-r-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
        {/* Typing cursor when content is still streaming */}
        {content && content.length > 0 && (
          <span className="inline-block w-0.5 h-4 bg-[#0071e3] animate-cursor ml-1 -mb-0.5" />
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </motion.div>
  );
}
