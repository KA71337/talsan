import { NextResponse } from "next/server";
import { handle, noStore, parseJson, requireAdmin, revalidateContent } from "@/lib/api";
import { loadServices } from "@/lib/content";
import { assertImagesExist } from "@/lib/images";
import { serviceInput } from "@/lib/schemas";
import { newId, slugify, uniqueSlug } from "@/lib/slug";
import { updateData } from "@/lib/storage";
import type { Service } from "@/lib/types";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return NextResponse.json(await loadServices({ fresh: true }), noStore);
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const input = await parseJson(req, serviceInput);
    if (input.image) await assertImagesExist([input.image]);
    const now = new Date().toISOString();
    const out: { item?: Service } = {};
    await updateData<Service[]>(
      "services",
      [],
      (list) => {
        out.item = {
          id: newId("s"),
          slug: uniqueSlug(slugify(input.slug || input.title), list.map((s) => s.slug), "xidmet"),
          title: input.title,
          summary: input.summary,
          description: input.description,
          icon: input.icon,
          image: input.image,
          status: input.status,
          createdAt: now,
          updatedAt: now,
        };
        return [...list, out.item];
      },
      `Add service: ${input.title}`,
    );
    revalidateContent();
    return NextResponse.json(out.item, { status: 201 });
  });
}
