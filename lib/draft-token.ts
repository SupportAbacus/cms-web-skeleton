import { createHmac, timingSafeEqual } from "node:crypto";

export type DraftTokenPayload = {
  slug: string;
  type: string;
  site: string;
  exp: number;
};

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Verifies a short-lived HMAC draft token produced by the CMS.
 * Token format:  base64url(JSON payload).base64url(HMAC)
 */
export function verifyDraftToken(token: string, secret: string): DraftTokenPayload | null {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;

  const expected = sign(payload, secret);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as DraftTokenPayload;
    if (!data.slug || !data.site || !data.type || data.exp < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}
