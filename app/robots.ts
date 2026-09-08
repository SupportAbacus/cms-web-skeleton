import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/cms-client";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getSiteConfig();
  const primaryHost = config.domains?.find((d) => d.isPrimary)?.host ?? config.domains?.[0]?.host;
  const baseDomain = primaryHost || process.env.NEXT_PUBLIC_SITE_DOMAIN || "localhost:3000";
  const baseUrl = baseDomain.startsWith("http") ? baseDomain : `https://${baseDomain}`;

  const disallow = Array.from(
    new Set(["/api/*", "/admin/*", "/auth/*", ...config.noIndexPaths])
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
