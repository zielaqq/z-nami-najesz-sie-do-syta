import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = getSiteUrl();
  return [
    { url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${url}/polityka-prywatnosci`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
