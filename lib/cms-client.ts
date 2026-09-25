import "server-only";
import type { Blog, Product } from "../types/cms";
import { sanitizeSiteConfig, type SiteConfig } from "./site-config";

function getEnvVar(key: string, defaultValue: string = ""): string {
  return process.env[key] ?? defaultValue;
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

function getArtifactBaseUrl(): string {
  return getEnvVar("CMS_ARTIFACT_BASE_URL").replace(/\/$/, "");
}

function publicContentType(type: string): string {
  return ({ blogs: "blog", products: "product", services: "service", "content-items": "page" } as Record<string, string>)[type] || type;
}

function artifactCollection(type: string): string {
  return ({ blog: "blogs", blogs: "blogs", product: "products", products: "products", service: "services", services: "services", "content-items": "page" } as Record<string, string>)[type] || type;
}

interface ArtifactEnvelope {
  schemaVersion: 1;
  siteKey: string;
  collection: string;
  slug: string;
  revisionId: string;
  contentHash: string;
  data: Record<string, any>;
}

interface ArtifactManifest {
  entries: Record<string, { revisionId: string; path: string; contentHash: string }>;
}

interface PublicReadModel {
  siteConfig: SiteConfig;
  lists: Record<string, PublishedContent[]>;
  categories: Category[];
  authors: Author[];
  redirects: RedirectEntry[];
  sitemap: SitemapEntry[];
}

async function readJson<T>(response: Response): Promise<T> {
  let bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

async function sha256(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validArtifactPath(path: string, siteKey: string, collection: string, slug: string, revisionId: string): boolean {
  return path === `sites/${siteKey}/content/${collection}/${slug}/${revisionId}.json`;
}

async function readVerifiedEnvelope(
  baseUrl: string,
  path: string,
  expected: { siteKey: string; collection: string; slug: string; revisionId: string; contentHash: string },
  options: RequestInit & { next?: { tags?: string[] } },
): Promise<ArtifactEnvelope | null> {
  if (!validArtifactPath(path, expected.siteKey, expected.collection, expected.slug, expected.revisionId)) return null;
  const response = await fetch(`${baseUrl}/${path.split("/").map(encodeURIComponent).join("/")}`, options);
  if (!response.ok) return null;
  const envelope = await readJson<ArtifactEnvelope>(response);
  if (
    envelope.schemaVersion !== 1 || envelope.siteKey !== expected.siteKey ||
    envelope.collection !== expected.collection || envelope.slug !== expected.slug ||
    String(envelope.revisionId) !== String(expected.revisionId) ||
    envelope.contentHash !== expected.contentHash
  ) return null;
  const actualHash = await sha256(envelope.data);
  return actualHash === expected.contentHash ? envelope : null;
}

function relationId(value: unknown): number | null {
  const id = value && typeof value === "object" ? (value as { id?: unknown }).id : value;
  const number = Number(id);
  return Number.isFinite(number) ? number : null;
}

function normalizeArtifact(raw: Record<string, any>, type: string): PublishedContent {
  const blocks = Array.isArray(raw.body) ? raw.body : Array.isArray(raw.content) ? raw.content : [];
  return {
    ...raw,
    contentType: publicContentType(type),
    status: String(raw.status || "published").toUpperCase(),
    featured: Boolean(raw.featured),
    categoryId: relationId(raw.categoryId ?? raw.category),
    authorId: relationId(raw.authorId ?? raw.author),
    publishDate: raw.publishDate || null,
    seo: {
      ...raw.seo,
      title: raw.seo?.title || raw.seo?.metaTitle,
      canonical: raw.seo?.canonical || raw.seo?.canonicalUrl,
      socialImage: raw.seo?.socialImage || raw.seo?.ogImage,
      indexing: raw.seo?.indexing || (raw.seo?.noIndex ? "noindex" : "index"),
    },
    body: blocks.map((block: Record<string, any>) => block.type ? block : {
      type: block.blockType,
      data: block.data || Object.fromEntries(Object.entries(block).filter(([key]) => !["id", "blockName", "blockType"].includes(key))),
    }),
    data: raw.data || {},
  } as PublishedContent;
}

async function fetchArtifact(siteKey: string, type: string, slug: string, tags: string[]): Promise<PublishedContent | null> {
  const baseUrl = getArtifactBaseUrl();
  if (!baseUrl) return null;
  try {
    const manifestResponse = await fetch(`${baseUrl}/sites/${encodeURIComponent(siteKey)}/manifest.json`, {
      cache: "force-cache",
      next: { tags: [...tags, `cms:${siteKey}:manifest`] },
    });
    if (!manifestResponse.ok) return null;
    const manifest = await readJson<ArtifactManifest>(manifestResponse);
    const collection = artifactCollection(type);
    const entry = manifest.entries?.[`${collection}/${slug}`];
    if (!entry) return null;
    const envelope = await readVerifiedEnvelope(baseUrl, entry.path, {
      siteKey, collection, slug, revisionId: entry.revisionId, contentHash: entry.contentHash,
    }, { cache: "force-cache", next: { tags } });
    return envelope ? normalizeArtifact(envelope.data, type) : null;
  } catch (error: any) {
    console.warn(`[CMS Client] Artifact read failed for ${type}/${slug}:`, error?.message);
    return null;
  }
}

async function fetchPublicModel(siteKey: string): Promise<PublicReadModel | null> {
  const baseUrl = getArtifactBaseUrl();
  if (!baseUrl) return null;
  const tags = [`cms:${siteKey}:public`];
  try {
    const manifestResponse = await fetch(`${baseUrl}/sites/${encodeURIComponent(siteKey)}/manifest.json`, {
      cache: "force-cache",
      next: { tags: [...tags, `cms:${siteKey}:manifest`] },
    });
    if (!manifestResponse.ok) return null;
    const manifest = await readJson<ArtifactManifest>(manifestResponse);
    const entry = manifest.entries?.["public/index"];
    if (!entry) return null;
    const envelope = await readVerifiedEnvelope(baseUrl, entry.path, {
      siteKey, collection: "public", slug: "index", revisionId: entry.revisionId, contentHash: entry.contentHash,
    }, { cache: "force-cache", next: { tags } });
    return envelope?.data as PublicReadModel || null;
  } catch {
    return null;
  }
}

export async function verifyArtifactRevision(input: {
  siteKey: string;
  contentType: string;
  slug: string;
  revisionId: string;
  contentHash: string;
  artifactPath: string;
}): Promise<boolean> {
  const baseUrl = getArtifactBaseUrl();
  if (!baseUrl || !/^[a-f0-9]{64}$/.test(input.contentHash)) return false;
  try {
    return Boolean(await readVerifiedEnvelope(baseUrl, input.artifactPath, {
      siteKey: input.siteKey,
      collection: artifactCollection(input.contentType),
      slug: input.slug,
      revisionId: input.revisionId,
      contentHash: input.contentHash,
    }, { cache: "no-store" }));
  } catch {
    return false;
  }
}

export function getApiKey(): string {
  return getEnvVar("CMS_API_KEY");
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
  siteKey?: string,
  revalidate: number | false = 300
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
      next: { revalidate, tags },
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
  siteKey?: string,
  revalidate: number | false = 300
): Promise<T | null> {
  try {
    const res = await fetchCmsResponse(path, tags, siteKey, revalidate);
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
  const publicModel = await fetchPublicModel(siteKey);
  if (publicModel) {
    const normalizedType = publicContentType(type);
    let items = (publicModel.lists?.[normalizedType] || []).map((item) => normalizeArtifact(item as any, normalizedType));
    for (const [key, value] of Object.entries(opts.filters || {})) {
      items = items.filter((item: any) => String(item[key] ?? item.data?.[key] ?? "") === value);
    }
    if (opts.cursor) items = items.filter((item: any) => Number(item.id) > Number(opts.cursor));
    const limit = Math.min(Math.max(opts.limit || 50, 1), 100);
    const page = items.slice(0, limit);
    return { items: page, nextCursor: items.length > limit ? String((page.at(-1) as any)?.id || "") : null, total: items.length };
  }
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
    siteKey,
    false
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
  const normalizedType = publicContentType(type);
  const tags = [`cms:${siteKey}:${normalizedType}:${slug}`, `cms:${normalizedType}:${slug}`];
  const artifact = await fetchArtifact(siteKey, type, slug, tags);
  if (artifact) return artifact;
  return await fetchCms<PublishedContent>(
    `/api/v1/content/${type}/${slug}`,
    tags,
    siteKey,
    false
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
  const publicModel = await fetchPublicModel(targetSiteKey);
  if (publicModel) return publicModel.categories || [];
  const data = await fetchCms<{ items: Category[] }>(
    `/api/v1/categories?siteKey=${targetSiteKey}`,
    ["cms:categories"],
    targetSiteKey
  );
  return data?.items ?? [];
}

export async function getAuthor(slugOrId: string | number, siteKey?: string): Promise<Author | null> {
  const targetSiteKey = siteKey || getDefaultSiteKey();
  const publicModel = await fetchPublicModel(targetSiteKey);
  if (publicModel) return publicModel.authors?.find((author) => author.slug === String(slugOrId) || String(author.id) === String(slugOrId)) || null;
  const data = await fetchCms<Author>(
    `/api/v1/authors/${slugOrId}?siteKey=${targetSiteKey}`,
    [`cms:author:${slugOrId}`],
    targetSiteKey
  );
  return data ?? null;
}

export async function getSitemap(siteKey?: string): Promise<SitemapEntry[]> {
  const targetSiteKey = siteKey || getDefaultSiteKey();
  const publicModel = await fetchPublicModel(targetSiteKey);
  if (publicModel) return publicModel.sitemap || [];
  try {
    const res = await fetchCmsResponse(`/api/v1/sitemap?siteKey=${targetSiteKey}`, ["cms:sitemap"], targetSiteKey);
    if (!res) return [];
    const xml = await res.text();
    return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (m) => ({ url: m[1]! }));
  } catch {
    return [];
  }
}

export async function getSiteConfig(siteKey?: string): Promise<SiteConfig> {
  const targetSiteKey = siteKey || getDefaultSiteKey();
  const publicModel = await fetchPublicModel(targetSiteKey);
  if (publicModel?.siteConfig) return sanitizeSiteConfig(publicModel.siteConfig);
  const data = await fetchCms<SiteConfig>(
    `/api/v1/site-config?siteKey=${targetSiteKey}`,
    ["cms:site-config"],
    targetSiteKey
  );
  return sanitizeSiteConfig(data);
}

export async function getRedirects(): Promise<RedirectEntry[]> {
  const publicModel = await fetchPublicModel(getDefaultSiteKey());
  if (publicModel) return publicModel.redirects || [];
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



