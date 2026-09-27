import { z } from "zod";

/** Only images we host ourselves are allowed (no arbitrary external URLs → no broken/hostile images). */
export const IMAGE_PATH_RE = /^\/(images\/client\/[a-z0-9-]+\.webp|media\/uploads\/[a-z0-9-]+\.webp)$/;
export const UPLOAD_FILE_RE = /^[a-z0-9-]+\.webp$/;

const text = (max: number) => z.string().trim().max(max, `Maksimum ${max} simvol`);
const required = (max: number) => text(max).min(1, "Bu sahə mütləqdir");
const imagePath = z.string().regex(IMAGE_PATH_RE, "Şəkil yolu yanlışdır");
const optionalImage = z.union([z.literal(""), imagePath]);
const status = z.enum(["active", "hidden"]);
const slug = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Yalnız latın hərfləri, rəqəm və tire")
  .or(z.literal(""));

const httpsUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s<>"']+$/i.test(v), "Link https:// ilə başlamalıdır");

export const productInput = z.object({
  title: required(140),
  slug: slug.optional(),
  description: text(4000),
  price: z.number().nonnegative("Qiymət mənfi ola bilməz").max(100_000_000).nullable(),
  category: required(60),
  images: z.array(imagePath).max(12, "Maksimum 12 şəkil"),
  stock: z.number().int("Tam ədəd olmalıdır").nonnegative().max(1_000_000).nullable(),
  status,
});
export type ProductInput = z.infer<typeof productInput>;

export const serviceInput = z.object({
  title: required(120),
  slug: slug.optional(),
  summary: text(300),
  description: text(4000),
  icon: z.enum(["generator", "stabilizer", "repair", "regulator", "consult", "bolt", "other"]),
  image: imagePath.nullable(),
  status,
});
export type ServiceInput = z.infer<typeof serviceInput>;

export const categoryInput = z.object({
  name: required(60),
  slug: slug.optional(),
  description: text(300),
  status,
});
export type CategoryInput = z.infer<typeof categoryInput>;

const phone = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === "" || /^\+?[0-9 ()-]{5,}$/.test(v), "Nömrə formatı yanlışdır");

export const settingsInput = z.object({
  brand: z.object({ name: required(60), tagline: text(120) }),
  contact: z.object({
    phone,
    whatsapp: phone,
    email: z
      .string()
      .trim()
      .max(120)
      .refine((v) => v === "" || /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v), "E-poçt formatı yanlışdır"),
    address: text(200),
    hours: text(200),
    socials: z.object({
      instagram: httpsUrl,
      facebook: httpsUrl,
      telegram: httpsUrl,
      youtube: httpsUrl,
      tiktok: httpsUrl,
    }),
  }),
  texts: z.object({
    heroEyebrow: text(80),
    heroTitle: required(120),
    heroText: text(400),
    heroImage: optionalImage,
    heroImageSecondary: optionalImage,
    servicesTitle: required(80),
    servicesText: text(400),
    repairTitle: text(120),
    repairText: text(800),
    repairImage: optionalImage,
    catalogTitle: required(80),
    catalogText: text(400),
    aboutTitle: required(120),
    aboutText: text(3000),
    aboutImage: optionalImage,
    contactTitle: required(120),
    contactText: text(400),
  }),
  seo: z.object({
    title: required(70),
    description: text(170),
    ogImage: optionalImage,
  }),
});

export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Məlumat yanlışdır";
  const field = first.path.join(".");
  return field ? `${field}: ${first.message}` : first.message;
}
