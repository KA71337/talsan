import { NextResponse } from "next/server";
import { handle, noStore, parseJson, requireAdmin, revalidateContent } from "@/lib/api";
import { loadCategories } from "@/lib/content";
import { categoryInput } from "@/lib/schemas";
import { newId, slugify, uniqueSlug } from "@/lib/slug";
import { updateData } from "@/lib/storage";
import type { Category } from "@/lib/types";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return NextResponse.json(await loadCategories({ fresh: true }), noStore);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const input = await parseJson(req, categoryInput);
    const out: { item?: Category } = {};
    await updateData<Category[]>(
      "categories",
      [],
      (list) => {
        out.item = {
          id: newId("c"),
          slug: uniqueSlug(slugify(input.slug || input.name), list.map((c) => c.slug), "kateqoriya"),
          name: input.name,
          description: input.description,
          status: input.status,
        };
        return [...list, out.item];
      },
      `Add category: ${input.name}`,
    );
    revalidateContent();
    return NextResponse.json(out.item, { status: 201 });
  });
}
