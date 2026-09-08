import React from "react";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/security";

export interface RichTextBlockData {
  content?: string;
  html?: string;
  body?: string;
  heading?: string;
  quote?: string;
  attribution?: string;
  author?: string;
  stats?: { label: string; value: string }[];
  events?: { date: string; title: string; description?: string }[];
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const renderer = new marked.Renderer();
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = slugifyHeading(text);
  return `<h${depth} id="${id}" class="scroll-mt-24 group">${text}</h${depth}>\n`;
};

marked.use({
  gfm: true,
  breaks: true,
  renderer,
});

export function renderMarkdownOrHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  try {
    const parsed = marked.parse(input) as string;
    return sanitizeHtml(parsed);
  } catch {
    return sanitizeHtml(input);
  }
}

export function RichTextBlock({ data }: { data: unknown }) {
  if (!data) return null;

  if (typeof data === "string") {
    const clean = renderMarkdownOrHtml(data);
    return (
      <div
        className="prose-article my-6"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  }

  const d = data as RichTextBlockData;

  const rawHtml = d.content ?? d.html ?? d.body;
  if (rawHtml && typeof rawHtml === "string") {
    const clean = renderMarkdownOrHtml(rawHtml);
    return (
      <div className="my-6">
        {d.heading ? (
          <h2 id={slugifyHeading(d.heading)} className="text-2xl font-bold tracking-tight mb-4 scroll-mt-24">
            {d.heading}
          </h2>
        ) : null}
        <div
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      </div>
    );
  }

  if (d.quote) {
    return (
      <blockquote className="my-8 border-l-4 border-primary pl-6 italic text-foreground/90 text-lg">
        <p>"{d.quote}"</p>
        {d.attribution || d.author ? (
          <footer className="mt-2 text-sm not-italic font-medium text-muted-foreground">
            &mdash; {d.attribution || d.author}
          </footer>
        ) : null}
      </blockquote>
    );
  }

  if (Array.isArray(d.stats) && d.stats.length > 0) {
    return (
      <dl className="my-8 grid grid-cols-2 sm:grid-cols-3 gap-6 rounded-xl border border-border/50 bg-muted/30 p-6">
        {d.stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-1">
            <dt className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
              {s.value}
            </dt>
            <dd className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {s.label}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  if (Array.isArray(d.events) && d.events.length > 0) {
    return (
      <ol className="my-8 relative border-l border-border/60 ml-4 space-y-6">
        {d.events.map((e, i) => (
          <li key={i} className="ml-6">
            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background bg-primary" />
            <time className="text-xs font-semibold text-primary uppercase tracking-wider">
              {e.date}
            </time>
            <h3 className="text-base font-bold text-foreground mt-0.5">{e.title}</h3>
            {e.description ? (
              <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    );
  }

  return null;
}
