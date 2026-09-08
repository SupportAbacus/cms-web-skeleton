"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ContactFormProps {
  siteKey: string;
  formKey?: string;
  fields?: FormField[];
  submitLabel?: string;
  apiBase?: string;
}

const DEFAULT_FIELDS: FormField[] = [
  { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Jane Doe" },
  { name: "email", label: "Email Address", type: "email", required: true, placeholder: "jane@example.com" },
  { name: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help you?" },
];

export function ContactForm({
  siteKey,
  formKey = "contact",
  fields = DEFAULT_FIELDS,
  submitLabel = "Send Message",
  apiBase,
}: ContactFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData["_gotcha"]) {
      console.warn("Honeypot triggered");
      setSubmitted(true);
      return;
    }

    setIsPending(true);
    try {
      const { toast } = await import("sonner");
      const base = apiBase || (typeof window !== "undefined" ? window.location.origin : "");
      const res = await fetch(`${base}/api/v1/forms/${siteKey}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formKey,
          data: formData,
          _gotcha: formData["_gotcha"] || "",
        }),
      });

      if (res.ok) {
        toast.success("Thank you! Your message has been received.");
        setSubmitted(true);
        setFormData({});
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || `Submission failed (HTTP ${res.status}).`);
      }
    } catch {
      try {
        const { toast } = await import("sonner");
        toast.error("Network error: Could not reach the form submission endpoint.");
      } catch {
        // ignore
      }
    } finally {
      setIsPending(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-8 text-center space-y-3">
        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Message Sent!</h3>
        <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
          We have received your submission and our team will get back to you shortly.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-xs">
      {/* Invisible Honeypot */}
      <input
        type="text"
        name="_gotcha"
        value={formData["_gotcha"] || ""}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
      />

      <div className="grid gap-4 sm:grid-cols-1">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5 text-left">
            <label htmlFor={field.name} className="text-xs font-semibold text-foreground">
              {field.label} {field.required ? <span className="text-destructive">*</span> : null}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                required={field.required}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            )}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <span>{submitLabel}</span>
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
