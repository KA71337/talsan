import Link from "next/link";
import { NAV } from "@/config/site";
import { contactChannels, SOCIAL_LABELS } from "@/lib/format";
import type { Service, Settings } from "@/lib/types";

export function Footer({ settings, services }: { settings: Settings; services: Service[] }) {
  const { tel, wa, mail } = contactChannels(settings);
  const c = settings.contact;
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => c.socials[k]);
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__about">
          <div className="brand">
            <span className="brand__name">{settings.brand.name}</span>
            {settings.brand.tagline && <span className="brand__tag">{settings.brand.tagline}</span>}
          </div>
          <p>{settings.seo.description}</p>
          {socials.length > 0 && (
            <div className="socials">
              {socials.map((k) => (
                <a key={k} href={c.socials[k]} target="_blank" rel="noopener noreferrer">
                  {SOCIAL_LABELS[k]}
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Alt menyu">
          <h3>Naviqasiya</h3>
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3>Xidmətlər</h3>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/services#${s.slug}`}>{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Əlaqə</h3>
          <ul>
            {tel && (
              <li>
                <a href={tel}>{c.phone}</a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            {mail && (
              <li>
                <a href={mail}>{c.email}</a>
              </li>
            )}
            {c.address && <li>{c.address}</li>}
            {c.hours && <li>{c.hours}</li>}
            <li>
              <Link href="/contacts">Sorğu göndər →</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>
          © {year} {settings.brand.name}
        </span>
        <span>Bütün hüquqlar qorunur</span>
      </div>
    </footer>
  );
}
