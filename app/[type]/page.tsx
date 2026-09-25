import Link from "next/link";
import type { Metadata } from "next";
import { listContent, formatDate, getSiteConfig } from "@/lib/cms-client";
import { robotsForPath } from "@/lib/site-config";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const config = await getSiteConfig();
  return { robots: robotsForPath(config, `/${type}`) };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";
  const { items } = await listContent(siteKey, type, {});
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{label}</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-12 text-center">
          <p className="text-muted-foreground">No published {type} records yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((c) => {
            const date = formatDate(c.publishDate);
            const d = (c.data ?? {}) as Record<string, any>;
            const excerpt = typeof d.excerpt === "string" ? d.excerpt : "";
            return (
              <Card key={c.slug} className="flex flex-col overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="space-y-2 p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-snug">
                    <Link href={`/${c.contentType}/${c.slug}`} className="hover:text-primary transition-colors">
                      {c.title}
                    </Link>
                  </CardTitle>
                  {excerpt ? <CardDescription className="line-clamp-2 text-sm">{excerpt}</CardDescription> : null}
                </CardHeader>
                <CardFooter className="mt-auto p-5 pt-0 text-xs text-muted-foreground border-t border-border/30 mt-4 pt-3 flex items-center justify-between">
                  {date ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {date}
                    </span>
                  ) : null}
                  <Link href={`/${c.contentType}/${c.slug}`} className="font-medium text-primary hover:underline">
                    View &rarr;
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
