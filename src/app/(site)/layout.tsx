import type { Metadata } from "next";
import { BRAND_NAME } from "@/config/site";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { RevealObserver } from "@/components/site/RevealObserver";
import { TopBar } from "@/components/site/TopBar";
import { getCategoriesWithCounts, getServices, getSettings } from "@/lib/content";
import { whatsappHref } from "@/lib/format";
import { jsonLd } from "@/lib/jsonld";
import { pageMeta, siteSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    ...pageMeta({ description: s.seo.description, path: "/", settings: s }),
    title: { default: `${s.seo.title} | ${BRAND_NAME}`, template: `%s | ${BRAND_NAME}` },
    applicationName: BRAND_NAME,
    robots: { index: true, follow: true },
  };
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
        services={services.map((s) => ({ slug: s.slug, title: s.title, icon: s.icon }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        inquiryHref={whatsappHref(settings.contact.whatsapp) ?? "/contacts"}
      />
      <main id="main">{children}</main>
      <Footer settings={settings} services={services} />
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteSchema(settings)) }} />
    </>
  );
}
