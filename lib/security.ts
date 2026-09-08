import sanitizeHtmlLib from "sanitize-html";
import { createHmac, timingSafeEqual } from "node:crypto";

const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "ul", "ol", "li",
  "a", "blockquote", "code", "pre", "table", "thead", "tbody",
  "tr", "th", "td", "img", "br", "hr", "span", "div", "kbd", "mark",
];

const ALLOWED_ATTR: sanitizeHtmlLib.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel", "class", "id"],
  img: ["src", "alt", "width", "height", "loading", "class"],
  span: ["class", "id"],
  div: ["class", "id"],
  h1: ["class", "id"],
  h2: ["class", "id"],
  h3: ["class", "id"],
  h4: ["class", "id"],
  h5: ["class", "id"],
  h6: ["class", "id"],
  p: ["class"],
  blockquote: ["class"],
  code: ["class"],
  pre: ["class"],
  ul: ["class"],
  ol: ["class"],
  li: ["class"],
  table: ["class"],
  thead: ["class"],
  tbody: ["class"],
  tr: ["class"],
  th: ["class", "scope"],
  td: ["class"],
};

export function isAllowedUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function sanitizeHtml(input: string): string {
  return sanitizeHtmlLib(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ["https", "http"],
    allowedSchemesByTag: { a: ["https", "http"], img: ["https", "http"] },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        if (!isAllowedUrl(href)) return { tagName, attribs: {} };
        return {
          tagName,
          attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
        };
      },
    },
    disallowedTagsMode: "discard",
  });
}

const ALLOWED_EMBED_DOMAINS = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "player.vimeo.com",
  "loom.com",
  "www.loom.com",
]);

export function isAllowedEmbed(domain: string): boolean {
  return ALLOWED_EMBED_DOMAINS.has(domain.toLowerCase());
}

export function hmacSign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function hmacVerify(body: string, secret: string, sig: string): boolean {
  const expected = hmacSign(body, secret);
  return timingSafeCompare(expected, sig);
}

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
