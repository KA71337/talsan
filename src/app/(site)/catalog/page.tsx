import type { Metadata } from "next";
import { CatalogView } from "@/components/site/CatalogView";
import { getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.texts.catalogTitle,
    description: s.texts.catalogText,
    alternates: { canonical: "/catalog" },
    openGraph: { title: s.texts.catalogTitle, description: s.texts.catalogText, url: "/catalog" },
  };
}

export default function CatalogPage() {
  return <CatalogView />;
}
