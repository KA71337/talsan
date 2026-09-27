import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHead } from "@/components/site/PageHead";
import { getServices, getSettings } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const description = s.texts.aboutText.split("\n")[0].slice(0, 160);
  return pageMeta({ title: "Haqqımızda", description, path: "/about", settings: s });
}

export default async function AboutPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const t = settings.texts;
  return (
    <>
      <PageHead eyebrow="Haqqımızda" title={t.aboutTitle} crumbs={[{ label: "Haqqımızda" }]} />
      <section className="section">
        <div className="container about-grid">
          <div style={{ display: "grid", gap: 40 }}>
            <p className="prose" style={{ fontSize: 17 }}>
              {t.aboutText}
            </p>
            {services.length > 0 && (
              <div style={{ display: "grid", gap: 16 }}>
                <span className="eyebrow">Fəaliyyət istiqamətləri</span>
                <ul className="lines-list">
                  {services.map((s) => (
                    <li key={s.id}>
                      <Link href={`/services#${s.slug}`}>
                        <Icon name={s.icon} />
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {t.aboutImage && (
            <figure className="about-media" data-reveal>
              <SafeImage src={t.aboutImage} alt="Avadanlıq" fill sizes="(max-width: 900px) 100vw, 500px" />
            </figure>
          )}
        </div>
      </section>
      <CtaBand settings={settings} />
    </>
  );
}
