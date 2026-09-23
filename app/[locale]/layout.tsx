import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Amiri,
  Cormorant_Garamond,
  IBM_Plex_Sans_Arabic,
  Manrope,
} from "next/font/google";
import { ThemeProvider } from "next-themes";

import "../globals.css";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { Toaster } from "@/components/ui/sonner";
import { getDictionary, isLocale, LOCALES, dir } from "@/lib/i18n/dictionary";

/* Fonts are self-hosted by next/font — no request leaves for Google at
   runtime. The families swap with locale in globals.css via :lang(ar). */

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1719" },
  ],
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: { default: `${d.brand} — ${d.tagline}`, template: `%s · ${d.brand}` },
    description: d.footer.blurb,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      title: `${d.brand} — ${d.tagline}`,
      description: d.footer.blurb,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [{ url: "/images/og.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      suppressHydrationWarning
      className={`${cormorant.variable} ${manrope.variable} ${amiri.variable} ${plexArabic.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute={["class", "data-theme"]}
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LocaleProvider locale={locale}>
            {children}
            <Toaster
              position={locale === "ar" ? "bottom-left" : "bottom-right"}
              duration={2800}
            />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
