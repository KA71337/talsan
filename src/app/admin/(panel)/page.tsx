import Link from "next/link";
import { BRAND_PLACEHOLDER } from "@/config/site";
import { loadCategories, loadProducts, loadServices, loadSettings } from "@/lib/content";
import { storageInfo } from "@/lib/storage";

export default async function DashboardPage() {
  const [products, services, categories, settings] = await Promise.all([
    loadProducts({ fresh: true }),
    loadServices({ fresh: true }),
    loadCategories({ fresh: true }),
    loadSettings({ fresh: true }),
  ]);
  const storage = storageInfo();
  const c = settings.contact;

  const checks = [
    { ok: settings.brand.name !== BRAND_PLACEHOLDER, text: "Brend adı daxil edilib", href: "/admin/settings" },
    { ok: !!c.phone, text: "Telefon nömrəsi", href: "/admin/contacts" },
    { ok: !!c.whatsapp, text: "WhatsApp nömrəsi (sorğu forması WhatsApp ilə işləyir)", href: "/admin/contacts" },
    { ok: !!c.email, text: "E-poçt (istəyə bağlı)", href: "/admin/contacts" },
    {
      ok: products.every((p) => !/·\s*\d+$/.test(p.title)),
      text: "Məhsul adları dəqiqləşdirilib (nümunə adlar: “Generator · 01”)",
      href: "/admin/products",
    },
    { ok: storage.kind === "github", text: "GitHub storage qoşulub", href: "/admin/settings" },
  ];

  const stats = [
    { label: "Məhsullar", value: products.length, sub: `${products.filter((p) => p.status === "active").length} aktiv`, href: "/admin/products" },
    { label: "Xidmətlər", value: services.length, sub: `${services.filter((s) => s.status === "active").length} aktiv`, href: "/admin/services" },
    { label: "Kateqoriyalar", value: categories.length, sub: "", href: "/admin/categories" },
    { label: "Gizli məhsullar", value: products.filter((p) => p.status === "hidden").length, sub: "", href: "/admin/products" },
  ];

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>İdarəetmə paneli</h1>
          <p>Saytın məzmununu buradan idarə edin.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn--accent">
          Məhsul əlavə et
        </Link>
      </div>

      <div className="adm-stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="adm-stat">
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            {s.sub && <span>{s.sub}</span>}
          </Link>
        ))}
      </div>

      <div className="adm-card">
        <h2>Yoxlama siyahısı</h2>
        <ul className="adm-checklist">
          {checks.map((ch) => (
            <li key={ch.text}>
              <span className={`dot ${ch.ok ? "dot--ok" : ""}`} />
              <span>
                {ch.text} —{" "}
                {ch.ok ? (
                  <span className="muted">hazırdır</span>
                ) : (
                  <Link href={ch.href} style={{ textDecoration: "underline" }}>
                    tamamlayın
                  </Link>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="adm-card">
        <h2>Tez keçidlər</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link className="btn btn--ghost btn--sm" href="/admin/services/new">
            Xidmət əlavə et
          </Link>
          <Link className="btn btn--ghost btn--sm" href="/admin/contacts">
            Əlaqə məlumatları
          </Link>
          <Link className="btn btn--ghost btn--sm" href="/admin/texts">
            Mətnlər
          </Link>
          <Link className="btn btn--ghost btn--sm" href="/admin/images">
            Şəkillər
          </Link>
        </div>
      </div>
    </>
  );
}
