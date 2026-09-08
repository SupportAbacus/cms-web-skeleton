import type { MetadataRoute } from "next";
import { getSitemap, getSiteConfig } from "@/lib/cms-client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, config] = await Promise.all([getSitemap(), getSiteConfig()]);
  const noIndexSet = new Set(config.noIndexPaths.map((p) => p.replace(/\/$/, "")));

  const primaryHost = config.domains?.find((d) => d.isPrimary)?.host ?? config.domains?.[0]?.host;
  const baseDomain = primaryHost || process.env.NEXT_PUBLIC_SITE_DOMAIN || "localhost:3000";
  const baseUrl = baseDomain.startsWith("http") ? baseDomain : `https://${baseDomain}`;

  const defaultEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const dynamicEntries: MetadataRoute.Sitemap = entries
    .filter((entry) => {
      try {
        const u = new URL(entry.url);
        const pathOnly = u.pathname.replace(/\/$/, "");
        return !noIndexSet.has(pathOnly);
      } catch {
        return true;
      }
    })
    .map((entry) => ({
      url: entry.url,
      lastModified: entry.lastModified ? new Date(entry.lastModified) : new Date(),
      changeFrequency: (entry.changeFrequency as any) || "weekly",
      priority: entry.priority || 0.8,
    }));

  return [...defaultEntries, ...dynamicEntries];
}
