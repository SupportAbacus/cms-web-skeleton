# Standalone Deployment Guide: Live Website (`cms-web-skeleton`)

This document details how to deploy the **Next.js 14 App Router Live Website** as an autonomous, standalone consumer frontend. It has **zero database dependencies, zero database credentials, and zero CMS code**.

---

## 1. Architectural Principles

* **100% Decoupled & Resilient:** Visitor traffic NEVER hits PostgreSQL or the Payload CMS control plane. 
* **Outage Immunity:** If the CMS server or database is completely offline, all previously published content remains 100% served and cached via persistent Next.js disk ISR and Cloudflare R2 static origin fallback.
* **On-Demand Cache Invalidation:** When an editor publishes content in Payload CMS, an HMAC-signed webhook arrives at `/api/revalidate`, purging both Next.js disk ISR tags (`revalidateTag`) and Cloudflare edge cache in < 3 seconds.

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
CMS_API_KEY=pk_live_your_site_key
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

Because `cms-web-skeleton` is a standard Next.js 14 App Router project with zero native binary requirements or database adapters:

1. Connect your repository to **Vercel** or your preferred PaaS.
2. Set the **Root Directory** to `cms-web-skeleton`.
3. Configure the following environment variables in your platform's dashboard:
   * `CMS_BASE_URL`: The public HTTPS URL of your remote Payload CMS.
   * `CMS_API_KEY`: The site's `pk_...` Bearer token.
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
