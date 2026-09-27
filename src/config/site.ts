/**
 * Brand placeholder.
 *
 * The client has not provided a final brand name or logo yet. The site shows a
 * neutral text wordmark. The live value is edited in /admin → Parametrlər
 * (stored in data/settings.json); the value below is only the fallback.
 */
export const BRAND_PLACEHOLDER = "Brend adı";

export const CURRENCY = "AZN";

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const NAV = [
  { href: "/", label: "Ana səhifə" },
  { href: "/services", label: "Xidmətlər", menu: "services" as const },
  { href: "/catalog", label: "Kataloq", menu: "catalog" as const },
  { href: "/about", label: "Haqqımızda" },
  { href: "/contacts", label: "Əlaqə" },
];
