import React from "react";
import { isAllowedEmbed } from "@/lib/security";
import { getMediaUrl } from "@/lib/cms-client";

export interface MediaEmbedBlockData {
  type?: "image" | "video";
  url?: string;
  src?: string;
  key?: string;
  alt?: string;
  caption?: string;
  title?: string;
  images?: { key?: string; src?: string; alt?: string }[];
}

export function MediaEmbedBlock({ data }: { data: unknown }) {
  const d = (data ?? {}) as MediaEmbedBlockData;
  const isVideo = d.type === "video" || !!d.url;

  if (isVideo && d.url) {
    let host = "";
    try {
      host = new URL(d.url).hostname;
    } catch {
      return null;
    }

    if (!isAllowedEmbed(host)) return null;

    let embedUrl = d.url;
    if (host.includes("youtube.com") && d.url.includes("watch?v=")) {
      const vid = new URL(d.url).searchParams.get("v");
      embedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (host.includes("youtu.be")) {
      const vid = new URL(d.url).pathname.replace("/", "");
      embedUrl = `https://www.youtube.com/embed/${vid}`;
    }

    return (
      <figure className="my-8 space-y-2">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-black aspect-16/9 shadow-xs">
          <iframe
            src={embedUrl}
            title={d.title ?? d.caption ?? "Embedded video"}
            loading="lazy"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
        {d.caption ? (
          <figcaption className="text-center text-xs text-muted-foreground">
            {d.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (Array.isArray(d.images) && d.images.length > 0) {
    return (
      <figure className="my-8 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {d.images.map((img, idx) => {
            const src = getMediaUrl(img);
            if (!src) return null;
            return (
              <div key={idx} className="overflow-hidden rounded-lg border border-border/40 bg-muted aspect-4/3">
                <img src={src} alt={img.alt ?? ""} className="h-full w-full object-cover" />
              </div>
            );
          })}
        </div>
        {d.caption ? (
          <figcaption className="text-center text-xs text-muted-foreground">
            {d.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const src = getMediaUrl(d);
  if (!src) return null;

  return (
    <figure className="my-8 space-y-2">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-muted shadow-xs">
        <img
          src={src}
          alt={d.alt ?? d.title ?? "Media content"}
          className="w-full aspect-21/9 object-cover"
        />
      </div>
      {d.caption ? (
        <figcaption className="text-center text-xs text-muted-foreground">
          {d.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
