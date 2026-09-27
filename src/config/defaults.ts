import type { Settings } from "@/lib/types";
import { BRAND_NAME } from "./site";

/**
 * Fallback settings. The live values are stored in data/settings.json and edited in the admin
 * panel. Contact fields are intentionally empty: the client has not provided them yet, and
 * empty channels are simply not rendered on the public site.
 */
export const DEFAULT_SETTINGS: Settings = {
  brand: {
    name: BRAND_NAME,
    tagline: "Generator, stabilizator və tənzimləyicilər",
  },
  contact: {
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    hours: "",
    socials: { instagram: "", facebook: "", telegram: "", youtube: "", tiktok: "" },
  },
  texts: {
    heroEyebrow: "Generator · Stabilizator · Tənzimləyici",
    heroTitle: "Enerji avadanlığının satışı və texniki servisi",
    heroText:
      "Generator, stabilizator və tənzimləyicilərin satışı, stabilizator və tənzimləyicilərin təmiri. Avadanlığın seçimində texniki məsləhət.",
    heroImage: "/images/client/stabilizer-04.webp",
    heroImageSecondary: "/images/client/generator-01.webp",
    servicesTitle: "Xidmətlər",
    servicesText: "Avadanlığın seçimi, satışı və təmiri üzrə əsas istiqamətlər.",
    repairTitle: "Stabilizator və tənzimləyicilərin təmiri",
    repairText:
      "Nasaz avadanlıq barədə məlumat göndərin: model, problemin qısa təsviri və mümkünsə foto. Təmir imkanı və şərtlər əlaqə zamanı dəqiqləşdirilir.",
    repairImage: "/images/client/onsite-05.webp",
    catalogTitle: "Avadanlıq kataloqu",
    catalogText: "Mövcud avadanlıqlar. Qiymət və texniki göstəricilər üçün əlaqə saxlayın.",
    aboutTitle: "Fəaliyyətimiz haqqında",
    aboutText:
      "Generator, stabilizator və tənzimləyicilərin satışı, həmçinin stabilizator və tənzimləyicilərin təmiri ilə məşğul oluruq. Avadanlığın seçimi və istismarı ilə bağlı texniki məsləhət veririk.\n\nMəhsul və xidmət çeşidi gələcəkdə genişlənə bilər. Ətraflı məlumat üçün bizimlə əlaqə saxlayın.",
    aboutImage: "/images/client/onsite-02.webp",
    contactTitle: "Sorğunuzu göndərin",
    contactText: "Avadanlıq, qiymət və ya təmir barədə yazın — sorğunuzu dəqiqləşdirib cavab verək.",
  },
  seo: {
    title: "Generator, stabilizator və tənzimləyici satışı və təmiri",
    description:
      "Generator, stabilizator və tənzimləyicilərin satışı, stabilizator və tənzimləyicilərin təmiri, avadanlıq üzrə texniki məsləhət.",
    // Empty → the branded TalSan Open Graph image (public/brand/talsan-og.png) is used.
    ogImage: "",
  },
};
