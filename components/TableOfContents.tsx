"use client";

import React, { useEffect, useState } from "react";
import { List, ChevronRight } from "lucide-react";
import type { Block } from "@/types/cms";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadingsFromBody(body?: Block[] | null): TocItem[] {
  if (!body || !Array.isArray(body)) return [];
  const items: TocItem[] = [];

  body.forEach((block, idx) => {
    const type = (block?.type || "").toLowerCase();
    const data = (block?.data || {}) as any;

    if (data?.heading && typeof data.heading === "string") {
      const id =
        data.heading
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `section-${idx}`;
      items.push({ id, text: data.heading, level: 2 });
    } else if (
      data?.title &&
      typeof data.title === "string" &&
      (type === "hero" || type === "alert" || type === "table" || type === "faq" || type === "cta")
    ) {
      const id =
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `section-${idx}`;
      items.push({ id, text: data.title, level: 2 });
    }

    // Extract Markdown headings (## and ###)
    const rawText = typeof data === "string" ? data : data?.html || data?.content || data?.body;
    if (typeof rawText === "string") {
      const headingRegex = /^(#{2,3})\s+(.+)$/gm;
      let match;
      while ((match = headingRegex.exec(rawText)) !== null) {
        if (match && match[1] && match[2]) {
          const level = match[1].length;
          const title = match[2].trim().replace(/<[^>]*>/g, "");
          const id =
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
          if (title && id) {
            items.push({ id, text: title, level });
          }
        }
      }
    }
  });

  return items;
}

export function TableOfContents({
  items: initialItems,
  body,
}: {
  items?: TocItem[];
  body?: Block[] | null;
}) {
  const serverExtracted = initialItems || (body ? extractHeadingsFromBody(body) : []);
  const [headings, setHeadings] = useState<TocItem[]>(serverExtracted);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("article h2, article h3, .prose-article h2, .prose-article h3, .prose h2, .prose h3")
    );

    if (elements.length > 0) {
      const liveExtracted: TocItem[] = elements
        .filter((el) => el.tagName.toLowerCase() !== "h1")
        .map((el, idx) => {
          let id = el.id;
          if (!id) {
            id =
              el.textContent
                ?.toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") || `heading-${idx}`;
            el.id = id;
          }
          return {
            id,
            text: el.textContent || "",
            level: el.tagName.toLowerCase() === "h3" ? 3 : 2,
          };
        });

      if (liveExtracted.length > 0) {
        setHeadings(liveExtracted);
      }
    }
  }, [body]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav
      aria-label="Table of contents"
      className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-5 backdrop-blur-xs"
    >
      <div className="flex items-center gap-2 font-semibold text-xs text-foreground uppercase tracking-wider">
        <List className="h-4 w-4 text-primary" />
        <span>Table of Contents</span>
      </div>

      {headings.length === 0 ? (
        <p className="text-xs text-muted-foreground">Article sections and jump links.</p>
      ) : (
        <ul className="space-y-2 text-sm leading-snug max-h-[65vh] overflow-y-auto pr-1">
          {headings.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li
                key={item.id}
                className={item.level === 3 ? "ml-4 text-xs" : "text-sm"}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(item.id);
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                      setActiveId(item.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "font-semibold text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.level === 3 ? (
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                  ) : null}
                  <span className="truncate">{item.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
