import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/site/CatalogView";
import { getCategories, getSettings } from "@/lib/content";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const [cats, s] = await Promise.all([getCategories(), getSettings()]);
  const c = cats.find((x) => x.slug === category);
  if (!c) return {};
  const description = c.description || s.texts.catalogText;
  return {
    title: c.name,
    description,
    alternates: { canonical: `/catalog/${c.slug}` },
    openGraph: { title: c.name, description, url: `/catalog/${c.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cats = await getCategories();
  if (!cats.some((c) => c.slug === category)) notFound();
  return <CatalogView categorySlug={category} />;
}
