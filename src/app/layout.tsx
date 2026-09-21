import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Figtree, Fraunces } from "next/font/google";

import { siteConfig } from "@/data/site";
import { getSiteUrl, isNoIndex } from "@/lib/site-url";

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
  robots: isNoIndex
    ? { index: false, follow: false }
    : {
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

/**
 * Układ główny: czcionki, metadane i znacznik „JS działa”. Nagłówek i stopka strony publicznej są w
 * `SiteChrome` (używa go `(site)/layout.tsx`), dzięki czemu panel klientki (/panel) ma własny, czysty widok.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pl" className={`${figtree.variable} ${fraunces.variable} ${frauncesItalic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealGate }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
