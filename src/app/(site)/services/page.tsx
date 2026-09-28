import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHead } from "@/components/site/PageHead";
import { contextualInquiryMessage } from "@/config/contact";
import { absoluteUrl } from "@/config/site";
import { getServices, getSettings } from "@/lib/content";
import { whatsappHref } from "@/lib/format";
import { jsonLd } from "@/lib/jsonld";
import { ORG_ID, pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta({ title: s.texts.servicesTitle, description: s.texts.servicesText, path: "/services", settings: s });
}

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        ...(s.summary || s.description ? { description: s.summary || s.description } : {}),
        url: absoluteUrl(`/services#${s.slug}`),
        ...(s.image ? { image: absoluteUrl(s.image) } : {}),
        provider: { "@id": ORG_ID },
      },
    })),
  };
  return (
    <>
      {services.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />}
      <PageHead
        eyebrow="Xidmətlər"
        title={settings.texts.servicesTitle}
        lead={settings.texts.servicesText}
        crumbs={[{ label: "Xidmətlər" }]}
      />
      <section className="section">
        <div className="container service-rows">
          {services.map((s, i) => (
            <article key={s.id} id={s.slug} className="service-row" data-reveal>
              <figure className="service-row__media">
                {s.image ? (
                  <SafeImage src={s.image} alt={s.title} fill sizes="(max-width: 860px) 100vw, 600px" />
                ) : (
                  <span className="service-row__placeholder">
                    <Icon name={s.icon} />
                  </span>
                )}
              </figure>
              <div className="service-row__content">
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="h2">{s.title}</h2>
                {s.summary && <p className="lead">{s.summary}</p>}
                {s.description && <p className="prose">{s.description}</p>}
                {whatsappHref(settings.contact.whatsapp, contextualInquiryMessage(s.title)) && (
                  <a
                    href={whatsappHref(settings.contact.whatsapp, contextualInquiryMessage(s.title))!}
                    className="btn btn--accent"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sorğu göndər <Icon name="arrow" />
                  </a>
                )}
              </div>
            </article>
          ))}
          {services.length === 0 && <div className="empty">Xidmətlər tezliklə əlavə olunacaq.</div>}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
