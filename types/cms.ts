export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "DELETED";

export interface Seo {
  title?: string;
  metaDescription?: string;
  canonical?: string;
  socialImage?: string;
  indexing?: "index" | "noindex";
}

export interface Block {
  type: string;
  data: any;
}

export interface MediaRef {
  key: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SharedFields {
  title: string;
  slug: string;
  status: ContentStatus;
  featured: boolean;
  seo: Seo;
  body: Block[];
  categoryId: number | null;
  authorId: number | null;
  publishDate: string | null;
}

export interface Product extends SharedFields {
  contentType: "product";
  data: {
    sku?: string;
    price?: number;
    currency?: string;
    inStock?: boolean;
    heroImage?: MediaRef;
    gallery?: MediaRef[];
    specs?: { label: string; value: string }[];
    benefits?: string[];
    features?: string[];
    excerpt?: string;
  };
}

export interface Blog extends SharedFields {
  contentType: "blog";
  data: {
    excerpt?: string;
    readingMinutes?: number;
    heroImage?: MediaRef;
    relatedPostIds?: number[];
  };
}

export type PublishedContent = Product | Blog;
