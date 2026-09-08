import React from "react";
import { codeToHtml } from "shiki";
import { Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "./CopyButton";

export interface CodeBlockData {
  code?: string;
  language?: string;
  filename?: string;
}

export async function CodeBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as CodeBlockData;
  const rawCode = d.code ?? "";
  const lang = d.language || "typescript";
  const filename = d.filename;

  let highlightedHtml = "";
  try {
    highlightedHtml = await codeToHtml(rawCode, {
      lang: lang,
      theme: "github-dark",
    });
  } catch {
    highlightedHtml = "";
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Terminal className="h-3.5 w-3.5 text-zinc-500" />
          <span>{filename || `${lang}.code`}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-zinc-800 text-[10px] font-mono text-zinc-300">
            {lang}
          </Badge>
          <CopyButton text={rawCode} />
        </div>
      </div>

      <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        {highlightedHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className="[&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0! overflow-x-auto"
          />
        ) : (
          <pre className="p-0 m-0 overflow-x-auto">
            <code>{rawCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
