# Multi-Tenant Next.js Web Skeleton (`cms-web-skeleton`)

High-performance Next.js 14 App Router live site skeleton designed for the Multi-Site Headless CMS Ecosystem (Payload CMS 3.0 + Next.js ISR + Cloudflare R2 + Docker).

## ?? Key Features

- **Next.js 14 App Router**: Server Components, streaming, and `output: 'standalone'`.
- **Tailwind CSS v4**: CSS-first configuration via `@import "tailwindcss";` and `@theme` tokens (zero vanilla/raw CSS in `globals.css`).
- **shadcn/ui & Radix Primitives**: Reusable, accessible UI components styled with `cva` (Button, Card, Badge, Accordion, ThemeToggle).
- **Server-Only API Client (`lib/cms-client.ts`)**: Secure server-side fetching with a tenant `CMS_API_KEY` (`Bearer sk_...`) and five-minute ISR revalidation.
- **Tenant-Aware Shell**: Navigation and default metadata follow the site's enabled content types and SEO defaults from Payload.
- **Code-Owned Design**: Routes, layouts, components, styling, header, and footer stay in this repository. CMS authors only update the predefined content, media, and SEO rendered by those templates.
- **Docker Ready**: Multi-stage standalone Dockerfile exposing port 3000.

---

## ??? Environment Variables

Create a `.env.local` file in the root of `cms-web-skeleton/`:

```env
# CMS API Configuration
CMS_BASE_URL=http://localhost:3000
CMS_API_KEY=sk_test_123

# CDN Configuration
CDN_URL=https://cdn.example.com

# Revalidation Webhook Secret (Section 5)
REVALIDATE_SECRET=your_secure_secret_here

# Runtime
PORT=3000
NODE_ENV=development
```

---

## ?? Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Typecheck
```bash
npm run lint    # runs tsc --noEmit
npm run build   # builds standalone Next.js bundle
npm start       # runs production server
```

---

## ?? Docker Containerization

To build and run the standalone container locally:

```bash
# Build Docker image
docker build -t cms-web-skeleton .

# Run container on port 3000
docker run -p 3000:3000 \
  -e CMS_BASE_URL=http://payload_cms:3000 \
  -e CMS_API_KEY=sk_test_123 \
  cms-web-skeleton
```

When deployed in the squad Docker Compose stack, this container is mapped on the `public_web` network and communicates with Payload CMS internally over `cms_internal`.
