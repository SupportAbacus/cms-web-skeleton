/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// PRD §4.7 Official Analytics & Tracking Allowlist
const trackingScripts = [
  "https://googletagmanager.com",
  "https://www.googletagmanager.com",
  "https://connect.facebook.net",
  "https://clarity.ms",
  "https://www.clarity.ms",
  "https://snap.licdn.com",
  "https://analytics.tiktok.com",
  "https://hotjar.com",
  "https://static.hotjar.com",
  "https://script.hotjar.com",
  "https://plausible.io",
  "https://mc.yandex.ru",
  "https://bat.bing.com",
  "https://s.pinimg.com"
].join(" ");

const trackingConnect = [
  "https://www.google-analytics.com",
  "https://analytics.google.com",
  "https://www.facebook.com",
  "https://www.clarity.ms",
  "https://px.ads.linkedin.com",
  "https://ct.pinterest.com",
  "https://analytics.tiktok.com",
  "https://vc.hotjar.io",
  "https://mc.yandex.ru",
  "https://bat.bing.com",
  "https://plausible.io"
].join(" ");

const scriptSrc = isDev
  ? `'self' 'unsafe-eval' 'unsafe-inline' ${trackingScripts}`
  : `'self' 'unsafe-inline' ${trackingScripts}`;

const s3Domain = (
  process.env.S3_PUBLIC_DOMAIN ||
  process.env.CDN_URL ||
  "https://media.yourdomain.com"
)
  .replace(/^https?:\/\//, "")
  .split("/")[0];

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: s3Domain },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/cdn/:key*",
        destination: `${process.env.S3_PUBLIC_DOMAIN || process.env.CDN_URL || "https://media.yourdomain.com"}/:key*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; media-src 'self' https:; font-src 'self' https:; connect-src 'self' ${trackingConnect} http://localhost:* https://*.supabase.co https://*.r2.cloudflarestorage.com; frame-src 'self' https://youtube.com https://www.youtube.com https://vimeo.com https://player.vimeo.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
