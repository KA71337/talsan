import { NextResponse } from "next/server";
import { handle, HttpError, requireAdmin } from "@/lib/api";
import { MAX_UPLOAD_BYTES, processUpload, UPLOAD_PREFIX, uploadName } from "@/lib/images";
import { putUpload } from "@/lib/storage";

export async function POST(req: Request) {
  return handle(async () => {
    await requireAdmin();
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_UPLOAD_BYTES + 64 * 1024) throw new HttpError(413, "Fayl çox böyükdür (maksimum 4 MB)");

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new HttpError(400, "Fayl göndərilməyib");
    }
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Fayl göndərilməyib");

    const { data, width, height } = await processUpload(Buffer.from(await file.arrayBuffer()));
    const name = uploadName();
    await putUpload(name, data);
    return NextResponse.json({ src: `${UPLOAD_PREFIX}${name}`, width, height }, { status: 201 });
  });
}
