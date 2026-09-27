import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHead } from "@/components/site/PageHead";
import { getServices, getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.texts.servicesTitle,
    description: s.texts.servicesText,
    alternates: { canonical: "/services" },
    openGraph: { title: s.texts.servicesTitle, description: s.texts.servicesText, url: "/services" },
  };
}

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <>
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
                <Link href={`/contacts?xidmet=${s.slug}`} className="btn btn--accent">
                  Sorğu göndər <Icon name="arrow" />
                </Link>
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
