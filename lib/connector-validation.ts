export const CONNECTOR_PATTERNS: Record<string, RegExp> = {
  googleTagManagerId: /^GTM-[A-Z0-9]{4,10}$/i,
  googleAnalyticsId: /^(G-[A-Z0-9]{6,12}|UA-\d+-\d+)$/i,
  googleAdsId: /^AW-\d{6,15}$/i,
  facebookPixelId: /^\d{10,20}$/,
  microsoftClarityId: /^[a-zA-Z0-9]{8,15}$/,
  linkedInPartnerId: /^\d{4,10}$/,
  pinterestTagId: /^\d{10,20}$/,
  tiktokPixelId: /^[A-Z0-9]{10,25}$/i,
  hotjarId: /^\d{5,10}$/,
  yandexMetricaId: /^\d{6,12}$/,
  bingUetTagId: /^[0-9a-zA-Z_-]{5,20}$/,
  plausibleDomain: /^[a-z0-9.-]+\.[a-z]{2,}$/i,
  googleSiteVerification: /^[a-zA-Z0-9_-]{20,70}$/,
  bingSiteVerification: /^[a-zA-Z0-9]{20,50}$/,
  yandexVerification: /^[a-zA-Z0-9]{15,40}$/,
  facebookDomainVerification: /^[a-zA-Z0-9]{20,50}$/,
  pinterestDomainVerification: /^[a-zA-Z0-9]{20,50}$/,
};

export function validateConnectorValue(key: string, value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const pattern = CONNECTOR_PATTERNS[key];
  if (!pattern) {
    return /^[a-zA-Z0-9_.-]{1,100}$/.test(trimmed) ? trimmed : null;
  }
  return pattern.test(trimmed) ? trimmed : null;
}
