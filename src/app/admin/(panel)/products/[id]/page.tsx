import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { loadCategories, loadProducts } from "@/lib/content";

export const metadata: Metadata = { title: "Redaktə et" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [products, categories] = await Promise.all([loadProducts({ fresh: true }), loadCategories({ fresh: true })]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Redaktə et: {product.title}</h1>
          <p>
            <Link href="/admin/products">← Məhsullar</Link>
            {product.status === "active" && (
              <>
                {" · "}
                <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                  Saytda bax ↗
                </a>
              </>
            )}
          </p>
        </div>
      </div>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
