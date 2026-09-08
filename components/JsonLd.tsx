import React from "react";

export interface ArticleJsonLdProps {
  type?: "Article" | "BlogPosting";
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
  url: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListJsonLdProps {
  items: BreadcrumbItem[];
}

export function ArticleJsonLd({
  type = "BlogPosting",
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  publisherName,
  publisherLogo,
  url,
}: ArticleJsonLdProps) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": type,
    headline,
    description,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (image) {
    schema.image = [image];
  }
  if (authorName) {
    schema.author = {
      "@type": "Person",
      name: authorName,
    };
  }
  if (publisherName) {
    schema.publisher = {
      "@type": "Organization",
      name: publisherName,
      logo: publisherLogo ? { "@type": "ImageObject", url: publisherLogo } : undefined,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbListJsonLd({ items }: BreadcrumbListJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
