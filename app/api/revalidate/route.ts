import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { hmacVerify } from "../../../lib/security";
import { verifyArtifactRevision } from "../../../lib/cms-client";
import { claimEvent, rateLimited, releaseEvent } from "../../../lib/distributed-guard";

const SECRET = process.env.WEBHOOK_SECRET ?? process.env.REVALIDATE_SECRET ?? process.env.REVALIDATION_SECRET ?? "";
const WINDOW_MS = 5 * 60 * 1000;
const LIMIT = 30;

async function warmPath(path: string): Promise<string | null> {
  const port = process.env.PORT || "3000";
  const url = `http://127.0.0.1:${port}${path.startsWith("/") ? path : "/" + path}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    return res.ok ? null : `${path}: ${res.status}`;
  } catch (err: any) {
    return `${path}: ${err.message}`;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!SECRET) {
    return NextResponse.json({ ok: false, error: "webhook_secret_not_configured" }, { status: 503 });
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (await rateLimited(`revalidate:${ip}`, LIMIT)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const sig = req.headers.get("x-cms-signature") || req.headers.get("X-CMS-Signature");
  const ts = req.headers.get("x-cms-timestamp") || req.headers.get("X-CMS-Timestamp");
  if (!sig || !ts) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 401 });
  }

  const tsNum = Number(ts);
  const tsMs = tsNum < 1_000_000_000_000 ? tsNum * 1000 : tsNum;
  if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > WINDOW_MS) {
    return NextResponse.json({ ok: false, error: "stale_timestamp" }, { status: 401 });
  }

  const body = await req.text();
  if (!hmacVerify(`${ts}.${body}`, SECRET, sig)) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  let payload: { siteKey?: string; contentType?: string; slug?: string; eventId?: string; event?: string; revisionId?: string; contentHash?: string; artifactPath?: string };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const { siteKey, contentType, slug, eventId, event, revisionId, contentHash, artifactPath } = payload;

  if (
    !siteKey || !contentType || !slug || !eventId || !event ||
    !/^[a-z0-9-]{1,64}$/.test(siteKey) || !/^[a-z0-9-]{1,64}$/.test(contentType) ||
    !/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug) || !/^evt_[a-f0-9]{16}$/.test(eventId)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 });
  }

  const removed = event.endsWith(".deleted") || event.endsWith(".unpublished");
  if (!removed) {
    if (!revisionId || !contentHash || !artifactPath || !await verifyArtifactRevision({ siteKey, contentType, slug, revisionId, contentHash, artifactPath })) {
      return NextResponse.json({ ok: false, error: "artifact_verification_failed" }, { status: 502 });
    }
  }
  const claimKey = `${siteKey}:${eventId}`;
  if (!await claimEvent(claimKey)) {
    return NextResponse.json({ ok: true, message: "event_already_processed", eventId }, { status: 200 });
  }

  const routeType = ({ blogs: "blog", products: "product", services: "service", "content-items": "page" } as Record<string, string>)[contentType] || contentType;
  revalidateTag(`cms:${siteKey}:${routeType}:${slug}`);
  revalidateTag(`cms:${siteKey}:${routeType}`);
  revalidateTag(`cms:${siteKey}:manifest`);
  revalidateTag(`cms:${siteKey}:public`);
  revalidateTag(`cms:${routeType}:${slug}`);
  revalidateTag(`cms:${routeType}`);
  revalidateTag("cms:sitemap");
  revalidateTag("cms:redirects");
  const collectionPath = routeType === "page" ? "/" : `/${routeType}`;
  const detailPath = routeType === "page" ? (["home", "index"].includes(slug) ? "/" : `/${slug}`) : `/${routeType}/${slug}`;
  const paths = routeType === "public"
    ? ["/", "/blog", "/product", "/service", "/sitemap.xml", "/robots.txt"]
    : Array.from(new Set(["/", collectionPath, detailPath, "/sitemap.xml", "/robots.txt"]));
  for (const path of paths) revalidatePath(path);

  const warmPaths = removed ? paths.filter((path) => path !== detailPath) : paths;
  const warmFailures = (await Promise.all(warmPaths.map(warmPath))).filter(Boolean);
  if (warmFailures.length > 0) {
    await releaseEvent(claimKey);
    return NextResponse.json({ ok: false, error: "cache_warm_failed", failed: warmFailures }, { status: 502 });
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
