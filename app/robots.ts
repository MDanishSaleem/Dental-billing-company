import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXTAUTH_URL ?? "https://dentalbillingcompany.us";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api", "/auth"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
