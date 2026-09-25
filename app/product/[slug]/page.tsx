import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getContent, getSiteConfig, getMediaUrl } from "@/lib/cms-client";
import { robotsForPath } from "@/lib/site-config";
import { Product } from "@/types/cms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlockDispatcher } from "@/components/blocks";
import { ContactForm } from "@/components/ContactForm";
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Sparkles,
  FileText,
  MessageSquare
} from "lucide-react";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";
  const content = await getContent(siteKey, "product", slug);
  if (!content) return {};

  const product = content as unknown as Product;
  const seo = product.seo;
  const title = seo?.title || `${product.title} | ${config.name || "Product Catalog"}`;
  const description = seo?.metaDescription || product.data?.excerpt || "";
  const heroUrl = getMediaUrl(product.data?.heroImage);

  return {
    title,
    description,
    alternates: seo?.canonical ? { canonical: seo.canonical } : undefined,
    robots:
      robotsForPath(config, `/product/${slug}`) ??
      (seo?.indexing === "noindex" ? { index: false, follow: false } : undefined),
    openGraph: heroUrl ? { images: [heroUrl] } : undefined,
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";

  const content = await getContent(siteKey, "product", slug);
  if (!content) notFound();

  const product = content as unknown as Product;
  const d = product.data || {};
  const heroUrl = getMediaUrl(d.heroImage) || (d.gallery && d.gallery[0] ? getMediaUrl(d.gallery[0]) : null);
  const gallery = Array.isArray(d.gallery) ? d.gallery : [];
  const price = typeof d.price === "number" ? d.price : null;
  const currency = d.currency || "USD";
  const inStock = d.inStock !== false;
  const sku = d.sku;
  const description = product.seo?.metaDescription || d.excerpt;
  const benefits = Array.isArray(d.benefits) ? d.benefits : [];
  const features = Array.isArray(d.features) ? d.features : [];
  const specs = Array.isArray(d.specs) ? d.specs : [];

  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;

  // Structured Data (JSON-LD) for Search Engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: description,
    image: heroUrl || undefined,
    sku: sku || undefined,
    offers: price !== null ? {
      "@type": "Offer",
      price: price,
      priceCurrency: currency,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    } : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-12">
      {/* Search Engine Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/product"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to products</span>
        </Link>
        <div className="flex items-center gap-2">
          {sku ? (
            <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase bg-muted px-2.5 py-1 rounded-md border border-border/50">
              SKU: {sku}
            </span>
          ) : null}
          <Badge variant="outline" className="text-xs capitalize">
            {product.contentType}
          </Badge>
        </div>
      </div>

      {/* Product Hero: Two Column Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Visual Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/40 aspect-16/11 shadow-sm flex items-center justify-center">
            {heroUrl ? (
              <img
                src={heroUrl}
                alt={d.heroImage?.alt || product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative h-full w-full flex flex-col items-center justify-center bg-radial from-primary/15 via-muted/40 to-background p-8 text-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-md">
                  <Cpu className="h-10 w-10" />
                </div>
                {sku ? (
                  <span className="relative z-10 mt-4 font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {sku}
                  </span>
                ) : null}
              </div>
            )}

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {inStock ? (
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md shadow-xs">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock &amp; Ready to Ship
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold backdrop-blur-md">
                  Backorder Available
                </Badge>
              )}
            </div>
          </div>

          {/* Additional Gallery Thumbnails */}
          {gallery.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, idx) => {
                const url = getMediaUrl(img);
                if (!url) return null;
                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-lg border border-border/50 bg-muted aspect-4/3 shadow-xs hover:border-primary transition-colors cursor-pointer"
                  >
                    <img src={url} alt={img.alt || `Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Right Column: Key Details & Purchasing Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            {product.featured ? (
              <Badge className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-xs flex items-center gap-1 w-fit">
                <Sparkles className="h-3 w-3" />
                Featured Platform Solution
              </Badge>
            ) : null}

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance">
              {product.title}
            </h1>

            {description ? (
              <p className="text-base text-muted-foreground leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>

          {/* Pricing & Commercial Box */}
          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-4">
              <div>
                <span className="text-xs uppercase font-medium text-muted-foreground tracking-wider block">
                  Enterprise Unit Price
                </span>
                {price !== null ? (
                  <div className="flex items-baseline mt-1">
                    <span className="text-3xl font-black text-foreground">
                      {currencySymbol}{price.toLocaleString()}
                    </span>
                    <span className="ml-1.5 text-sm font-semibold text-muted-foreground">
                      {currency}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-foreground mt-1 block">
                    Custom Quote
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Inventory Status</span>
                <span className={`text-xs font-semibold ${inStock ? "text-emerald-500" : "text-amber-500"}`}>
                  {inStock ? "Immediate Dispatch" : "Lead time 2-3 weeks"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Button size="lg" className="w-full gap-2 text-base font-semibold shadow-md" asChild>
                <a href="#inquiry">
                  <MessageSquare className="h-4 w-4" />
                  <span>Request Deployment Quote</span>
                </a>
              </Button>
              <Button size="lg" variant="outline" className="w-full gap-2 text-sm font-medium" asChild>
                <a href="#specs">
                  <FileText className="h-4 w-4" />
                  <span>Review Technical Specs</span>
                </a>
              </Button>
            </div>

            <div className="pt-2 text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Includes 3-year enterprise warranty and 24/7 SRE support</span>
            </div>
          </div>

          {/* Key Value / Benefits */}
          {benefits.length > 0 ? (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Operational Benefits
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* Technical Specifications Section */}
      {specs.length > 0 ? (
        <section id="specs" className="space-y-6 pt-8 border-t border-border/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Technical Specifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Hardware tolerances, networking capabilities, and runtime throughput metrics.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
            <dl className="divide-y divide-border/40">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 sm:grid-cols-3 gap-2 px-6 py-4 text-sm ${
                    idx % 2 === 0 ? "bg-muted/15" : "bg-card"
                  }`}
                >
                  <dt className="font-semibold text-foreground/90 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {spec.label}
                  </dt>
                  <dd className="font-mono text-sm text-muted-foreground sm:col-span-2">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* Architectural Capabilities / Features Section */}
      {features.length > 0 ? (
        <section className="space-y-6 pt-8 border-t border-border/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Architecture &amp; Features
            </h2>
            <p className="text-sm text-muted-foreground">
              Core platform subsystem capabilities and protocol compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-xs"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm leading-snug">
                    {feat}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* CMS Block Dispatcher (Any Rich Text, Callouts, or Media attached in CMS) */}
      {Array.isArray(product.body) && product.body.length > 0 ? (
        <section className="pt-8 border-t border-border/50">
          <BlockDispatcher body={product.body} />
        </section>
      ) : null}

      {/* Direct Inquiry & Solution Engineering Form */}
      <section id="inquiry" className="pt-8 border-t border-border/50">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Request a Custom Quote or Pilot
            </h2>
            <p className="text-sm text-muted-foreground">
              Speak directly with our enterprise solutions architecture team for custom orders, SKU configuration, and volume discounts.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
            <ContactForm siteKey={siteKey} />
          </div>
        </div>
      </section>
    </div>
  );
}
