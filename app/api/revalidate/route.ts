import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { hmacVerify } from "../../../lib/security";

const SECRET = process.env.WEBHOOK_SECRET ?? process.env.REVALIDATE_SECRET ?? process.env.REVALIDATION_SECRET ?? "";
const WINDOW_MS = 5 * 60 * 1000;
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
const LIMIT = 30;

const hits = new Map<string, number[]>();
// ponytail: in-memory idempotency cache (eventId -> timestamp), swap for shared store if multi-instance
const processedEvents = new Map<string, number>();

function cleanProcessedEvents() {
  const now = Date.now();
  for (const [eventId, ts] of processedEvents.entries()) {
    if (now - ts > IDEMPOTENCY_TTL_MS) {
      processedEvents.delete(eventId);
    }
  }
}

async function warmPath(req: NextRequest, path: string): Promise<string | null> {
  const url = new URL(path, req.nextUrl.origin);
  const res = await fetch(url, { cache: "no-store" });
  return res.ok ? null : `${path}: ${res.status}`;
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  // ponytail: simple in-memory map, swap for shared store if multi-instance
  return recent.length > LIMIT;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
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
  if (SECRET && !hmacVerify(`${ts}.${body}`, SECRET, sig)) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  let payload: { contentType?: string; slug?: string; eventId?: string };
  try {
    payload = JSON.parse(body) as { contentType?: string; slug?: string; eventId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const { contentType, slug, eventId } = payload;

  // Idempotency check
  if (eventId) {
    cleanProcessedEvents();
    if (processedEvents.has(eventId)) {
      return NextResponse.json({ ok: true, message: "event_already_processed", eventId }, { status: 200 });
    }
    processedEvents.set(eventId, Date.now());
  }

  if (!contentType || !slug) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  revalidateTag(`cms:${contentType}:${slug}`);
  revalidateTag(`cms:${contentType}`);
  revalidateTag("cms:sitemap");
  revalidateTag("cms:redirects");
  const paths = ["/", `/${contentType}`, `/${contentType}/${slug}`, "/sitemap.xml"];
  for (const path of paths) revalidatePath(path);

  const warmFailures = (await Promise.all(paths.map((path) => warmPath(req, path)))).filter(Boolean);
  if (warmFailures.length > 0) {
    return NextResponse.json({ ok: false, error: "cache_warm_failed", failed: warmFailures }, { status: 502 });
  }

  return NextResponse.json({ ok: true, revalidated: paths });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
