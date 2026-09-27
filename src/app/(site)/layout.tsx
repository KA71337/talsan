import type { Metadata } from "next";
import { siteUrl } from "@/config/site";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RevealObserver } from "@/components/site/RevealObserver";
import { TopBar } from "@/components/site/TopBar";
import { getCategoriesWithCounts, getServices, getSettings } from "@/lib/content";
import { jsonLd } from "@/lib/jsonld";
import type { Settings } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.seo.title} | ${s.brand.name}`;
  return {
    title: { default: title, template: `%s | ${s.brand.name}` },
    description: s.seo.description,
    applicationName: s.brand.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "az_AZ",
      siteName: s.brand.name,
      title,
      description: s.seo.description,
      url: "/",
      images: s.seo.ogImage ? [{ url: s.seo.ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: s.seo.description },
    robots: { index: true, follow: true },
  };
}

function organizationSchema(s: Settings) {
  const url = siteUrl();
  const c = s.contact;
  const sameAs = Object.values(c.socials).filter(Boolean);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.brand.name,
    url,
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

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, categories] = await Promise.all([getSettings(), getServices(), getCategoriesWithCounts()]);
  return (
    <>
      <a href="#main" className="skip-link">
        Məzmuna keç
      </a>
      <TopBar settings={settings} />
      <Header
        brand={settings.brand.name}
        tagline={settings.brand.tagline}
        services={services.map((s) => ({ slug: s.slug, title: s.title, icon: s.icon }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} services={services} />
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema(settings)) }} />
    </>
  );
}
