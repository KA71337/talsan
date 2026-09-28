import { buildWhatsAppUrl, digitsOnly } from "@/config/contact";
import { CURRENCY } from "@/config/site";
import type { Settings } from "./types";

export function formatPrice(price: number | null): string | null {
  if (price === null || price === undefined) return null;
  const n = new Intl.NumberFormat("az-AZ", { maximumFractionDigits: 2 }).format(price);
  return `${n} ${CURRENCY}`;
}

export const digits = digitsOnly;

export function telHref(phone: string): string | null {
  const d = digits(phone);
  if (d.length < 5) return null;
  return `tel:${phone.trim().startsWith("+") ? "+" : ""}${d}`;
}

export const whatsappHref = buildWhatsAppUrl;

export function contactChannels(s: Settings) {
  const c = s.contact;
  return {
    tel: telHref(c.phone),
    wa: whatsappHref(c.whatsapp),
    mail: c.email ? `mailto:${c.email}` : null,
  };
}

export const SOCIAL_LABELS: Record<keyof Settings["contact"]["socials"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  telegram: "Telegram",
  youtube: "YouTube",
  tiktok: "TikTok",
};
