import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/site/CatalogView";
import { getCategories, getSettings } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

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
  return pageMeta({ title: c.name, description, path: `/catalog/${c.slug}`, settings: s });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cats = await getCategories();
  if (!cats.some((c) => c.slug === category)) notFound();
  return <CatalogView categorySlug={category} />;
}
