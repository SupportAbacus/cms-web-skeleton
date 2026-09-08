import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getMediaUrl } from "@/lib/cms-client";

export interface HeroBlockData {
  title?: string;
  subtitle?: string;
  tagline?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaVariant?: "default" | "secondary" | "outline";
  image?: { key?: string; alt?: string; src?: string };
}

export function HeroBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as HeroBlockData;
  const title = d.title ?? "";
  const subtitle = d.subtitle ?? d.tagline ?? "";
  const ctaText = d.ctaText;
  const ctaLink = d.ctaLink ?? "/";
  const imageSrc = getMediaUrl(d.image);

  if (!title && !subtitle && !imageSrc) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-linear-to-b from-muted/50 via-muted/20 to-background p-8 sm:p-12 my-8 shadow-xs">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground text-balance">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-lg text-muted-foreground sm:text-xl text-balance">
            {subtitle}
          </p>
        ) : null}
        {ctaText ? (
          <div className="pt-2">
            <Button size="lg" variant={d.ctaVariant ?? "default"} asChild>
              <Link href={ctaLink} className="inline-flex items-center gap-2">
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
      {imageSrc ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-border/40 shadow-md">
          <img
            src={imageSrc}
            alt={d.image?.alt ?? title}
            className="w-full aspect-21/9 object-cover"
          />
        </div>
      ) : null}
    </section>
  );
}
