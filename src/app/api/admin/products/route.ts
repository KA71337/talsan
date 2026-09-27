import { NextResponse } from "next/server";
import { handle, HttpError, noStore, parseJson, requireAdmin, revalidateContent } from "@/lib/api";
import { loadCategories, loadProducts } from "@/lib/content";
import { assertImagesExist } from "@/lib/images";
import { productInput } from "@/lib/schemas";
import { newId, slugify, uniqueSlug } from "@/lib/slug";
import { updateData } from "@/lib/storage";
import type { Product } from "@/lib/types";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return NextResponse.json(await loadProducts({ fresh: true }), noStore);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const input = await parseJson(req, productInput);
    const cats = await loadCategories({ fresh: true });
    if (!cats.some((c) => c.id === input.category)) throw new HttpError(400, "Kateqoriya tapılmadı");
    await assertImagesExist(input.images);

    const now = new Date().toISOString();
    let created!: Product;
    await updateData<Product[]>(
      "products",
      [],
      (list) => {
        created = {
          id: newId("p"),
          slug: uniqueSlug(slugify(input.slug || input.title), list.map((p) => p.slug), "mehsul"),
          title: input.title,
          description: input.description,
          price: input.price,
          category: input.category,
          images: input.images,
          stock: input.stock,
          status: input.status,
          createdAt: now,
          updatedAt: now,
        };
        return [created, ...list];
      },
      `Add product: ${input.title}`,
    );
    revalidateContent();
    return NextResponse.json(created, { status: 201 });
  });
}
