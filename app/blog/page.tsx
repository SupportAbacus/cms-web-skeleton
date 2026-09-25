import type { Metadata } from "next";
import Link from "next/link";
import { listContent, getCategories, formatDate, getAuthor, getSiteConfig, getMediaUrl } from "@/lib/cms-client";
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, BookOpen, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Browse published blog articles.",
};

interface BlogIndexProps {
  searchParams: Promise<{
    category?: string;
    cursor?: string;
  }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const query = await searchParams;
  const config = await getSiteConfig();
  const siteKey = config.key || process.env.CMS_SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY || "local-test";

  const categories = await getCategories();
  const selectedCategorySlug = query.category || "all";

  const filters: Record<string, string> = {};
  if (selectedCategorySlug !== "all") {
    const matchedCat = categories.find((c) => c.slug === selectedCategorySlug);
    if (matchedCat) {
      filters["categoryId"] = matchedCat.id.toString();
    }
  }

  const { items, nextCursor } = await listContent(siteKey, "blog", {
    cursor: query.cursor,
    limit: 10,
    filters,
  });

  const featuredPost = items.find((i) => i.featured) || items[0];
  const gridPosts = featuredPost ? items.filter((i) => i.slug !== featuredPost.slug) : items;

  const featuredAuthor = featuredPost?.authorId ? await getAuthor(featuredPost.authorId) : null;
  const featuredData = (featuredPost?.data || {}) as Record<string, any>;
  const featuredHeroUrl = getMediaUrl(featuredData.heroImage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground text-balance">
          Technical Articles &amp; Insights
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl text-balance">
          Architectural blueprints, performance benchmarks, and design systems for enterprise headless platforms.
        </p>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 0 ? (
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategorySlug === "all" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/blog">All Categories</Link>
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategorySlug === cat.slug ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/blog?category=${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))}
        </div>
      ) : null}

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-16 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">No Published Articles Found</h3>
          {selectedCategorySlug !== "all" ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/blog">Clear Category Filters</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Featured Hero Post */}
      {featuredPost ? (
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-linear-to-b from-muted/60 via-muted/20 to-card p-6 sm:p-10 shadow-sm transition-all hover:border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className={featuredHeroUrl ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
              <div className="flex items-center gap-2.5">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 text-xs">
                  Featured
                </Badge>
                {featuredPost.publishDate ? (
                  <span className="text-xs text-muted-foreground font-medium">
                    {formatDate(featuredPost.publishDate, "long")}
                  </span>
                ) : null}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {featuredPost.seo?.metaDescription || (featuredPost.data as any)?.excerpt || ""}
              </p>
              <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                {featuredAuthor ? (
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>{featuredAuthor.name}</span>
                  </div>
                ) : null}
                {typeof (featuredPost.data as any)?.readingMinutes === "number" ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{(featuredPost.data as any).readingMinutes} min read</span>
                  </div>
                ) : null}
              </div>
              <div className="pt-3">
                <Button asChild>
                  <Link href={`/blog/${featuredPost.slug}`} className="inline-flex items-center gap-2">
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {featuredHeroUrl ? (
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-muted aspect-16/10 shadow-xs">
                  <img
                    src={featuredHeroUrl}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Grid of Standard Articles */}
      {gridPosts.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="text-xl font-bold tracking-tight">Recent Articles</h3>
            <span className="text-xs text-muted-foreground">Showing {gridPosts.length} posts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => {
              const d = (post.data || {}) as any;
              const date = formatDate(post.publishDate);
              const reading = typeof d.readingMinutes === "number" ? d.readingMinutes : null;
              const thumb = getMediaUrl(d.heroImage);

              return (
                <Card key={post.slug} className="flex flex-col overflow-hidden border-border/60 hover:border-primary/50 transition-colors">
                  {thumb ? (
                    <div className="overflow-hidden bg-muted aspect-16/9">
                      <img
                        src={thumb}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <CardHeader className="space-y-2 pb-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {date ? <span>{date}</span> : null}
                      {reading ? <span>{reading} min read</span> : null}
                    </div>
                    <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                    {post.seo?.metaDescription || d.excerpt ? (
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                        {post.seo?.metaDescription || d.excerpt}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardFooter className="mt-auto pt-4 border-t border-border/40 flex items-center justify-end">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Pagination Controls */}
      {nextCursor ? (
        <div className="flex items-center justify-between border-t border-border/40 pt-6">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page 1</span>
          <Button variant="outline" size="sm" disabled={!nextCursor}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
