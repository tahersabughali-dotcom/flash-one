import type { MetadataRoute } from "next";

const SITE = "https://www.flashone.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-15");
  return [
    "",
    "/services",
    "/solutions",
    "/ai",
    "/company",
    "/contact",
  ].map((path) => ({
    url: `${SITE}${path || "/"}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
