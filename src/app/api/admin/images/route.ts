import { NextResponse } from "next/server";
import { handle, HttpError, noStore, requireAdmin } from "@/lib/api";
import { clientImages, collectUsedImages, UPLOAD_PREFIX } from "@/lib/images";
import { UPLOAD_FILE_RE } from "@/lib/schemas";
import { deleteUpload, listUploads } from "@/lib/storage";
import type { LibraryImage } from "@/lib/types";

export async function GET() {
  return handle(async () => {
    await requireAdmin();
    const [uploads, used] = await Promise.all([listUploads(), collectUsedImages()]);
    const items: LibraryImage[] = [
      ...uploads
        .filter((n) => UPLOAD_FILE_RE.test(n))
        .sort()
        .reverse()
        .map((n) => ({ src: `${UPLOAD_PREFIX}${n}`, label: "Yüklənmiş şəkil", kind: "upload" as const, usedBy: [] })),
      ...clientImages.map((i) => ({ src: i.src, label: i.label, kind: "client" as const, usedBy: [] })),
    ].map((i) => ({ ...i, usedBy: used.get(i.src) ?? [] }));
    return NextResponse.json(items, noStore);
  });
}

/** Delete an uploaded image (only if unused). Client photos shipped with the site cannot be deleted here. */
export async function DELETE(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const name = new URL(req.url).searchParams.get("name") ?? "";
    if (!UPLOAD_FILE_RE.test(name)) throw new HttpError(400, "Fayl adı yanlışdır");
    const used = (await collectUsedImages()).get(`${UPLOAD_PREFIX}${name}`);
    if (used?.length) throw new HttpError(409, `Şəkil istifadə olunur: ${used.join(", ")}`);
    await deleteUpload(name);
    return NextResponse.json({ ok: true });
  });
}
