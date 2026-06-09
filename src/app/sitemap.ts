import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://activemirror.ai",
      lastModified: new Date("2026-06-06"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://activemirror.ai/about",
      lastModified: new Date("2026-06-09"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: "https://activemirror.ai/mirror",
      lastModified: new Date("2026-06-09"),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
