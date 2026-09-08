import "server-only";
import fs from "fs";
import path from "path";
import type { Block, Blog, Product } from "../types/cms";
import { sanitizeSiteConfig, type SiteConfig } from "./site-config";

// Cache env file reads at module load time — avoid disk I/O on every request
const _envCache = new Map<string, string>();
(function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const eq = t.indexOf("=");
        if (eq !== -1) {
          const k = t.slice(0, eq).trim();
          const v = t.slice(eq + 1).trim();
          if (k && v) _envCache.set(k, v);
        }
      }
    }
  } catch {}
})();
function getEnvVar(key: string, defaultValue: string = ""): string {
  return _envCache.get(key) ?? process.env[key] ?? defaultValue;
}

function getBaseUrl(): string {
  let url = (
    getEnvVar("CMS_API_BASE") ||
    getEnvVar("CMS_BASE_URL") ||
    getEnvVar("CMS_API_URL") ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  if (url === "http://localhost" || url === "https://localhost") {
    url = "http://localhost:3000";
  }
  return url;
}

export function getApiKey(): string {
  return (
    getEnvVar("CMS_API_KEY") ||
    "pk_-Uhi_Rplb8xd-r9HctU1QabL_dVudgIBLbD2fStAkAg"
  );
}

export function getDefaultSiteKey(): string {
  return (
    getEnvVar("CMS_SITE_KEY") ||
    getEnvVar("NEXT_PUBLIC_SITE_KEY") ||
    "local-test"
  );
}

export type PublishedContent = Product | Blog;

export interface Category {
  id: number;
  siteId: number;
  name: string;
  slug: string;
}

export interface Author {
  id: number;
  siteId: number;
  name: string;
  slug: string;
  bio: string | null;
}

export interface ListResponse<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

export interface ListParams {
  cursor?: string | null;
  limit?: number;
  filters?: Record<string, string>;
}

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
}

export interface RedirectEntry {
  source: string;
  destination: string;
  permanent: boolean;
}

export interface BlogMdxResponse {
  slug: string;
  mdx: string;
  frontmatter: Record<string, any>;
}

export async function fetchCmsResponse(
  path: string,
  tags: string[],
  siteKey?: string
): Promise<Response | null> {
  const baseUrl = getBaseUrl();
  const apiKey = getApiKey();
  const targetSiteKey = siteKey || getDefaultSiteKey();

  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  if (targetSiteKey) {
    headers["X-Site-Key"] = targetSiteKey;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${baseUrl}${path}`, {
      headers,
      signal: controller.signal,
      next: { revalidate: 300, tags: tags },
    });
    clearTimeout(timeoutId);

    if (res.status === 404 || !res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} from ${baseUrl}${path}: ${errText}`);
    }
    return res;
  } catch (err: any) {
    throw new Error(`Failed to fetch ${baseUrl}${path}: ${err?.message}`);
  }
}

async function fetchCms<T>(
  path: string,
  tags: string[],
  siteKey?: string
): Promise<T | null> {
  try {
    const res = await fetchCmsResponse(path, tags, siteKey);
    if (!res) return null;
    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`[CMS Client] Error fetching ${path}:`, err?.message);
    return null;
  }
}

export async function listContent(
  siteKey: string = process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test",
  type: string = "blog",
  opts: ListParams = {}
): Promise<ListResponse<PublishedContent>> {
  const qs = new URLSearchParams();
  if (opts.cursor) qs.set("cursor", opts.cursor);
  if (opts.limit) qs.set("limit", opts.limit.toString());
  if (siteKey) qs.set("siteKey", siteKey);
  if (opts.filters) {
    for (const [k, v] of Object.entries(opts.filters)) qs.set(k, v);
  }
  const query = qs.toString() ? `?${qs.toString()}` : "";
  const remoteData = await fetchCms<ListResponse<PublishedContent>>(
    `/api/v1/content/${type}${query}`,
    [`cms:${siteKey}:${type}`, `cms:${type}`],
    siteKey
  );

  if (remoteData && Array.isArray(remoteData.items)) {
    return remoteData;
  }

  return {
    items: [],
    nextCursor: null,
    total: 0,
  };
}

export async function getContent(
  siteKey: string = process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test",
  type: string = "blog",
  slug: string
): Promise<PublishedContent | null> {
  return await fetchCms<PublishedContent>(
    `/api/v1/content/${type}/${slug}`,
    [`cms:${siteKey}:${type}:${slug}`, `cms:${type}:${slug}`],
    siteKey
  );
}

export async function getBlogMdx(
  siteKey: string = process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test",
  slug: string
): Promise<BlogMdxResponse | null> {
  return await fetchCms<BlogMdxResponse>(
    `/api/v1/content/blogs/${slug}/mdx`,
    [`cms:${siteKey}:blogs:${slug}:mdx`],
    siteKey
  );
}

export async function getCategories(siteKey?: string): Promise<Category[]> {
  const targetSiteKey = siteKey || getDefaultSiteKey();
  const data = await fetchCms<{ items: Category[] }>(
    `/api/v1/categories?siteKey=${targetSiteKey}`,
    ["cms:categories"],
    targetSiteKey
  );
  return data?.items ?? [];
}

export async function getAuthor(slugOrId: string | number, siteKey?: string): Promise<Author | null> {
  const targetSiteKey = siteKey || getDefaultSiteKey();
  const data = await fetchCms<Author>(
    `/api/v1/authors/${slugOrId}?siteKey=${targetSiteKey}`,
    [`cms:author:${slugOrId}`],
    targetSiteKey
  );
  return data ?? null;
}

export async function getSitemap(siteKey?: string): Promise<SitemapEntry[]> {
  const targetSiteKey = siteKey || getDefaultSiteKey();
  const res = await fetchCmsResponse(`/api/v1/sitemap?siteKey=${targetSiteKey}`, ["cms:sitemap"], targetSiteKey);
  if (!res) return [];
  try {
    const xml = await res.text();
    return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (m) => ({ url: m[1]! }));
  } catch {
    return [];
  }
}

export async function getSiteConfig(siteKey?: string): Promise<SiteConfig> {
  const targetSiteKey = siteKey || getDefaultSiteKey();
  const data = await fetchCms<SiteConfig>(
    `/api/v1/site-config?siteKey=${targetSiteKey}`,
    ["cms:site-config"],
    targetSiteKey
  );
  return sanitizeSiteConfig(data);
}

export async function getRedirects(): Promise<RedirectEntry[]> {
  const data = await fetchCms<{ items: RedirectEntry[] }>("/api/v1/redirects", ["cms:redirects"]);
  return data?.items ?? [];
}

export function getMediaUrl(
  media?: string | { key?: string; url?: string; src?: string } | null
): string | null {
  if (!media) return null;
  const raw =
    typeof media === "string"
      ? media
      : media.url || media.src || media.key;

  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // If already an absolute HTTP/HTTPS URL or data/blob URI, return as-is
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // If already starts with /cdn/
  if (trimmed.startsWith("/cdn/")) {
    const afterCdn = trimmed.slice(5);
    if (/^(https?:|\/\/)/i.test(afterCdn)) {
      return afterCdn;
    }
    return trimmed;
  }

  // If starts with /uploads/, route via /cdn/
  if (trimmed.startsWith("/uploads/")) {
    return `/cdn/${trimmed.slice(1)}`;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Otherwise it's a relative S3 storage key like "uploads/..." -> route via /cdn/:key*
  return `/cdn/${trimmed}`;
}

export function formatDate(
  dateString?: string | number | Date | null,
  formatType?: "long" | "short"
): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";

  if (formatType === "long") {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}



