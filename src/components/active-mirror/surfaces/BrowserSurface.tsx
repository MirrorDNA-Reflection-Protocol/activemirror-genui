"use client";

import React, { useMemo, useState } from "react";
import { X, ExternalLink, Globe, ShieldCheck, Download, Copy, Sparkles, MousePointer2, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { downloadMarkdownArtifact } from "@/lib/mirror/downloadArtifact";

interface BrowserSurfaceProps {
  title: string;
  content: string;
  agentId: string;
  onClose?: () => void;
}

function slugFromTitle(title: string) {
  return (title || "generated-preview")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "generated-preview";
}

function previewModules(markdown: string) {
  const modules = Array.from(markdown.matchAll(/-\s+\*\*([^:*]+):\*\*\s*([^\n]+)/g))
    .map((match) => ({
      title: match[1].trim(),
      body: match[2].trim(),
    }))
    .filter((module) => module.title.length > 0)
    .slice(0, 4);

  if (modules.length >= 3) return modules;

  return [
    { title: "Generated preview", body: "A task-specific screen appears first, so the user sees the solution before the explanation." },
    { title: "Downloadable spec", body: "A scoped brief and checklist can be saved immediately to reduce extra turns." },
    { title: "Proof path", body: "Sources, files, review notes, and claims appear only when relevant." },
    { title: "Working demo", body: "The final step offers a 72-hour scoped demo build from the generated spec." },
  ];
}

export default function BrowserSurface({ title, content, onClose }: BrowserSurfaceProps) {
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sourceCards = useMemo(() => extractSourceCards(content), [content]);
  const modules = useMemo(() => previewModules(content), [content]);
  const activeModule = modules[Math.min(activeIndex, Math.max(modules.length - 1, 0))] || modules[0];
  const slug = slugFromTitle(title);
  const browserUrl = sourceCards[0]?.url || `active://generated/${slug}`;

  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyContent = async () => {
    await navigator.clipboard?.writeText(content || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadContent = () => {
    downloadMarkdownArtifact(title || "Generated Preview", content || "");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.95, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 18, scale: 0.97, filter: "blur(8px)" }}
      transition={{ type: "spring", damping: 26, stiffness: 200 }}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-2xl"
    >
      <div className="border-b border-gray-200 bg-[#f6f7f8] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 px-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <button
            type="button"
            onClick={() => sourceCards[0] && handleLinkClick(sourceCards[0].url)}
            className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-left text-[12px] font-medium text-gray-500 shadow-sm transition-colors hover:border-gray-300"
          >
            <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{browserUrl}</span>
            {sourceCards[0] && <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />}
          </button>
          <button
            onClick={copyContent}
            disabled={!content}
            aria-label={copied ? "Copied preview" : "Copy preview"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white hover:text-gray-700 disabled:opacity-40"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={downloadContent}
            disabled={!content}
            aria-label="Download preview"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white hover:text-gray-700 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <section className="border-b border-gray-100 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#f6fff8_100%)] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Generated Preview
              </div>
              <h2 className="text-xl font-semibold tracking-normal text-gray-950 sm:text-2xl">{title || "Live Workspace Preview"}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                The workspace changes to match the request, then packages the useful output into a downloadable spec.
              </p>
            </div>
            <div className="hidden rounded-xl border border-gray-200 bg-white px-3 py-2 text-right shadow-sm sm:block">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Target</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">Solution in 10 turns</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="grid gap-2">
            {modules.map((module, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={`${module.title}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left shadow-sm transition-all ${
                    selected
                      ? "border-gray-950 bg-gray-950 text-white shadow-md"
                      : "border-gray-200 bg-white text-gray-900 hover:border-blue-200 hover:bg-blue-50/40"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${
                    selected ? "bg-white text-gray-950" : "bg-gray-950 text-white"
                  }`}>
                    <MousePointer2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{module.title}</span>
                    <span className={`mt-0.5 block truncate text-[11px] ${selected ? "text-white/70" : "text-gray-500"}`}>
                      {selected ? "Now showing" : "Open lane"}
                    </span>
                  </span>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${selected ? "text-white" : "text-gray-400"}`} />
                </button>
              );
            })}
          </div>

          <motion.article
            key={activeModule?.title || "generated-lane"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="relative min-h-[300px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 p-4 text-white shadow-xl"
          >
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.35),transparent_34%),radial-gradient(circle_at_86%_8%,rgba(16,185,129,0.22),transparent_30%)]" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/75">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live lane
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Useful draft
                </div>
              </div>
              <h3 className="text-2xl font-semibold tracking-normal">{activeModule?.title || "Generated surface"}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{activeModule?.body || "A working surface appears for the user's request."}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Draft", "Surface generated"],
                  ["Proof", sourceCards.length ? "Source target ready" : "Assumptions marked"],
                  ["Export", "Spec downloadable"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/45">{label}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.06] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Next move</div>
                    <div className="mt-1 text-sm text-white/80">Use this lane, export the artifact, or open reviewed access for live data.</div>
                  </div>
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-950 sm:flex">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.article>

          <div className="grid gap-3 lg:col-span-2 sm:grid-cols-2">
            {modules.map((module, index) => (
            <article
              key={`${module.title}-${index}`}
              className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/35"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-white shadow-sm transition-transform group-hover:scale-105">
                <MousePointer2 className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-gray-950">{module.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-gray-600">{module.body}</p>
            </article>
            ))}
          </div>
        </section>

        {sourceCards.length > 0 && (
          <section className="border-y border-sky-100 bg-sky-50/50 px-5 py-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Browser Source Targets
            </div>
            <div className="grid gap-2">
              {sourceCards.map((source) => (
                <button
                  key={`${source.url}-${source.title}`}
                  type="button"
                  onClick={() => handleLinkClick(source.url)}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:border-sky-200"
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
                    Open
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="px-5 py-5 sm:px-6">
          <div className="prose prose-sm max-w-none prose-headings:text-gray-950 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-ul:text-gray-600 prose-blockquote:border-sky-300 prose-blockquote:bg-sky-50/50">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <button
                    onClick={() => href && handleLinkClick(href)}
                    className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {children}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </button>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </section>
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
          title: source.title.replace(/^https?:\/\//, "").slice(0, 96),
          url: parsed.toString(),
          host: parsed.hostname.replace(/^www\./, ""),
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
