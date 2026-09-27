import { NextResponse } from "next/server";
import { handle, noStore, parseJson, requireAdmin, revalidateContent } from "@/lib/api";
import { loadSettings } from "@/lib/content";
import { assertImagesExist, cleanupUploads } from "@/lib/images";
import { settingsInput } from "@/lib/schemas";
import { updateData } from "@/lib/storage";
import type { Settings } from "@/lib/types";

const imageFields = (s: Settings) =>
  [s.texts.heroImage, s.texts.heroImageSecondary, s.texts.repairImage, s.texts.aboutImage, s.seo.ogImage].filter(Boolean);

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    return NextResponse.json(await loadSettings({ fresh: true }), noStore);
  });
}

export async function PUT(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const input = await parseJson(req, settingsInput);
    const before = await loadSettings({ fresh: true });
    await assertImagesExist(imageFields(input));
    const saved = await updateData<Settings>("settings", before, () => input, "Update site settings");
    await cleanupUploads(imageFields(before).filter((i) => !imageFields(input).includes(i)));
    revalidateContent();
    return NextResponse.json(saved);
  });
}
