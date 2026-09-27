import type { Metadata } from "next";
import { CatalogView } from "@/components/site/CatalogView";
import { getSettings } from "@/lib/content";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMeta({ title: s.texts.catalogTitle, description: s.texts.catalogText, path: "/catalog", settings: s });
}

export default function CatalogPage() {
  return <CatalogView />;
}
