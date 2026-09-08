import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

/**
 * GET /api/draft/disable
 * Navigating to this URL exits Next.js Draft Mode and redirects home.
 * Useful for an "Exit preview" banner shown while draft mode is active.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  (await draftMode()).disable();
  const home = new URL("/", req.nextUrl.origin);
  return NextResponse.redirect(home);
}
