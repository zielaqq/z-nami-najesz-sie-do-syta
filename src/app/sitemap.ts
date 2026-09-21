import type { MetadataRoute } from "next";

import { getSiteUrl, isNoIndex } from "@/lib/site-url";

// Wymagane przy eksporcie statycznym (GitHub Pages); w zwykłym buildzie plik i tak jest statyczny.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Podgląd nie jest przeznaczony do indeksowania – pusta mapa strony (patrz robots.ts).
  if (isNoIndex) return [];

  const url = getSiteUrl();
  return [
    { url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${url}/polityka-prywatnosci`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
