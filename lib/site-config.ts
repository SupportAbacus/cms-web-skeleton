import "server-only";

export type HeaderConnectors = {
  googleTagManagerId?: string;
  googleAnalyticsId?: string;
  googleSiteVerification?: string;
  facebookPixelId?: string;
  microsoftClarityId?: string;
  googleAdsId?: string;
  linkedInPartnerId?: string;
  pinterestTagId?: string;
  tiktokPixelId?: string;
  hotjarId?: string;
  yandexMetricaId?: string;
  bingUetTagId?: string;
  plausibleDomain?: string;
  bingSiteVerification?: string;
  yandexVerification?: string;
  pinterestDomainVerification?: string;
  facebookDomainVerification?: string;
  customScriptUrls?: string[];
};

export type SiteConfig = {
  key?: string;
  name?: string;
  domains?: { host?: string; isPrimary?: boolean }[];
  headerConnectors: HeaderConnectors;
  noIndexPaths: string[];
  contactInfo?: Record<string, unknown>;
};

const ID = /^[A-Za-z0-9_-]{1,80}$/;
const GTM = /^GTM-[A-Z0-9]{4,}$/i;
const GA = /^(G-[A-Z0-9]+|UA-\d+-\d+)$/i;
const FB = /^\d{4,30}$/;
const ADS = /^AW-\d+$/i;
const DOMAIN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const PATH = /^\/[A-Za-z0-9._~!$&'()*+,;=:@/%-]*$/;

function clean(v: unknown, re: RegExp): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s && re.test(s) ? s : undefined;
}

function cleanScriptUrl(v: unknown): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return undefined;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

export function sanitizeSiteConfig(input: unknown): SiteConfig {
  const root = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const c = root.headerConnectors && typeof root.headerConnectors === "object"
    ? root.headerConnectors as Record<string, unknown>
    : {};
  const paths = Array.isArray(root.noIndexPaths) ? root.noIndexPaths : [];
  return {
    key: typeof root.key === "string" ? root.key.trim() : undefined,
    name: typeof root.name === "string" ? root.name.trim() : undefined,
    domains: Array.isArray(root.domains) ? (root.domains as { host?: string; isPrimary?: boolean }[]) : [],
    contactInfo: root.contactInfo && typeof root.contactInfo === "object" ? (root.contactInfo as Record<string, unknown>) : {},
    headerConnectors: {
      googleTagManagerId: clean(c.googleTagManagerId, GTM),
      googleAnalyticsId: clean(c.googleAnalyticsId, GA),
      googleSiteVerification: clean(c.googleSiteVerification, ID),
      facebookPixelId: clean(c.facebookPixelId, FB),
      microsoftClarityId: clean(c.microsoftClarityId, ID),
      googleAdsId: clean(c.googleAdsId, ADS),
      linkedInPartnerId: clean(c.linkedInPartnerId, FB),
      pinterestTagId: clean(c.pinterestTagId, FB),
      tiktokPixelId: clean(c.tiktokPixelId, ID),
      hotjarId: clean(c.hotjarId, FB),
      yandexMetricaId: clean(c.yandexMetricaId, FB),
      bingUetTagId: clean(c.bingUetTagId, ID),
      plausibleDomain: clean(c.plausibleDomain, DOMAIN),
      bingSiteVerification: clean(c.bingSiteVerification, ID),
      yandexVerification: clean(c.yandexVerification, ID),
      pinterestDomainVerification: clean(c.pinterestDomainVerification, ID),
      facebookDomainVerification: clean(c.facebookDomainVerification, ID),
      customScriptUrls: Array.isArray(c.customScriptUrls)
        ? c.customScriptUrls.map(cleanScriptUrl).filter((v): v is string => !!v).slice(0, 10)
        : [],
    },
    noIndexPaths: [...new Set(paths.map((v) => typeof v === "string" ? v.trim() : "").filter((v) => PATH.test(v)))].slice(0, 500),
  };
}

export function robotsForPath(config: SiteConfig, path: string) {
  return config.noIndexPaths.includes(path) ? { index: false, follow: false } : undefined;
}
