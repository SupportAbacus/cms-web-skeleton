import type { NextRequest } from "next/server";

/**
 * Resolves the true public origin of the application behind proxies / Docker containers.
 * Prevents internal binding addresses like 0.0.0.0:3000 or localhost from leaking into public redirects.
 */
export function getSafePublicOrigin(req?: NextRequest): string {
  // 1. Explicit returnUrl or origin query parameter passed by caller (e.g. CMS preview redirect)
  if (req) {
    const originParam = req.nextUrl.searchParams.get("origin");
    if (originParam) {
      try {
        const parsed = new URL(originParam);
        if (!parsed.host.includes("0.0.0.0") && (parsed.protocol === "http:" || parsed.protocol === "https:")) {
          return parsed.origin;
        }
      } catch {}
    }

    const returnUrlParam = req.nextUrl.searchParams.get("returnUrl");
    if (returnUrlParam) {
      try {
        const parsed = new URL(returnUrlParam);
        if (!parsed.host.includes("0.0.0.0") && (parsed.protocol === "http:" || parsed.protocol === "https:")) {
          return parsed.origin;
        }
      } catch {}
    }

    // 2. Reverse proxy headers (Nginx, Traefik, Cloudflare, etc.)
    const forwardedHost = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(",")[0]?.trim();
    const forwardedProto = (req.headers.get("x-forwarded-proto") || "https").split(",")[0]?.trim();
    if (forwardedHost && !forwardedHost.includes("0.0.0.0")) {
      return `${forwardedProto}://${forwardedHost}`;
    }
  }

  // 3. Environment variable SITE_DOMAIN or NEXT_PUBLIC_SITE_DOMAIN
  const envDomain = process.env.SITE_DOMAIN || process.env.NEXT_PUBLIC_SITE_DOMAIN;
  if (envDomain && !envDomain.includes("0.0.0.0") && envDomain !== "yourdomain.com") {
    const cleanDomain = envDomain.trim().replace(/\/+$/, "");
    if (cleanDomain.startsWith("http://") || cleanDomain.startsWith("https://")) {
      return cleanDomain;
    }
    const isLocal = cleanDomain.includes("localhost") || cleanDomain.includes("127.0.0.1");
    return `${isLocal ? "http" : "https"}://${cleanDomain}`;
  }

  // 4. Environment variable NEXT_PUBLIC_SITE_URL or SITE_URL
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl && !envUrl.includes("0.0.0.0")) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 5. req.nextUrl.origin fallback only if not unroutable 0.0.0.0
  if (req) {
    const reqOrigin = req.nextUrl.origin;
    if (reqOrigin && !reqOrigin.includes("0.0.0.0")) {
      return reqOrigin;
    }
  }

  // 6. Default safe production domain
  return "https://webcms.abacusdesk.co.in";
}
