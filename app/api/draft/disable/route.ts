import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getSafePublicOrigin } from "@/lib/origin";

/**
 * GET /api/draft/disable
 * Navigating to this URL exits Next.js Draft Mode and redirects home.
 * Useful for an "Exit preview" banner shown while draft mode is active.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  (await draftMode()).disable();
  const safeOrigin = getSafePublicOrigin(req);
  const home = new URL("/", safeOrigin);
  return NextResponse.redirect(home);
}
