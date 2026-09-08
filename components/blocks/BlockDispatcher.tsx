import React from "react";
import type { Block } from "@/types/cms";
import { HeroBlock } from "./HeroBlock";
import { CtaBlock } from "./CtaBlock";
import { CalloutBlock } from "./CalloutBlock";
import { AlertBlock } from "./AlertBlock";
import { FaqBlock } from "./FaqBlock";
import { CodeBlock } from "./CodeBlock";
import { MediaEmbedBlock } from "./MediaEmbedBlock";
import { TableBlock } from "./TableBlock";
import { RichTextBlock } from "./RichTextBlock";

export interface BlockDispatcherProps {
  body?: Block[] | null;
  className?: string;
}

export function BlockDispatcher({ body, className }: BlockDispatcherProps) {
  if (!body || !Array.isArray(body) || body.length === 0) {
    return null;
  }

  return (
    <div className={className ?? "space-y-6"}>
      {body.map((block, index) => {
        const type = (block?.type || "").toLowerCase().replace(/[-_]/g, "");
        const data = block?.data;

        switch (type) {
          case "hero":
            return <HeroBlock key={index} data={data} />;
          case "cta":
          case "ctasection":
            return <CtaBlock key={index} data={data} />;
          case "callout":
            return <CalloutBlock key={index} data={data} />;
          case "alert":
            return <AlertBlock key={index} data={data} />;
          case "faq":
          case "faqgroup":
            return <FaqBlock key={index} data={data} />;
          case "code":
          case "codeblock":
            return <CodeBlock key={index} data={data} />;
          case "mediaembed":
          case "videoembed":
          case "imagecaption":
          case "imagegallery":
            return <MediaEmbedBlock key={index} data={data} />;
          case "table":
          case "specstable":
            return <TableBlock key={index} data={data} />;
          case "richtext":
          case "headingparagraph":
          case "quote":
          case "statsrow":
          case "timeline":
          case "featurelist":
          case "benefitslist":
            return <RichTextBlock key={index} data={data} />;
          default:
            if (process.env.NODE_ENV === "development") {
              console.warn(`[BlockDispatcher] Unknown block type: "${block?.type}". Skipping render.`);
            }
            return null;
        }
      })}
    </div>
  );
}
