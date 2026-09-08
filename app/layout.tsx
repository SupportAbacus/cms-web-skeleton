import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConnectorTags } from "@/components/ConnectorTags";
import { Toaster } from "@/components/ui/sonner";
import { Layers, ArrowRight } from "lucide-react";
import { getSiteConfig } from "@/lib/cms-client";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteName = config.name || "Reference Site";
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: config.name
      ? `Official site for ${config.name}`
      : "Enterprise Headless CMS powered by Next.js 14, Tailwind CSS v4, and Payload CMS 3.0",
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const config = await getSiteConfig();
  const siteName = config.name || "Reference Site";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ConnectorTags connectors={config.headerConnectors} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/10 selection:text-primary">
        <div className="relative flex min-h-screen flex-col">
          {/* Top Navigation */}
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-semibold tracking-tight">{siteName}</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link href="/" className="text-foreground/80 transition-colors hover:text-foreground">
                    Home
                  </Link>
                  <Link href="/blog" className="text-foreground/80 transition-colors hover:text-foreground">
                    Blog
                  </Link>
                  <Link href="/product" className="text-foreground/80 transition-colors hover:text-foreground">
                    Products
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/blog"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                >
                  <span>Explore CMS</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-border/40 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2 font-bold tracking-tight">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-base font-semibold">{siteName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Autonomous Headless CMS ecosystem featuring multi-tenant site isolation, edge ISR caching, and Tailwind CSS v4 styling.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Navigation</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link href="/" className="hover:text-foreground transition-colors">
                        Overview
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="hover:text-foreground transition-colors">
                        Technical Articles
                      </Link>
                    </li>
                    <li>
                      <Link href="/product" className="hover:text-foreground transition-colors">
                        Product Solutions
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Stack</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Next.js 14 App Router</li>
                    <li>Tailwind CSS v4 (CSS-first)</li>
                    <li>shadcn/ui &amp; Radix</li>
                    <li>Payload 3.0 Headless</li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border/40 pt-8 text-xs text-muted-foreground gap-4">
                <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
