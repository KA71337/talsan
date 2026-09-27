import { NextResponse } from "next/server";
import { handle, HttpError, noStore, parseJson, requireAdmin, revalidateContent } from "@/lib/api";
import { loadCategories, loadProducts } from "@/lib/content";
import { assertImagesExist, cleanupUploads } from "@/lib/images";
import { productInput } from "@/lib/schemas";
import { slugify, uniqueSlug } from "@/lib/slug";
import { updateData } from "@/lib/storage";
import type { Product } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

async function findOrThrow(id: string) {
  const item = (await loadProducts({ fresh: true })).find((p) => p.id === id);
  if (!item) throw new HttpError(404, "Məhsul tapılmadı");
  return item;
}

export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    return NextResponse.json(await findOrThrow((await params).id), noStore);
  });
}

export async function PUT(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const input = await parseJson(req, productInput);
    await findOrThrow(id);
    const cats = await loadCategories({ fresh: true });
    if (!cats.some((c) => c.id === input.category)) throw new HttpError(400, "Kateqoriya tapılmadı");
    await assertImagesExist(input.images);

    const out: { item?: Product; removed: string[] } = { removed: [] };
    await updateData<Product[]>(
      "products",
      [],
      (list) =>
        list.map((p) => {
          if (p.id !== id) return p;
          const others = list.filter((o) => o.id !== id).map((o) => o.slug);
          out.removed = p.images.filter((i) => !input.images.includes(i));
          out.item = {
            ...p,
            title: input.title,
            slug: uniqueSlug(slugify(input.slug || input.title), others, "mehsul"),
            description: input.description,
            price: input.price,
            category: input.category,
            images: input.images,
            stock: input.stock,
            status: input.status,
            updatedAt: new Date().toISOString(),
          };
          return out.item;
        }),
      `Update product: ${input.title}`,
    );
    if (!out.item) throw new HttpError(404, "Məhsul tapılmadı");
    await cleanupUploads(out.removed);
    revalidateContent();
    return NextResponse.json(out.item);
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const existing = await findOrThrow(id);
    await updateData<Product[]>("products", [], (list) => list.filter((p) => p.id !== id), `Delete product: ${existing.title}`);
    await cleanupUploads(existing.images);
    revalidateContent();
    return NextResponse.json({ ok: true });
  });
}
