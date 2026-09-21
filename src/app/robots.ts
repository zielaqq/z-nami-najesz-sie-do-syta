import type { MetadataRoute } from "next";

import { getSiteUrl, isNoIndex } from "@/lib/site-url";

// Wymagane przy eksporcie statycznym (GitHub Pages); w zwykłym buildzie plik i tak jest statyczny.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Podgląd (np. GitHub Pages z przykładowym menu) nie może trafić do wyszukiwarek.
  if (isNoIndex) return { rules: { userAgent: "*", disallow: "/" } };

  const url = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
