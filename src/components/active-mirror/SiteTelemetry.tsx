"use client";

import { useEffect, useRef } from "react";
import { newPageId, trackSiteEvent } from "@/lib/siteAnalytics";

const SECTION_THRESHOLD = 0.55;
const SCROLL_MARKS = [25, 50, 75, 90];

function readableLabel(target: Element) {
  const text = target.textContent?.replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 160);
  if (target instanceof HTMLElement) return target.getAttribute("aria-label") || target.title || target.id || target.tagName.toLowerCase();
  return target.tagName.toLowerCase();
}

function sectionName(target: Element) {
  const section = target.closest("section, header, footer, nav");
  if (!section) return "";
  return section.id || section.className.toString().split(/\s+/)[0] || section.tagName.toLowerCase();
}

export default function SiteTelemetry({ surface }: { surface: "public_site" | "mirror_app" | "intake" | "support_page" }) {
  const pageIdRef = useRef<string | null>(null);
  const maxScrollRef = useRef(0);
  const sentScrollMarks = useRef(new Set<number>());
  const seenSections = useRef(new Set<string>());

  useEffect(() => {
    const pageId = pageIdRef.current ?? newPageId();
    pageIdRef.current = pageId;
    const startedAt = Date.now();

    trackSiteEvent({ event: "page_view", pageId, target: surface });

    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a, button") : null;
      if (!target) return;
      const analyticsTarget = target.getAttribute("data-analytics");
      if (!analyticsTarget) return;
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
      trackSiteEvent({
        event: "cta_click",
        pageId,
        target: analyticsTarget,
        label: readableLabel(target),
        href,
        section: sectionName(target),
      });
    }

    function onScroll() {
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (depth > maxScrollRef.current) maxScrollRef.current = depth;
      for (const mark of SCROLL_MARKS) {
        if (depth >= mark && !sentScrollMarks.current.has(mark)) {
          sentScrollMarks.current.add(mark);
          trackSiteEvent({ event: "scroll_depth", pageId, target: `${mark}`, durationMs: Date.now() - startedAt });
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < SECTION_THRESHOLD) continue;
          const name = entry.target.id || entry.target.getAttribute("data-analytics-section") || entry.target.className.toString().split(/\s+/)[0];
          if (!name || seenSections.current.has(name)) continue;
          seenSections.current.add(name);
          trackSiteEvent({ event: "section_view", pageId, section: name, durationMs: Date.now() - startedAt });
        }
      },
      { threshold: [SECTION_THRESHOLD] }
    );

    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.querySelectorAll("section, header, footer").forEach((section) => observer.observe(section));

    function onVisibilityOrUnload() {
      if (document.visibilityState !== "hidden") return;
      trackSiteEvent({
        event: "page_exit",
        pageId,
        target: surface,
        durationMs: Date.now() - startedAt,
        meta: { maxScroll: maxScrollRef.current },
      });
    }

    document.addEventListener("visibilitychange", onVisibilityOrUnload);
    return () => {
      trackSiteEvent({
        event: "page_exit",
        pageId,
        target: surface,
        durationMs: Date.now() - startedAt,
        meta: { maxScroll: maxScrollRef.current },
      });
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityOrUnload);
      observer.disconnect();
    };
  }, [surface]);

  return null;
}
