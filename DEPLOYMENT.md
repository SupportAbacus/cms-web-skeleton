# Standalone Deployment Guide: Live Website (`cms-web-skeleton`)

This document details how to deploy the **Next.js 15 App Router Live Website** as an autonomous, standalone consumer frontend. It has **zero database dependencies, zero database credentials, and zero CMS code**.

---

## 1. Architectural Principles

* **Database-Decoupled:** The frontend has no database access or CMS code. Detail-page cache misses resolve and verify immutable R2/S3 artifacts; remaining read models use the authenticated Payload `/api/v1` API.
* **Cached-Outage Behavior:** Published detail pages are generated from R2/S3 artifacts and remain available from Next.js/CDN caches during a CMS outage. Lists and other public read models still depend on Payload when their caches are cold.
* **On-Demand Cache Invalidation:** Publishing sends an HMAC-signed webhook to `/api/revalidate`. The endpoint verifies the exact artifact revision and SHA-256 hash before revalidating and warming affected routes.

---

## 2. Deployment Options

### Option A: Standalone Docker on VPS / Container Host

#### 1. Setup Environment
On the target frontend server or VPS:
```bash
git clone <repo-url>
cd CMS/cms-web-skeleton
cp .env.example .env.local
nano .env.local
```

Configure your remote CMS connection:
```env
CMS_BASE_URL=https://cms.yourdomain.com
CMS_API_KEY=sk_live_your_site_key
CMS_ARTIFACT_BASE_URL=https://artifacts.example.com
REVALIDATION_SECRET=your_shared_revalidation_secret
WEBHOOK_SECRET=your_shared_webhook_secret
S3_PUBLIC_DOMAIN=https://media.yourdomain.com
SITE_DOMAIN=yourdomain.com
```

#### 2. Launch with Docker Compose
```bash
docker compose up -d
```

The site will build with `output: 'standalone'` and run on port `3000`. The persistent Docker volume `skeleton_isr_cache` retains all pre-rendered HTML/JSON pages across container updates or rebuilds.

#### 3. Standalone Nginx Reverse Proxy (Optional)
To run behind the included standalone Nginx proxy on ports 80/443:
```bash
docker compose --profile proxy up -d
```

---

### Option B: Serverless Platforms (Vercel, Netlify, Cloudflare Pages, AWS Amplify)

Because `cms-web-skeleton` is a standard Next.js 15 App Router project with zero native binary requirements or database adapters:

1. Connect your repository to **Vercel** or your preferred PaaS.
2. Set the **Root Directory** to `cms-web-skeleton`.
3. Configure the following environment variables in your platform's dashboard:
   * `CMS_BASE_URL`: The public HTTPS URL of your remote Payload CMS.
   * `CMS_API_KEY`: The site's server-only `sk_...` key used for API fallback.
   * `CMS_ARTIFACT_BASE_URL`: Public custom domain serving the site's R2/S3 artifacts.
   * `REVALIDATION_SECRET`: Shared secret for `/api/revalidate`.
   * `WEBHOOK_SECRET`: Shared secret for signed webhook delivery.
   * `S3_PUBLIC_DOMAIN`: Public CDN URL for images.
   * `SITE_DOMAIN`: Your custom domain (e.g. `yourdomain.com`).
4. Trigger the deployment.
5. In Payload CMS Admin, register your production webhook endpoint:
   ```
   https://yourdomain.com/api/revalidate
   ```

---

## 3. Webhook Integration Verification

Test that your deployed frontend correctly receives and processes cache invalidation pings from the remote CMS:

```bash
# Verify missing signature is rejected with 401
curl -i -X POST https://yourdomain.com/api/revalidate

# Health check
curl -i https://yourdomain.com/api/health
```
