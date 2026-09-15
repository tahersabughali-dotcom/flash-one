import type { MetadataRoute } from "next";

const SITE = "https://www.flashone.uk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/services", "/solutions", "/ai", "/company", "/contact"],
      disallow: [
        "/admin",
        "/app",
        "/auth",
        "/onboarding",
        "/pay",
        "/store",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
