import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { enUS, esES } from "@clerk/localizations";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";

const inter = Inter({ subsets: ["latin"] });

// On Vercel the production domain is known at build time; no extra variable needed.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
    openGraph: {
      type: "website",
      url: "/",
      siteName: t.meta.title,
      title: `${t.meta.title} — ${t.landing.title}`,
      description: t.meta.description,
      locale: locale === "es" ? "es_PE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t.meta.title} — ${t.landing.title}`,
      description: t.meta.description,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale } = await getI18n();

  return (
    <ClerkProvider localization={locale === "es" ? esES : enUS}>
      <html lang={locale}>
        <body className={`${inter.className} min-h-screen bg-background text-foreground`} suppressHydrationWarning>
          <I18nProvider locale={locale}>
            {children}
            <Toaster />
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
