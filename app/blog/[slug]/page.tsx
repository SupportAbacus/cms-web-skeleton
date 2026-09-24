import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getContent, formatDate, getSiteConfig, getAuthor, getMediaUrl } from "@/lib/cms-client";
import { robotsForPath } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { BlockDispatcher } from "@/components/blocks";
import { ContactForm } from "@/components/ContactForm";
import { TableOfContents } from "@/components/TableOfContents";
import { ArrowLeft, Calendar, Clock, User, Sparkles } from "lucide-react";

interface Params {
  params: { slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";
  const content = await getContent(siteKey, "blog", params.slug);
  if (!content) return {};
  const seo = content.seo;
  const robots =
    robotsForPath(config, `/blog/${params.slug}`) ??
    (seo?.indexing === "noindex" ? { index: false, follow: false } : undefined);
  return {
    title: seo?.title ?? content.title,
    description: seo?.metaDescription,
    alternates: seo?.canonical ? { canonical: seo.canonical } : undefined,
    robots,
    openGraph: seo?.socialImage ? { images: [seo.socialImage] } : undefined,
  };
}

export default async function BlogDetailPage({ params }: Params) {
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";

  const content = await getContent(siteKey, "blog", params.slug);
  if (!content) notFound();

  const author = content.authorId ? await getAuthor(content.authorId) : null;
  const d = (content.data ?? {}) as Record<string, any>;
  const hero = getMediaUrl(d.heroImage);
  const lead = content.seo?.metaDescription ?? (typeof d.excerpt === "string" ? d.excerpt : "");
  const date = formatDate(content.publishDate, "long");
  const reading = typeof d.readingMinutes === "number" ? d.readingMinutes : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Navigation Breadcrumbs */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to articles</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {content.contentType}
          </Badge>
        </div>
      </div>

      {/* Two Column Layout: Main Article + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Column */}
        <article className="lg:col-span-8 space-y-8">
          {/* Header */}
          <header className="space-y-4 pb-8 border-b border-border/40">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground text-balance">
              {content.title}
            </h1>
            {lead ? (
              <p className="text-lg text-muted-foreground sm:text-xl leading-relaxed pt-2">
                {lead}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
              {author ? (
                <div className="flex items-center gap-2 font-medium text-foreground">
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

          {/* Hero Banner */}
          {hero ? (
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm aspect-21/9">
              <img
                src={hero}
                alt={d.heroImage?.alt ?? content.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          {/* Executive Overview Callout */}
          {lead ? (
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-6 text-sm sm:text-base leading-relaxed text-foreground flex items-start gap-4 shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-primary block">
                  Executive Summary
                </span>
                <p className="text-muted-foreground leading-relaxed">{lead}</p>
              </div>
            </div>
          ) : null}

          {/* Rendered Block Content */}
          <div className="py-2">
            <BlockDispatcher body={content.body} />
          </div>

          {/* Author Bio Card at Bottom */}
          {author ? (
            <div className="my-12 rounded-xl border border-border/60 bg-muted/20 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-bold text-base text-foreground">{author.name}</h4>
                  <Badge variant="secondary" className="text-[10px]">Author</Badge>
                </div>
                {author.bio ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {author.bio}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Inquiry Form */}
          <section className="pt-10 border-t border-border/40 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Questions or Feedback?</h3>
            </div>
            <ContactForm siteKey={siteKey} formKey="blog-inquiry" />
          </section>
        </article>

        {/* Sticky Sidebar (Table of Contents) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <TableOfContents body={content.body} />
          </div>
        </aside>
      </div>
    </div>
  );
}
