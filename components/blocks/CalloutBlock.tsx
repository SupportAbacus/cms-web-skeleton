import React from "react";
import { Info, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";

export interface CalloutBlockData {
  title?: string;
  message?: string;
  text?: string;
  content?: string;
  variant?: "info" | "success" | "warning" | "destructive";
}

export function CalloutBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as CalloutBlockData;
  const variant = d.variant ?? "info";
  const title = d.title;
  const content = d.content ?? d.message ?? d.text ?? "";

  const icons = {
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    destructive: <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0" />,
  };

  const borders = {
    info: "border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-blue-950 dark:text-blue-100",
    success: "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100",
    warning: "border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-100",
    destructive: "border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100",
  };

  return (
    <div className={`my-6 flex gap-4 rounded-xl border p-5 shadow-xs ${borders[variant]}`}>
      {icons[variant]}
      <div className="space-y-1">
        {title ? <h4 className="font-semibold text-base leading-snug">{title}</h4> : null}
        {content ? <p className="text-sm opacity-90 leading-relaxed">{content}</p> : null}
      </div>
    </div>
  );
}
