import "server-only";
import { cache } from "react";
import { DEFAULT_SETTINGS } from "@/config/defaults";
import { BRAND_NAME } from "@/config/site";
import { readData } from "./storage";
import type { Category, Product, Service, Settings } from "./types";

const populated = (value: string | undefined, fallback: string) => value?.trim() || fallback;

function mergeSettings(stored: Partial<Settings> | null): Settings {
  const s = stored ?? {};
  const storedContact = s.contact;
  return {
    // The brand name is fixed ("TalSan"); stored values can't override it.
    brand: { ...DEFAULT_SETTINGS.brand, ...s.brand, name: BRAND_NAME },
    contact: {
      ...DEFAULT_SETTINGS.contact,
      ...storedContact,
      phone: populated(storedContact?.phone, DEFAULT_SETTINGS.contact.phone),
      whatsapp: populated(storedContact?.whatsapp, DEFAULT_SETTINGS.contact.whatsapp),
      address: populated(storedContact?.address, DEFAULT_SETTINGS.contact.address),
      hours: populated(storedContact?.hours, DEFAULT_SETTINGS.contact.hours),
      socials: {
        ...DEFAULT_SETTINGS.contact.socials,
        ...storedContact?.socials,
        telegram: populated(storedContact?.socials?.telegram, DEFAULT_SETTINGS.contact.socials.telegram),
      },
    },
    texts: { ...DEFAULT_SETTINGS.texts, ...s.texts },
    seo: { ...DEFAULT_SETTINGS.seo, ...s.seo },
  };
}

type Opts = { fresh?: boolean };

export async function loadSettings(opts: Opts = {}) {
  return mergeSettings(await readData<Partial<Settings>>("settings", opts));
}
export async function loadProducts(opts: Opts = {}) {
  return (await readData<Product[]>("products", opts)) ?? [];
}
export async function loadServices(opts: Opts = {}) {
  return (await readData<Service[]>("services", opts)) ?? [];
}
export async function loadCategories(opts: Opts = {}) {
  return (await readData<Category[]>("categories", opts)) ?? [];
}

/* ---------- Public (cached, visible items only) ---------- */

export const getSettings = cache(() => loadSettings());

export const getCategories = cache(async () =>
  (await loadCategories()).filter((c) => c.status === "active"),
);

export const getProducts = cache(async () => {
  const [products, categories] = await Promise.all([loadProducts(), getCategories()]);
  const visibleCats = new Set(categories.map((c) => c.id));
  return products.filter((p) => p.status === "active" && visibleCats.has(p.category));
});

export const getServices = cache(async () =>
  (await loadServices()).filter((s) => s.status === "active"),
);

export async function getProductBySlug(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

/** Categories that actually contain visible products (avoid empty filters). */
export async function getCategoriesWithCounts() {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  return cats
    .map((c) => ({ ...c, count: products.filter((p) => p.category === c.id).length }))
    .filter((c) => c.count > 0);
}
