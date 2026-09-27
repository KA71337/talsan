import type { Metadata } from "next";
import { absoluteUrl, BRAND_NAME, LOGO, OG_IMAGE, PRODUCTION_URL, siteUrl } from "@/config/site";
import type { Settings } from "./types";

/**
 * Full per-page metadata. Next.js replaces (not merges) nested `openGraph` / `twitter`
 * objects from the layout, so every page gets the complete set here.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  settings,
  type = "website",
}: {
  title?: string;
  description?: string;
  path: string;
  image?: string | null;
  settings: Settings;
  type?: "website" | "article";
}): Metadata {
  const img = image || settings.seo.ogImage || null;
  const images = img
    ? [{ url: img }]
    : [{ url: OG_IMAGE.src, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: BRAND_NAME }];
  const ogTitle = title ? `${title} | ${BRAND_NAME}` : `${settings.seo.title} | ${BRAND_NAME}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "az_AZ",
      siteName: BRAND_NAME,
      title: ogTitle,
      description,
      url: path,
      images,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: images.map((i) => i.url) },
  };
}

/* ------------------------------------------------------------------ */
/* Schema.org — only real data, nothing invented                       */
/* ------------------------------------------------------------------ */

export const ORG_ID = `${PRODUCTION_URL}/#organization`;
const WEBSITE_ID = `${PRODUCTION_URL}/#website`;

export function organizationSchema(s: Settings) {
  const c = s.contact;
  const sameAs = Object.values(c.socials).filter(Boolean);
  const base: Record<string, unknown> = {
    "@type": "Organization",
    "@id": ORG_ID,
    name: BRAND_NAME,
    url: siteUrl(),
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO.src), width: LOGO.width, height: LOGO.height },
    description: s.seo.description,
    ...(c.phone ? { telephone: c.phone } : {}),
    ...(c.email ? { email: c.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  // LocalBusiness only when a real address has been entered in the admin panel.
  if (c.address) {
    return {
      ...base,
      "@type": ["Organization", "LocalBusiness"],
      address: { "@type": "PostalAddress", streetAddress: c.address },
      ...(c.hours ? { openingHours: c.hours } : {}),
    };
  }
  return base;
}

export function siteSchema(s: Settings) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(s),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: BRAND_NAME,
        url: siteUrl(),
        inLanguage: "az",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function breadcrumbSchema(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };
}
