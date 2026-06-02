import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://activemirror.ai",
      lastModified: new Date("2026-06-02"),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}

