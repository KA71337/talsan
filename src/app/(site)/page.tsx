import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import { ProductCard, ServiceCard } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { getCategories, getProducts, getServices, getSettings } from "@/lib/content";

export default async function HomePage() {
  const [settings, services, products, categories] = await Promise.all([
    getSettings(),
    getServices(),
    getProducts(),
    getCategories(),
  ]);
  const t = settings.texts;
  const catById = new Map(categories.map((c) => [c.id, c]));
  const featured = products.slice(0, 6);
  const repairService = services.find((s) => s.icon === "repair") ?? services[0];

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            {t.heroEyebrow && <span className="eyebrow">{t.heroEyebrow}</span>}
            <h1 className="h1 hero__title">{t.heroTitle}</h1>
            {t.heroText && <p className="lead">{t.heroText}</p>}
            <div className="hero__actions">
              <Link href="/services" className="btn">
                Xidmətlərə bax <Icon name="arrow" />
              </Link>
              <Link href="/contacts" className="btn btn--ghost">
                Əlaqə saxla
              </Link>
            </div>
            {services.length > 0 && (
              <nav className="hero__lines" aria-label="Əsas xidmətlər">
                {services.slice(0, 4).map((s, i) => (
                  <Link key={s.id} href={`/services#${s.slug}`}>
                    <span>
                      <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </span>
                    <Icon name="arrow" />
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="hero__media">
            <span className="hero__marks" aria-hidden="true" />
            <figure className="hero__main">
              <SafeImage
                src={t.heroImage}
                alt="Avadanlıq"
                fill
                preload
                quality={85}
                sizes="(max-width: 1024px) 100vw, 700px"
              />
            </figure>
            {t.heroImageSecondary && (
              <figure className="hero__inset">
                <SafeImage src={t.heroImageSecondary} alt="Avadanlıq" fill sizes="(max-width: 1024px) 40vw, 300px" />
              </figure>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="section" id="xidmetler" data-reveal>
        <div className="container">
          <div className="section-head">
            <div className="section-head__title">
              <span className="eyebrow">Xidmətlər</span>
              <h2 className="h2">{t.servicesTitle}</h2>
            </div>
            <div className="section-head__aside">
              {t.servicesText && <p className="lead">{t.servicesText}</p>}
            </div>
          </div>
          <div className="grid-cards">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
            <div className="cta-card">
              <span className="eyebrow eyebrow--light">Məsləhət</span>
              <h3 className="h3">Hansı avadanlığın uyğun olduğunu bilmirsiniz?</h3>
              <p>Tələbatınızı yazın — seçimdə köməklik göstərək.</p>
              <Link href="/contacts" className="btn btn--accent btn--sm">
                Əlaqə saxla <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Repair band ---------------- */}
      {t.repairTitle && (
        <section className="section section--dark" data-reveal>
          <div className="container split">
            <figure className="split__media">
              <SafeImage src={t.repairImage} alt="Texniki servis" fill sizes="(max-width: 900px) 100vw, 600px" />
            </figure>
            <div className="split__content">
              <span className="eyebrow eyebrow--light">Texniki servis</span>
              <h2 className="h2">{t.repairTitle}</h2>
              {t.repairText && <p className="lead">{t.repairText}</p>}
              <ol className="steps">
                <li>
                  <span className="mono">01</span>
                  <div>
                    <strong>Müraciət edin</strong>
                    <span>Telefon, WhatsApp və ya sorğu forması ilə.</span>
                  </div>
                </li>
                <li>
                  <span className="mono">02</span>
                  <div>
                    <strong>Avadanlıq barədə məlumat verin</strong>
                    <span>Model, nasazlığın təsviri və mümkünsə foto.</span>
                  </div>
                </li>
                <li>
                  <span className="mono">03</span>
                  <div>
                    <strong>Şərtləri dəqiqləşdirin</strong>
                    <span>Təmir imkanı və şərtlər barədə cavab alın.</span>
                  </div>
                </li>
              </ol>
              <Link
                href={repairService ? `/contacts?xidmet=${repairService.slug}` : "/contacts"}
                className="btn btn--accent"
              >
                Təmir üçün müraciət <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Catalog preview ---------------- */}
      {featured.length > 0 && (
        <section className="section" data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Kataloq</span>
                <h2 className="h2">{t.catalogTitle}</h2>
              </div>
              <div className="section-head__aside">
                {t.catalogText && <p className="lead">{t.catalogText}</p>}
                <Link href="/catalog" className="link-arrow">
                  Bütün kataloq <Icon name="arrow" />
                </Link>
              </div>
            </div>
            <div className="grid-cards">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} category={catById.get(p.category)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand settings={settings} />
    </>
  );
}
