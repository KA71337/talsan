import Link from "next/link";
import { ProductCard } from "@/components/site/Cards";
import { PageHead } from "@/components/site/PageHead";
import { getCategories, getCategoriesWithCounts, getProducts, getSettings } from "@/lib/content";

export async function CatalogView({ categorySlug }: { categorySlug?: string }) {
  const [settings, products, categories, withCounts] = await Promise.all([
    getSettings(),
    getProducts(),
    getCategories(),
    getCategoriesWithCounts(),
  ]);
  const active = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;
  const list = active ? products.filter((p) => p.category === active.id) : products;
  const catById = new Map(categories.map((c) => [c.id, c]));

  return (
    <>
      <PageHead
        eyebrow="Kataloq"
        title={active ? active.name : settings.texts.catalogTitle}
        lead={active?.description || settings.texts.catalogText}
        crumbs={active ? [{ href: "/catalog", label: "Kataloq" }, { label: active.name }] : [{ label: "Kataloq" }]}
      />
      <section className="section" style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}>
        <div className="container">
          {withCounts.length > 1 && (
            <nav className="filters" aria-label="Kateqoriyalar">
              <Link href="/catalog" className="chip" aria-current={!active ? "page" : undefined}>
                Hamısı <span className="mono">{products.length}</span>
              </Link>
              {withCounts.map((c) => (
                <Link
                  key={c.id}
                  href={`/catalog/${c.slug}`}
                  className="chip"
                  aria-current={active?.id === c.id ? "page" : undefined}
                >
                  {c.name} <span className="mono">{c.count}</span>
                </Link>
              ))}
            </nav>
          )}
          {list.length > 0 ? (
            <div className="grid-cards">
              {list.map((p, i) => (
                <ProductCard key={p.id} product={p} category={catById.get(p.category)} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>Bu bölmədə hələ məhsul yoxdur.</p>
              <Link href="/contacts" className="btn btn--ghost btn--sm">
                Sorğu göndər
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
