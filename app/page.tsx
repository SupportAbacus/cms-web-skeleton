import type { Metadata } from "next";
import Link from "next/link";
import { listContent, formatDate, getSiteConfig, getContent, getMediaUrl } from "@/lib/cms-client";
import { robotsForPath } from "@/lib/site-config";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlockDispatcher } from "@/components/blocks";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/cms";
import { ArrowRight, BookOpen, Clock, Calendar, Sparkles, ShieldCheck, Zap, Globe, Package } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: config.name ? config.name : "Multi-Tenant Headless CMS Platform",
    description: config.name
      ? `Official website for ${config.name}`
      : "Enterprise Headless CMS powered by Next.js 14, Tailwind CSS v4, and Payload CMS 3.0",
    robots: robotsForPath(config, "/"),
  };
}

export default async function Home() {
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";

  const homeDoc =
    (await getContent(siteKey, "content-items", "home")) ||
    (await getContent(siteKey, "content-items", "index"));

  const blogEnabled = config.allowedContentTypes.includes("blog");
  const productEnabled = config.allowedContentTypes.includes("product");
  const posts = blogEnabled ? (await listContent(siteKey, "blog", { limit: 6 })).items.slice(0, 6) : [];
  const products = productEnabled
    ? ((await listContent(siteKey, "product", { limit: 6 })).items as Product[]).slice(0, 6)
    : [];

  return (
    <div className="flex flex-col gap-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {homeDoc && homeDoc.body && homeDoc.body.length > 0 ? (
          <div className="space-y-6">
            {homeDoc.title ? (
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground text-center">
                {homeDoc.title}
              </h1>
            ) : null}
            <BlockDispatcher body={homeDoc.body} />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3.5 py-1 text-xs font-medium text-foreground shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Next.js 14 • Tailwind CSS v4 • shadcn/ui</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-balance">
              {config.name || "Content that Ships Itself at Global Scale"}
            </h1>

            <p className="text-lg text-muted-foreground sm:text-xl text-balance">
              Multi-tenant, API-first headless CMS ecosystem designed for high-velocity teams, edge ISR caching, and frictionless publishing.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <span>Explore Technical Articles</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-6 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>View Products</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 border-t border-border/40 w-full max-w-2xl">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Sub-50ms</span>
                </div>
                <span className="text-xs text-muted-foreground">Edge ISR Cache</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>100% Isolated</span>
                </div>
                <span className="text-xs text-muted-foreground">Tenant Multi-Tenancy</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col items-center space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Zero-Egress</span>
                </div>
                <span className="text-xs text-muted-foreground">Cloudflare R2 Media</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Product Solutions Showcase Section */}
      {productEnabled ? <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/40 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              <Package className="h-3.5 w-3.5" />
              <span>Hardware &amp; Solutions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprise Products &amp; Appliances</h2>
            <p className="text-sm text-muted-foreground mt-1">
              High-throughput edge routing gateways, serialized identity scanners, and distributed platforms.
            </p>
          </div>
          <Link
            href="/product"
            className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 group"
          >
            <span>Explore full catalog</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center space-y-3">
            <Package className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">No Products Published</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Products published in the CMS will automatically appear in this showcase grid.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.slug} product={prod} />
            ))}
          </div>
        )}
      </section> : null}

      {/* Content Grid Section (CMS Only) */}
      {blogEnabled ? <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/40 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              <span>Publications</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Latest Technical Insights</h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 group"
          >
            <span>View all articles</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
            <p className="text-muted-foreground">No published content yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => {
              const d = (p.data ?? {}) as Record<string, any>;
              const thumb = getMediaUrl(d.heroImage);
              const excerpt = typeof d.excerpt === "string" ? d.excerpt : "";
              const date = formatDate(p.publishDate);
              const reading = typeof d.readingMinutes === "number" ? d.readingMinutes : null;

              return (
                <Card
                  key={p.slug}
                  className="flex flex-col overflow-hidden group hover:shadow-lg hover:border-border transition-all duration-300"
                >
                  <div className="relative aspect-16/9 bg-muted overflow-hidden flex items-center justify-center">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={d.heroImage?.alt ?? p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-primary/10 via-muted to-muted/80 flex items-center justify-center p-6 text-center">
                        <span className="text-xs font-medium text-muted-foreground line-clamp-2">
                          {p.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs text-xs font-semibold">
                        {p.contentType}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="space-y-2 p-5 pb-3">
                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/blog/${p.slug}`}>
                        {p.title}
                      </Link>
                    </CardTitle>
                    {excerpt ? (
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                        {excerpt}
                      </CardDescription>
                    ) : null}
                  </CardHeader>

                  <CardFooter className="mt-auto p-5 pt-0 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 mt-4 pt-3">
                    <div className="flex items-center gap-3">
                      {date ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {date}
                        </span>
                      ) : null}
                      {reading ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {reading}m
                        </span>
                      ) : null}
                    </div>

                    <Link
                      href={`/blog/${p.slug}`}
                      className="font-medium text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section> : null}
    </div>
  );
}
