import "server-only";
import sharp, { type Metadata } from "sharp";
import clientImages from "@/config/client-images.json";
import { IMAGE_PATH_RE } from "./schemas";
import { deleteUpload, uploadExists } from "./storage";
import { loadProducts, loadServices, loadSettings } from "./content";
import { HttpError } from "./api";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel request body limit is 4.5 MB
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "heif"]);
const CLIENT_IMAGE_SET = new Set(clientImages.map((i) => i.src));
export const UPLOAD_PREFIX = "/media/uploads/";

/**
 * Validates by decoding the actual bytes (not the declared MIME type), re-encodes to WebP,
 * applies EXIF rotation, strips metadata and limits dimensions. Output is always a clean image.
 */
export async function processUpload(bytes: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  if (bytes.length === 0) throw new HttpError(400, "Fayl boşdur");
  if (bytes.length > MAX_UPLOAD_BYTES) throw new HttpError(413, "Fayl çox böyükdür (maksimum 4 MB)");
  let meta: Metadata;
  try {
    meta = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new HttpError(415, "Fayl şəkil deyil və ya zədələnib");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format))
    throw new HttpError(415, "Yalnız JPG, PNG, WEBP, AVIF formatları qəbul olunur");
  if (!meta.width || !meta.height || meta.width < 200 || meta.height < 200)
    throw new HttpError(422, "Şəkil çox kiçikdir (minimum 200×200 px)");

  const { data, info } = await sharp(bytes, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

export function uploadName(): string {
  const rnd = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${Date.now().toString(36)}-${rnd}.webp`;
}

/** Make sure every referenced image actually exists → no broken images on the site. */
export async function assertImagesExist(paths: string[]) {
  for (const p of paths) {
    if (!IMAGE_PATH_RE.test(p)) throw new HttpError(400, `Şəkil yolu yanlışdır: ${p}`);
    if (p.startsWith("/images/client/")) {
      if (!CLIENT_IMAGE_SET.has(p)) throw new HttpError(400, `Şəkil tapılmadı: ${p}`);
    } else if (!(await uploadExists(p.slice(UPLOAD_PREFIX.length)))) {
      throw new HttpError(400, `Şəkil tapılmadı: ${p}`);
    }
  }
}

export async function collectUsedImages(): Promise<Map<string, string[]>> {
  const [products, services, settings] = await Promise.all([
    loadProducts({ fresh: true }),
    loadServices({ fresh: true }),
    loadSettings({ fresh: true }),
  ]);
  const used = new Map<string, string[]>();
  const add = (src: string | null | undefined, where: string) => {
    if (!src) return;
    used.set(src, [...(used.get(src) ?? []), where]);
  };
  products.forEach((p) => p.images.forEach((i) => add(i, `Məhsul: ${p.title}`)));
  services.forEach((s) => add(s.image, `Xidmət: ${s.title}`));
  const t = settings.texts;
  add(t.heroImage, "Ana səhifə (hero)");
  add(t.heroImageSecondary, "Ana səhifə (hero, kiçik)");
  add(t.repairImage, "Ana səhifə (təmir bloku)");
  add(t.aboutImage, "Haqqımızda");
  add(settings.seo.ogImage, "SEO / Open Graph");
  return used;
}

/** Delete uploads that are no longer referenced anywhere (called after saves/deletes). */
export async function cleanupUploads(candidates: string[]) {
  const uploads = candidates.filter((c) => c.startsWith(UPLOAD_PREFIX));
  if (uploads.length === 0) return;
  const used = await collectUsedImages();
  for (const src of uploads) {
    if (!used.has(src)) {
      try {
        await deleteUpload(src.slice(UPLOAD_PREFIX.length));
      } catch (e) {
        console.error("[images] cleanup failed", src, e);
      }
    }
  }
}

export { clientImages };
