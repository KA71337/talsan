import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { loadCategories } from "@/lib/content";

export const metadata: Metadata = { title: "Məhsul əlavə et" };

export default async function NewProductPage() {
  const categories = await loadCategories({ fresh: true });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Məhsul əlavə et</h1>
          <p>
            <Link href="/admin/products">← Məhsullar</Link>
          </p>
        </div>
      </div>
      {categories.length === 0 ? (
        <p className="adm-alert adm-alert--info">
          Əvvəlcə <Link href="/admin/categories">kateqoriya</Link> əlavə edin.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </>
  );
}
