import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/site";
import { withBase } from "@/lib/base-path";

// Wymagane przy eksporcie statycznym (GitHub Pages); w zwykłym buildzie plik i tak jest statyczny.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Do syta",
    description: siteConfig.seo.description,
    lang: "pl",
    start_url: withBase("/"),
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#faf6ef",
    icons: [
      { src: withBase("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
      { src: withBase("/icons/icon-512.png"), sizes: "512x512", type: "image/png" },
      { src: withBase("/icons/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
