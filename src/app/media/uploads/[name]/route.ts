import { UPLOAD_FILE_RE } from "@/lib/schemas";
import { getUpload } from "@/lib/storage";

type Ctx = { params: Promise<{ name: string }> };

/**
 * Serves uploaded images from content storage. Works with private repositories because the
 * GitHub token is used server-side only. File names are unique and immutable → long CDN cache.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const { name } = await params;
  if (!UPLOAD_FILE_RE.test(name)) return new Response("Not found", { status: 404 });
  try {
    const data = await getUpload(name);
    if (!data) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
