import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { getCategoriesWithCounts, getProducts } from "@/lib/content";

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories] = await Promise.all([getProducts(), getCategoriesWithCounts()]);
  const pages = ["", "/services", "/catalog", "/about", "/contacts"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...categories.map((c) => ({ url: `${base}/catalog/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
