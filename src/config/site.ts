/** Official brand name — used everywhere (header, footer, SEO, structured data, admin). */
export const BRAND_NAME = "TalSan";

/** Primary production domain. All canonical / Open Graph / sitemap URLs point here. */
export const PRODUCTION_URL = "https://talsanpower.com";

/**
 * Client-supplied logo, prepared by scripts/prepare-logo.mjs (transparent background,
 * original proportions). White lettering → always place it on a dark surface.
 */
export const LOGO = { src: "/brand/talsan-logo.png", width: 1099, height: 713 } as const;
export const OG_IMAGE = { src: "/brand/talsan-og.png", width: 1200, height: 630 } as const;

export const CURRENCY = "AZN";

/** Absolute site origin for SEO URLs. Env allows override; falls back to PRODUCTION_URL. */
export function siteUrl(): string {
  const env = (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : "")?.trim();
  if (env) {
    try {
      const u = new URL(env);
      if (u.protocol === "https:" || u.protocol === "http:") return u.origin;
    } catch {
      /* ignore malformed env */
    }
  }
  return PRODUCTION_URL;
}

export const absoluteUrl = (path: string) => `${siteUrl()}${path === "/" ? "" : path}`;

export const NAV = [
  { href: "/", label: "Ana səhifə" },
  { href: "/services", label: "Xidmətlər", menu: "services" as const },
  { href: "/catalog", label: "Kataloq", menu: "catalog" as const },
  { href: "/about", label: "Haqqımızda" },
  { href: "/contacts", label: "Əlaqə" },
];
