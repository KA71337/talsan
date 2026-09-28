"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND_NAME, NAV } from "@/config/site";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import type { ServiceIcon } from "@/lib/types";

type Props = {
  services: { slug: string; title: string; icon: ServiceIcon }[];
  categories: { slug: string; name: string }[];
  inquiryHref: string;
};

export function Header({ services, categories, inquiryHref }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open && ref.current) {
      const top = ref.current.getBoundingClientRect().bottom;
      ref.current.style.setProperty("--mobile-top", `${Math.round(top)}px`);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const menus = {
    services: {
      items: services.map((s) => ({ href: `/services#${s.slug}`, label: s.title, icon: s.icon })),
      all: { href: "/services", label: "Bütün xidmətlər" },
    },
    catalog: {
      items: categories.map((c) => ({ href: `/catalog/${c.slug}`, label: c.name, icon: undefined })),
      all: { href: "/catalog", label: "Bütün kataloq" },
    },
  };

  return (
    <header ref={ref} className="header" data-open={open} data-scrolled={scrolled}>
      <div className="container header__inner">
        <Link href="/" className="brand" aria-label={`${BRAND_NAME} — ana səhifə`}>
          <Logo className="brand__logo" priority sizes="(max-width: 640px) 120px, 160px" />
        </Link>

        <nav className="nav" aria-label="Əsas menyu">
          {NAV.map((item) => {
            const menu = item.menu ? menus[item.menu] : null;
            return (
              <div className="nav__item" key={item.href}>
                <Link
                  href={item.href}
                  className="nav__link"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                  {menu && menu.items.length > 0 && <Icon name="chevron" />}
                </Link>
                {menu && menu.items.length > 0 && (
                  <div className="dropdown">
                    {menu.items.map((m) => (
                      <Link key={m.href} href={m.href}>
                        {m.icon && <Icon name={m.icon} />}
                        {m.label}
                      </Link>
                    ))}
                    <div className="dropdown__all">
                      <Link href={menu.all.href}>
                        {menu.all.label}
                        <Icon name="arrow" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <a href={inquiryHref} className="btn btn--accent btn--sm header__cta" target="_blank" rel="noopener noreferrer">
          Əlaqə saxla
        </a>

        <button
          type="button"
          className="burger"
          aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
      </div>

      <div id="mobile-nav" className="mobile-nav" aria-hidden={!open} inert={!open}>
        {NAV.map((item) => {
          const menu = item.menu ? menus[item.menu] : null;
          if (menu && menu.items.length > 0) {
            return (
              <details key={item.href}>
                <summary>
                  {item.label}
                  <Icon name="chevron" />
                </summary>
                <div className="mobile-nav__sub">
                  {menu.items.map((m) => (
                    <Link key={m.href} href={m.href} onClick={() => setOpen(false)}>
                      {m.label}
                    </Link>
                  ))}
                  <Link href={menu.all.href} onClick={() => setOpen(false)}>
                    <strong>{menu.all.label}</strong>
                  </Link>
                </div>
              </details>
            );
          }
          return (
            <Link key={item.href} href={item.href} className="mobile-nav__link" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          );
        })}
        <div className="mobile-nav__actions">
          <a
            href={inquiryHref}
            className="btn btn--accent btn--block"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Əlaqə saxla
          </a>
        </div>
      </div>
    </header>
  );
}
