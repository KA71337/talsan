export type Status = "active" | "hidden";

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** null = price not provided → "Qiymət üçün əlaqə saxlayın" */
  price: number | null;
  /** category id */
  category: string;
  /** first image is the main image */
  images: string[];
  /** null = not tracked */
  stock: number | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export type ServiceIcon =
  | "generator"
  | "stabilizer"
  | "repair"
  | "regulator"
  | "consult"
  | "bolt"
  | "other";

export interface Service {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon: ServiceIcon;
  image: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: Status;
}

export interface LibraryImage {
  src: string;
  label: string;
  kind: "client" | "upload";
  usedBy: string[];
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  telegram: string;
  youtube: string;
  tiktok: string;
}

export interface Settings {
  brand: {
    name: string;
    tagline: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    socials: SocialLinks;
  };
  texts: {
    heroEyebrow: string;
    heroTitle: string;
    heroText: string;
    heroImage: string;
    heroImageSecondary: string;
    servicesTitle: string;
    servicesText: string;
    repairTitle: string;
    repairText: string;
    repairImage: string;
    catalogTitle: string;
    catalogText: string;
    aboutTitle: string;
    aboutText: string;
    aboutImage: string;
    contactTitle: string;
    contactText: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
}
