import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Figtree, Fraunces } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/data/site";
import { getUpcomingEvents } from "@/lib/content";
import { buildStructuredData } from "@/lib/schema";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

// Czcionki są hostowane lokalnie przez next/font (bez zapytań do Google w przeglądarce).
// „latin-ext” zawiera polskie znaki (ą ć ę ł ń ó ś ź ż).
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "swap",
});

// Antykwa nagłówków: oś optycznego rozmiaru („opsz”) daje wyraźnie elegantszy kontrast liter
// w dużych tytułach (≈ 124 KB dla obu podzbiorów).
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

// Kursywa jest używana tylko w akcencie „do syta” (hero) – wystarczy statyczny wariant 400
// w podzbiorze łacińskim (≈ 22 KB zamiast ≈ 150 KB). ⚠ Jeśli dodasz kursywą polskie znaki
// (ą ę ł ń ś ź ż ć), dopisz "latin-ext" do subsets – inaczej wyświetlą się czcionką zastępczą.
const frauncesItalic = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces-italic",
  display: "swap",
  style: ["italic"],
  weight: "400",
});

const { seo } = siteConfig;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: seo.description,
  applicationName: siteConfig.name,
  category: "restaurant",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "/",
    siteName: siteConfig.name,
    title: seo.title,
    description: seo.description,
    images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.ogImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: [{ url: seo.ogImage, alt: seo.ogImageAlt }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf6ef",
  colorScheme: "light",
};

/**
 * Znacznik „JS działa” dla animacji przy przewijaniu (patrz globals.css).
 * Bezpiecznik: jeśli po 5 s hydracja się nie zakończyła, odsłaniamy całą treść.
 */
const revealGate = `document.documentElement.classList.add("js");window.setTimeout(function(){if(!window.__revealReady){document.documentElement.classList.add("no-reveal")}},5000);`;

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const upcomingEvents = await getUpcomingEvents();

  return (
    <html lang="pl" className={`${figtree.variable} ${fraunces.variable} ${frauncesItalic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealGate }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-ink focus:px-5 focus:py-3 focus:font-semibold focus:text-cream"
        >
          Przejdź do treści
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer hasEvents={upcomingEvents.length > 0} />
        <ScrollReveal />
        <JsonLd data={buildStructuredData()} />
      </body>
    </html>
  );
}
