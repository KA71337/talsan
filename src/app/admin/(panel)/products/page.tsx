import type { Metadata } from "next";
import Link from "next/link";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { loadCategories, loadProducts } from "@/lib/content";

export const metadata: Metadata = { title: "Məhsullar" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [products, categories, sp] = await Promise.all([
    loadProducts({ fresh: true }),
    loadCategories({ fresh: true }),
    searchParams,
  ]);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Məhsullar</h1>
          <p>Kataloqdakı avadanlıqlar. Qiymət boş qalsa, saytda “Qiymət üçün əlaqə saxlayın” göstərilir.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn--accent">
          Məhsul əlavə et
        </Link>
      </div>
      {sp.saved && (
        <p className="adm-alert adm-alert--ok" style={{ marginBottom: 16 }}>
          Yadda saxlanıldı.
        </p>
      )}
      <ProductsTable products={products} categories={categories} />
    </>
  );
}
