import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { verifyDraftToken } from "@/lib/draft-token";

/**
 * GET /api/draft
 *
 * Called by the CMS "Open site preview" button.
 * The CMS signs a short-lived HMAC token and redirects here.
 * We verify the token, enable Next.js Draft Mode, then redirect to
 * the correct content page so editors see the unpublished draft.
 *
 * Query params:
 *   token  – HMAC-signed draft token produced by the CMS
 *   slug   – content slug (safety cross-check, also embedded in token)
 *   type   – collection type: blogs | products | services | content-items
 */

/** Maps CMS collection names -> frontend URL prefixes */
const COLLECTION_PATH_MAP: Record<string, string> = {
  blogs: "/blog",
  products: "/product",
  services: "/service",
  "content-items": "/content",
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token") ?? "";
  const slugParam = searchParams.get("slug") ?? "";
  const typeParam = searchParams.get("type") ?? "";

  const secret = process.env.DRAFT_MODE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Draft mode is not configured on this site (missing DRAFT_MODE_SECRET)" },
      { status: 503 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing token parameter" },
      { status: 400 }
    );
  }

  // Verify HMAC signature and check expiry
  const payload = verifyDraftToken(token, secret);
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: "Invalid or expired draft token" },
      { status: 401 }
    );
  }

  // Cross-check slug (if provided in query string)
  if (slugParam && payload.slug !== slugParam) {
    return NextResponse.json(
      { ok: false, error: "Token/slug mismatch" },
      { status: 401 }
    );
  }

  // Cross-check type (if provided in query string)
  if (typeParam && payload.type !== typeParam) {
    return NextResponse.json(
      { ok: false, error: "Token/type mismatch" },
      { status: 401 }
    );
  }

  // Enable Next.js draft mode so Server Components get uncached/draft data
  (await draftMode()).enable();

  // Determine the redirect path
  const prefix = COLLECTION_PATH_MAP[payload.type] ?? `/${payload.type}`;
  const destination = `${prefix}/${payload.slug}`;

  return NextResponse.redirect(new URL(destination, req.nextUrl.origin));
}

/**
 * DELETE /api/draft  (or navigate to /api/draft/disable)
 * Exits preview mode. Call from an "Exit preview" banner on the site.
 */
export async function DELETE(): Promise<NextResponse> {
  (await draftMode()).disable();
  return NextResponse.json({ ok: true, message: "Draft mode disabled" });
}
