import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { loadCategories, loadProducts } from "@/lib/content";

export const metadata: Metadata = { title: "Kateqoriyalar" };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([loadCategories({ fresh: true }), loadProducts({ fresh: true })]);
  const rows = categories.map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length }));
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Kateqoriyalar</h1>
          <p>Boş kateqoriyalar saytdakı filtrdə göstərilmir. Məhsulu olan kateqoriyanı silmək olmaz.</p>
        </div>
      </div>
      <CategoriesManager categories={rows} />
    </>
  );
}
