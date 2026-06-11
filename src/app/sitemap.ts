import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://activemirror.ai",
      lastModified: new Date("2026-06-10"),
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
    {
      url: "https://activemirror.ai/trust",
      lastModified: new Date("2026-06-09"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://activemirror.ai/proof-sprint",
      lastModified: new Date("2026-06-10"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://activemirror.ai/glass",
      lastModified: new Date("2026-06-09"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://activemirror.ai/compare",
      lastModified: new Date("2026-06-09"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: "https://activemirror.ai/intake",
      lastModified: new Date("2026-06-09"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: "https://activemirror.ai/privacy",
      lastModified: new Date("2026-06-11"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: "https://activemirror.ai/terms",
      lastModified: new Date("2026-06-11"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
