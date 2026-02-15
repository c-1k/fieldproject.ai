import type { MetadataRoute } from "next";
import { PARTICLES } from "@/lib/particles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fieldproject.ai";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/architecture`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/laws`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/particles`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const particleRoutes: MetadataRoute.Sitemap = Object.keys(PARTICLES).map(
    (id) => ({
      url: `${baseUrl}/particles/${id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  );

  return [...staticRoutes, ...particleRoutes];
}
