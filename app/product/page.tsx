import type { Metadata } from "next";
import Link from "next/link";
import { listContent, getSiteConfig, getMediaUrl } from "@/lib/cms-client";
import { robotsForPath } from "@/lib/site-config";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/cms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Zap,
  Globe2,
  Headphones,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Package,
  Layers
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteName = config.name || "Enterprise Headless Platform";
  return {
    title: `Product Solutions & Catalog | ${siteName}`,
    description: "Browse high-throughput edge gateways, serial identity scanners, and enterprise distributed infrastructure solutions.",
    robots: robotsForPath(config, "/product"),
  };
}

export default async function ProductCatalogPage({
  searchParams,
}: {
  searchParams: { cursor?: string };
}) {
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";

  const { items, total } = await listContent(siteKey, "product", {
    cursor: searchParams.cursor,
    limit: 50,
  });

  const products = items as unknown as Product[];
  const featuredProduct = products.find((p) => p.featured) || products[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-b from-primary/5 via-muted/30 to-background p-8 sm:p-14 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
            <Package className="h-3.5 w-3.5" />
            <span>Enterprise Product Catalog</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground text-balance">
            Hardware &amp; Edge Infrastructure
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl text-balance leading-relaxed">
            High-performance edge appliances, connected serial readers, and enterprise platforms engineered for mission-critical reliability.
          </p>

          {/* KPI Metrics */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border/40 mt-8">
            <div className="space-y-1">
              <div className="text-2xl font-black text-foreground">&lt; 0.8ms</div>
              <div className="text-xs text-muted-foreground font-medium">p99 Gateway Latency</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-foreground">99.999%</div>
              <div className="text-xs text-muted-foreground font-medium">Production Uptime</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-foreground">Line-Rate</div>
              <div className="text-xs text-muted-foreground font-medium">Packet Processing</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-foreground">Global</div>
              <div className="text-xs text-muted-foreground font-medium">Anycast Distribution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Banner (If Available) */}
      {featuredProduct ? (
        <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 sm:p-10 shadow-lg">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 shadow-xs">
                  Flagship Solution
                </Badge>
                {featuredProduct.data?.sku ? (
                  <span className="font-mono text-xs text-muted-foreground font-medium tracking-wider">
                    {featuredProduct.data.sku}
                  </span>
                ) : null}
                {featuredProduct.data?.inStock !== false ? (
                  <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
                    In Stock
                  </Badge>
                ) : null}
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground hover:text-primary transition-colors">
                <Link href={`/product/${featuredProduct.slug}`}>
                  {featuredProduct.title}
                </Link>
              </h2>

              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                {featuredProduct.seo?.metaDescription || featuredProduct.data?.excerpt}
              </p>

              {/* Benefits Highlights */}
              {Array.isArray(featuredProduct.data?.benefits) && featuredProduct.data.benefits.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {featuredProduct.data.benefits.slice(0, 3).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-foreground/90 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Pricing & CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/40">
                {featuredProduct.data?.price ? (
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-foreground">
                      ${featuredProduct.data.price.toLocaleString()}
                    </span>
                    <span className="ml-1 text-sm font-semibold text-muted-foreground">
                      {featuredProduct.data.currency || "USD"}
                    </span>
                  </div>
                ) : null}

                <Button size="lg" asChild className="gap-2">
                  <Link href={`/product/${featuredProduct.slug}`}>
                    <span>Configure Appliance</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Media Preview */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-muted aspect-16/11 shadow-sm relative group">
                {featuredProduct.data?.heroImage ? (
                  <img
                    src={getMediaUrl(featuredProduct.data.heroImage) || ""}
                    alt={featuredProduct.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-radial from-primary/10 via-muted to-muted/80 p-8 text-center">
                    <Layers className="h-16 w-16 text-primary/40 mb-3" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {featuredProduct.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Catalog Grid Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              All Available Products
            </h2>
            <p className="text-sm text-muted-foreground">
              Verified enterprise inventory and digital appliance blueprints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs">
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </Badge>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-16 text-center space-y-4">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">No Products Published</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No products are currently available for this tenant. Push new products via Payload CMS to populate this catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Enterprise Assurance Pillars */}
      <section className="rounded-2xl border border-border/60 bg-muted/20 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Enterprise Grade by Design
          </h3>
          <p className="text-sm text-muted-foreground">
            Every hardware appliance and software image complies with international operational security standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0 border border-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-sm">FIPS &amp; SOC2 Certified</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cryptographically audited firmware and automatic TLS certificate rotation built into every module.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0 border border-primary/20">
              <Globe2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-sm">Global Distribution</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Warehoused inventory across North America, EMEA, and APAC for rapid customs clearance and deployment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0 border border-primary/20">
              <Headphones className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-sm">24/7 SRE Support</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct tier-3 engineer escalations with guaranteed 15-minute SLA response for production outages.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
