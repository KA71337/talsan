import { NextResponse } from "next/server";
import { handle, HttpError, parseJson, requireAdmin, revalidateContent } from "@/lib/api";
import { loadCategories, loadProducts } from "@/lib/content";
import { categoryInput } from "@/lib/schemas";
import { slugify, uniqueSlug } from "@/lib/slug";
import { updateData } from "@/lib/storage";
import type { Category } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

async function findOrThrow(id: string) {
  const item = (await loadCategories({ fresh: true })).find((c) => c.id === id);
  if (!item) throw new HttpError(404, "Kateqoriya tapılmadı");
  return item;
}

export async function PUT(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const input = await parseJson(req, categoryInput);
    await findOrThrow(id);
    const out: { item?: Category } = {};
    await updateData<Category[]>(
      "categories",
      [],
      (list) =>
        list.map((c) => {
          if (c.id !== id) return c;
          const others = list.filter((o) => o.id !== id).map((o) => o.slug);
          out.item = { ...c, ...input, slug: uniqueSlug(slugify(input.slug || input.name), others, "kateqoriya") };
          return out.item;
        }),
      `Update category: ${input.name}`,
    );
    revalidateContent();
    return NextResponse.json(out.item);
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const existing = await findOrThrow(id);
    const inUse = (await loadProducts({ fresh: true })).filter((p) => p.category === id).length;
    if (inUse > 0) {
      throw new HttpError(409, `Bu kateqoriyada ${inUse} məhsul var. Əvvəlcə məhsulları başqa kateqoriyaya keçirin.`);
    }
    await updateData<Category[]>("categories", [], (list) => list.filter((c) => c.id !== id), `Delete category: ${existing.name}`);
    revalidateContent();
    return NextResponse.json({ ok: true });
  });
}
