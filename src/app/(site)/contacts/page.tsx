import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHead } from "@/components/site/PageHead";
import { getProductBySlug, getServices, getSettings } from "@/lib/content";
import { contactChannels, digits, SOCIAL_LABELS } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta({ title: "Əlaqə", description: s.texts.contactText, path: "/contacts", settings: s });
}

type Props = { searchParams: Promise<{ xidmet?: string; mehsul?: string }> };

export default async function ContactsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const c = settings.contact;
  const { tel, wa, mail } = contactChannels(settings);
  const product = typeof sp.mehsul === "string" ? await getProductBySlug(sp.mehsul) : null;
  const defaultService = services.some((s) => s.slug === sp.xidmet) ? sp.xidmet : "";
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => c.socials[k]);
  const hasAny = tel || wa || mail;

  return (
    <>
      <PageHead eyebrow="Əlaqə" title={settings.texts.contactTitle} lead={settings.texts.contactText} crumbs={[{ label: "Əlaqə" }]} />
      <section className="section" style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}>
        <div className="container contact-grid">
          <div className="channels">
            {tel && (
              <a className="channel" href={tel}>
                <span className="channel__icon">
                  <Icon name="phone" />
                </span>
                <span>
                  <small>Telefon</small>
                  <strong>{c.phone}</strong>
                </span>
              </a>
            )}
            {wa && (
              <a className="channel" href={wa} target="_blank" rel="noopener noreferrer">
                <span className="channel__icon">
                  <Icon name="whatsapp" />
                </span>
                <span>
                  <small>WhatsApp</small>
                  <strong>{c.whatsapp}</strong>
                </span>
              </a>
            )}
            {mail && (
              <a className="channel" href={mail}>
                <span className="channel__icon">
                  <Icon name="mail" />
                </span>
                <span>
                  <small>E-poçt</small>
                  <strong>{c.email}</strong>
                </span>
              </a>
            )}
            {c.address && (
              <div className="channel">
                <span className="channel__icon">
                  <Icon name="pin" />
                </span>
                <span>
                  <small>Ünvan</small>
                  <strong>{c.address}</strong>
                </span>
              </div>
            )}
            {c.hours && (
              <div className="channel">
                <span className="channel__icon">
                  <Icon name="clock" />
                </span>
                <span>
                  <small>İş saatları</small>
                  <strong>{c.hours}</strong>
                </span>
              </div>
            )}
            {socials.length > 0 && (
              <div className="channel" style={{ flexWrap: "wrap" }}>
                {socials.map((k) => (
                  <a key={k} className="btn btn--ghost btn--sm" href={c.socials[k]} target="_blank" rel="noopener noreferrer">
                    {SOCIAL_LABELS[k]}
                  </a>
                ))}
              </div>
            )}
            {!hasAny && <p className="notice">Əlaqə məlumatları tezliklə əlavə olunacaq.</p>}
          </div>

          <div className="form-card">
            <h2 className="h3" style={{ marginBottom: 20 }}>
              Sorğu forması
            </h2>
            <ContactForm
              whatsapp={wa ? digits(c.whatsapp) : null}
              email={c.email || null}
              services={services.map((s) => ({ slug: s.slug, title: s.title }))}
              defaultService={defaultService}
              defaultMessage={product ? `"${product.title}" barədə məlumat almaq istəyirəm.` : ""}
            />
          </div>
        </div>
      </section>
    </>
  );
}
