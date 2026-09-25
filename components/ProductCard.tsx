import React from "react";
import Link from "next/link";
import { Product } from "@/types/cms";
import { getMediaUrl } from "@/lib/cms-client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles, Cpu } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const d = product.data || {};
  const heroUrl = getMediaUrl(d.heroImage) || (d.gallery && d.gallery[0] ? getMediaUrl(d.gallery[0]) : null);
  const price = typeof d.price === "number" ? d.price : null;
  const currency = d.currency || "USD";
  const inStock = d.inStock !== false;
  const sku = d.sku;
  const description = product.seo?.metaDescription || d.excerpt;
  const features = Array.isArray(d.features) ? d.features.slice(0, 2) : [];
  const specs = Array.isArray(d.specs) ? d.specs.slice(0, 2) : [];

  // Format currency symbol
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : `${currency} `;

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300">
      {/* Visual Media Header */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted/40 flex items-center justify-center border-b border-border/40">
        {heroUrl ? (
          <img
            src={heroUrl}
            alt={d.heroImage?.alt || product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative h-full w-full flex flex-col items-center justify-center bg-radial from-primary/15 via-muted/30 to-background p-6">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Cpu className="h-6 w-6" />
            </div>
            {sku ? (
              <span className="relative z-10 mt-3 font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {sku}
              </span>
            ) : null}
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {inStock ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5 shadow-xs backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              In Stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-semibold backdrop-blur-md">
              Lead Time Required
            </Badge>
          )}

          {product.featured ? (
            <Badge className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground text-[11px] font-semibold shadow-xs flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Featured
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Card Content */}
      <CardHeader className="space-y-2.5 p-5 pb-3">
        {sku ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase bg-muted/70 px-2 py-0.5 rounded border border-border/50">
              SKU: {sku}
            </span>
          </div>
        ) : null}

        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
          <Link href={`/product/${product.slug}`}>
            {product.title}
          </Link>
        </h3>

        {description ? (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-2 grow">
        {/* Technical Highlights */}
        {features.length > 0 ? (
          <div className="space-y-1.5 border-t border-border/40 pt-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Key Capabilities
            </p>
            <ul className="space-y-1">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : specs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3">
            {specs.map((spec, idx) => (
              <div key={idx} className="rounded-md bg-muted/40 p-2 border border-border/40">
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground truncate">
                  {spec.label}
                </span>
                <span className="block text-xs font-medium text-foreground truncate">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>

      {/* Card Footer: Pricing & Action */}
      <CardFooter className="mt-auto flex items-center justify-between border-t border-border/50 bg-muted/20 p-5 pt-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider">
            Enterprise Unit
          </span>
          {price !== null ? (
            <div className="flex items-baseline">
              <span className="text-2xl font-black tracking-tight text-foreground">
                {currencySymbol}{price.toLocaleString()}
              </span>
              <span className="ml-1 text-xs font-semibold text-muted-foreground">
                {currency}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              Custom Quote
            </span>
          )}
        </div>

        <Button size="sm" asChild className="gap-1.5 shadow-xs group-hover:bg-primary/90">
          <Link href={`/product/${product.slug}`}>
            <span>Details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
