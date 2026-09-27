import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** Public site is indexable; only the admin panel and its API are closed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
