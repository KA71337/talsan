import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, HttpError, noStore, parseJson, requireAdmin, revalidateContent } from "@/lib/api";
import { loadServices } from "@/lib/content";
import { assertImagesExist, cleanupUploads } from "@/lib/images";
import { serviceInput } from "@/lib/schemas";
import { slugify, uniqueSlug } from "@/lib/slug";
import { updateData } from "@/lib/storage";
import type { Service } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

async function findOrThrow(id: string) {
  const item = (await loadServices({ fresh: true })).find((s) => s.id === id);
  if (!item) throw new HttpError(404, "Xidmət tapılmadı");
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
    const input = await parseJson(req, serviceInput);
    const existing = await findOrThrow(id);
    if (input.image) await assertImagesExist([input.image]);
    const out: { item?: Service } = {};
    await updateData<Service[]>(
      "services",
      [],
      (list) =>
        list.map((s) => {
          if (s.id !== id) return s;
          const others = list.filter((o) => o.id !== id).map((o) => o.slug);
          out.item = {
            ...s,
            ...input,
            slug: uniqueSlug(slugify(input.slug || input.title), others, "xidmet"),
            updatedAt: new Date().toISOString(),
          };
          return out.item;
        }),
      `Update service: ${input.title}`,
    );
    if (existing.image && existing.image !== input.image) await cleanupUploads([existing.image]);
    revalidateContent();
    return NextResponse.json(out.item);
  });
}

/** Reorder: { direction: "up" | "down" } */
export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const { direction } = await parseJson(req, z.object({ direction: z.enum(["up", "down"]) }));
    await findOrThrow(id);
    await updateData<Service[]>(
      "services",
      [],
      (list) => {
        const i = list.findIndex((s) => s.id === id);
        const j = direction === "up" ? i - 1 : i + 1;
        if (i < 0 || j < 0 || j >= list.length) return list;
        [list[i], list[j]] = [list[j], list[i]];
        return list;
      },
      `Reorder services`,
    );
    revalidateContent();
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const existing = await findOrThrow(id);
    await updateData<Service[]>("services", [], (list) => list.filter((s) => s.id !== id), `Delete service: ${existing.title}`);
    if (existing.image) await cleanupUploads([existing.image]);
    revalidateContent();
    return NextResponse.json({ ok: true });
  });
}
