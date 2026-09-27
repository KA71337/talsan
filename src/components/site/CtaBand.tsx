import Link from "next/link";
import { Icon } from "@/components/Icon";
import { contactChannels } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function CtaBand({ settings }: { settings: Settings }) {
  const { tel, wa } = contactChannels(settings);
  return (
    <section className="section" data-reveal>
      <div className="container">
        <div className="cta-band">
          <div style={{ display: "grid", gap: 12 }}>
            <span className="eyebrow">Əlaqə</span>
            <h2 className="h2">Avadanlıq seçimində və ya təmirdə kömək lazımdır?</h2>
            <p className="lead">Tələbatınızı yazın — məlumatı dəqiqləşdirib sizinlə əlaqə saxlayaq.</p>
          </div>
          <div className="cta-band__actions">
            {wa && (
              <a href={wa} className="btn btn--accent" target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" /> WhatsApp
              </a>
            )}
            {tel && (
              <a href={tel} className="btn btn--ghost">
                <Icon name="phone" /> Zəng et
              </a>
            )}
            <Link href="/contacts" className={wa || tel ? "btn btn--ghost" : "btn btn--accent"}>
              Sorğu göndər <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
