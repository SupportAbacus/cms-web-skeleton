import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

export interface AlertBlockData {
  title?: string;
  message?: string;
  description?: string;
  variant?: "default" | "warning" | "success" | "destructive";
}

export function AlertBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as AlertBlockData;
  const variant = d.variant ?? "default";
  const title = d.title;
  const message = d.message ?? d.description ?? "";

  const icons = {
    default: <Info className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    destructive: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <div className="my-6">
      <Alert variant={variant}>
        {icons[variant]}
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        {message ? <AlertDescription>{message}</AlertDescription> : null}
      </Alert>
    </div>
  );
}
