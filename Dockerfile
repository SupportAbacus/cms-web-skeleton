# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# NEXT_PUBLIC_* is inlined into the client bundle by `next build`, so these must
# be BUILD args. Supplying them only as runtime `environment:` entries leaves the
# compiled JS holding the fallback values (NEXT_PUBLIC_SITE_KEY is read in 16
# places, so a wrong value here silently serves the wrong tenant's content).
ARG NEXT_PUBLIC_SITE_KEY
ARG NEXT_PUBLIC_SITE_DOMAIN
ARG NEXT_PUBLIC_PREVIEW_BASE
ENV NEXT_PUBLIC_SITE_KEY=${NEXT_PUBLIC_SITE_KEY}
ENV NEXT_PUBLIC_SITE_DOMAIN=${NEXT_PUBLIC_SITE_DOMAIN}
ENV NEXT_PUBLIC_PREVIEW_BASE=${NEXT_PUBLIC_PREVIEW_BASE}

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir -p .next/cache
RUN chown -R nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
