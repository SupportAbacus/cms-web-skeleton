import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FaqBlockData {
  title?: string;
  heading?: string;
  items?: { question: string; answer: string }[];
}

export function FaqBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as FaqBlockData;
  const title = d.heading ?? d.title;
  const items = d.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="my-10 space-y-6">
      {title ? (
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
      ) : null}
      <Accordion type="single" collapsible className="w-full">
        {items.map((it, idx) => (
          <AccordionItem key={idx} value={`faq-item-${idx}`}>
            <AccordionTrigger className="text-left font-medium">
              {it.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {it.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
