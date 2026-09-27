"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/admin", label: "İdarəetmə paneli", icon: "other" as const },
  { label: "Məzmun" },
  { href: "/admin/products", label: "Məhsullar", icon: "generator" as const },
  { href: "/admin/categories", label: "Kateqoriyalar", icon: "other" as const },
  { href: "/admin/services", label: "Xidmətlər", icon: "repair" as const },
  { href: "/admin/images", label: "Şəkillər", icon: "image" as const },
  { label: "Sayt" },
  { href: "/admin/contacts", label: "Əlaqə məlumatları", icon: "phone" as const },
  { href: "/admin/texts", label: "Mətnlər", icon: "consult" as const },
  { href: "/admin/settings", label: "Parametrlər", icon: "regulator" as const },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setMenu(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    window.location.assign("/admin/login");
  }

  return (
    <div className="adm" data-menu={menu}>
      <div className="adm-top">
        <Logo className="adm-top__logo" sizes="80px" />
        <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu}>
          {menu ? "Bağla" : "Menyu"}
        </button>
      </div>
      <aside className="adm-side">
        <div className="adm-side__brand">
          <Logo className="adm-side__logo" sizes="120px" />
          <span>İdarəetmə paneli</span>
        </div>
        <nav className="adm-nav" aria-label="Admin menyu">
          {NAV.map((n, i) =>
            n.href ? (
              <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}>
                <Icon name={n.icon!} />
                {n.label}
              </Link>
            ) : (
              <div key={i} className="adm-nav__label">
                {n.label}
              </div>
            ),
          )}
        </nav>
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Icon name="arrow" /> Sayta bax
          </a>
          <button type="button" onClick={logout} disabled={busy}>
            <Icon name="arrow" /> Çıxış
          </button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
