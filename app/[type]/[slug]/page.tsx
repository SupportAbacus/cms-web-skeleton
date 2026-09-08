import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getContent, formatDate, getSiteConfig, getAuthor, getMediaUrl } from "@/lib/cms-client";
import { robotsForPath } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { BlockDispatcher } from "@/components/blocks";
import { ContactForm } from "@/components/ContactForm";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

interface Params {
  params: { type: string; slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";
  const content = await getContent(siteKey, params.type, params.slug);
  if (!content) return {};
  const seo = content.seo;
  const robots =
    robotsForPath(config, `/${params.type}/${params.slug}`) ??
    (seo?.indexing === "noindex" ? { index: false, follow: false } : undefined);
  return {
    title: seo?.title ?? content.title,
    description: seo?.metaDescription,
    alternates: seo?.canonical ? { canonical: seo.canonical } : undefined,
    robots,
    openGraph: seo?.socialImage ? { images: [seo.socialImage] } : undefined,
  };
}

export default async function ContentPage({ params }: Params) {
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";

  const content = await getContent(siteKey, params.type, params.slug);
  if (!content) notFound();

  const author = content.authorId ? await getAuthor(content.authorId) : null;
  const d = (content.data ?? {}) as Record<string, any>;
  const hero = getMediaUrl(d.heroImage) || getMediaUrl(d.gallery?.[0]);
  const lead = content.seo?.metaDescription ?? (typeof d.excerpt === "string" ? d.excerpt : "");
  const date = formatDate(content.publishDate, "long");
  const reading = typeof d.readingMinutes === "number" ? d.readingMinutes : null;

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Navigation Breadcrumb */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to overview</span>
        </Link>
        <Badge variant="outline" className="text-xs">
          {content.contentType}
        </Badge>
      </div>

      {/* Article Header */}
      <header className="space-y-4 pb-8 border-b border-border/40">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
            {content.title}
          </h1>
          {lead ? (
            <p className="text-lg text-muted-foreground sm:text-xl leading-relaxed pt-2">
              {lead}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 text-sm text-muted-foreground">
          {author ? (
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="h-4 w-4 text-primary" />
              <span>{author.name}</span>
            </div>
          ) : null}
          {date ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
          ) : null}
          {reading ? (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{reading} min read</span>
            </div>
          ) : null}
        </div>
      </header>

      {/* Hero Image Container */}
      {hero ? (
        <div className="my-8 overflow-hidden rounded-xl border border-border/50 bg-muted shadow-xs">
          <img
            src={hero}
            alt={d.heroImage?.alt ?? content.title}
            className="w-full aspect-21/9 object-cover"
          />
        </div>
      ) : null}

      {/* Dynamic Block Dispatcher */}
      <div className="py-6">
        <BlockDispatcher body={content.body} />
      </div>

      {/* Inbound Contact Form Section */}
      <section className="mt-16 pt-10 border-t border-border/40 space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight">Have Questions or Feedback?</h3>
        </div>
        <ContactForm siteKey={siteKey} formKey="article-inquiry" />
      </section>
    </article>
  );
}
