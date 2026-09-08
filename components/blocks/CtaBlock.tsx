import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export interface CtaBlockData {
  title?: string;
  heading?: string;
  description?: string;
  body?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  href?: string;
  label?: string;
}

export function CtaBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as CtaBlockData;
  const title = d.heading ?? d.title;
  const desc = d.description ?? d.body ?? "";
  const primaryText = d.primaryButtonText ?? d.label;
  const primaryLink = d.primaryButtonLink ?? d.href ?? "/";
  const secondaryText = d.secondaryButtonText;
  const secondaryLink = d.secondaryButtonLink;

  if (!title && !desc && !primaryText) return null;

  return (
    <section className="my-10 rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-primary/10 to-muted p-8 sm:p-12 text-center">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {desc ? (
          <p className="text-base text-muted-foreground leading-relaxed">
            {desc}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button size="lg" asChild>
            <Link href={primaryLink} className="inline-flex items-center gap-2">
              <span>{primaryText}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryText && secondaryLink ? (
            <Button size="lg" variant="outline" asChild>
              <Link href={secondaryLink}>
                {secondaryText}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
