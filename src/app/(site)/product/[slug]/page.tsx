import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, CURRENCY } from "@/config/site";
import { Icon } from "@/components/Icon";
import { ProductCard } from "@/components/site/Cards";
import { Gallery } from "@/components/site/Gallery";
import { PageHead } from "@/components/site/PageHead";
import { getCategories, getProductBySlug, getProducts, getSettings } from "@/lib/content";
import { formatPrice, telHref, whatsappHref } from "@/lib/format";
import { jsonLd } from "@/lib/jsonld";
import { ORG_ID, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const s = await getSettings();
  const description = p.description.slice(0, 160) || s.texts.catalogText;
  return pageMeta({ title: p.title, description, path: `/product/${p.slug}`, image: p.images[0], settings: s });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, categories, settings, all] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
    getSettings(),
    getProducts(),
  ]);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.category);
  const price = formatPrice(product.price);
  const message = `Salam! "${product.title}" barədə məlumat almaq istəyirəm.`;
  const wa = whatsappHref(settings.contact.whatsapp, message);
  const tel = telHref(settings.contact.phone);
  const related = all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: product.images.map((i) => absoluteUrl(i)),
    url: absoluteUrl(`/product/${product.slug}`),
    category: category?.name,
    ...(product.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: CURRENCY,
            url: absoluteUrl(`/product/${product.slug}`),
            seller: { "@id": ORG_ID },
            ...(product.stock !== null
              ? { availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
              : {}),
          },
        }
      : {}),
  };

  return (
    <>
      <PageHead
        title={product.title}
        crumbs={[
          { href: "/catalog", label: "Kataloq" },
          ...(category ? [{ href: `/catalog/${category.slug}`, label: category.name }] : []),
          { label: product.title },
        ]}
      />
      <section className="section" style={{ paddingTop: "clamp(32px, 4vw, 56px)" }}>
        <div className="container product">
          <Gallery images={product.images} title={product.title} />
          <div className="product__info">
            {category && <span className="eyebrow">{category.name}</span>}
            <div>
              {price ? (
                <span className="price" style={{ fontSize: 28 }}>
                  {price}
                </span>
              ) : (
                <span className="price--ask" style={{ fontSize: 16 }}>
                  Qiymət üçün əlaqə saxlayın
                </span>
              )}
            </div>
            {product.description && <p className="prose">{product.description}</p>}
            <dl className="product__meta">
              {category && (
                <div>
                  <dt>Kateqoriya</dt>
                  <dd>{category.name}</dd>
                </div>
              )}
              {product.stock !== null && (
                <div>
                  <dt>Mövcudluq</dt>
                  <dd>
                    <span className={`stock-dot ${product.stock > 0 ? "" : "stock-dot--out"}`} />
                    {product.stock > 0 ? "Mövcuddur" : "Sifarişlə"}
                  </dd>
                </div>
              )}
            </dl>
            <div className="product__actions">
              {wa && (
                <a href={wa} className="btn btn--accent btn--block" target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" /> WhatsApp ilə soruş
                </a>
              )}
              {tel && (
                <a href={tel} className="btn btn--ghost btn--block">
                  <Icon name="phone" /> Zəng et
                </a>
              )}
              <Link
                href={`/contacts?mehsul=${encodeURIComponent(product.slug)}`}
                className={wa || tel ? "btn btn--ghost btn--block" : "btn btn--accent btn--block"}
              >
                Sorğu göndər <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--surface" data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="section-head__title">
                <span className="eyebrow">Oxşar</span>
                <h2 className="h2">Bu kateqoriyadan</h2>
              </div>
            </div>
            <div className="grid-cards">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    </>
  );
}
