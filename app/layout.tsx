import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
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
    title: { default: siteName, template: `%s${config.seoDefaults?.titleSuffix || ` | ${siteName}`}` },
    description: config.seoDefaults?.defaultDescription || `Official site for ${siteName}`,
    openGraph: config.seoDefaults?.defaultSocialImage ? { images: [config.seoDefaults.defaultSocialImage] } : undefined,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const config = await getSiteConfig();
  const siteName = config.name || "Reference Site";
  const navigation = [
    { href: "/", label: "Home", enabled: true },
    { href: "/blog", label: "Blog", enabled: config.allowedContentTypes.includes("blog") },
    { href: "/product", label: "Products", enabled: config.allowedContentTypes.includes("product") },
    { href: "/service", label: "Services", enabled: config.allowedContentTypes.includes("service") },
  ].filter((item) => item.enabled);

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
                  {navigation.map((item) => (
                    <Link key={item.href} href={item.href} className="text-foreground/80 transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href={navigation[1]?.href || "/"}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                >
                  <span>Explore</span>
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
                    {config.seoDefaults?.defaultDescription || `Official website for ${siteName}.`}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Navigation</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {navigation.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Contact</h4>
                  <p className="text-sm text-muted-foreground">{String(config.contactInfo?.supportEmail || "")}</p>
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
