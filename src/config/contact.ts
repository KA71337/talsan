/** Public, non-secret contact defaults. Admin settings may override these values. */
const env = (value: string | undefined, fallback: string) => value?.trim() || fallback;

export const PUBLIC_CONTACT = {
  name: env(process.env.NEXT_PUBLIC_CONTACT_NAME, "TalSan"),
  phone: env(process.env.NEXT_PUBLIC_PHONE, "+994 50 681 21 25"),
  whatsapp: env(process.env.NEXT_PUBLIC_WHATSAPP, "994506812125"),
  hours: env(process.env.NEXT_PUBLIC_CONTACT_HOURS, "A\u00e7\u0131qd\u0131r, ba\u011flanaca\u011f\u0131 saat - 23:00"),
  address: env(process.env.NEXT_PUBLIC_ADDRESS, "L\u0259nk\u0259ran, Az\u0259rbaycan"),
  telegram: process.env.NEXT_PUBLIC_TELEGRAM?.trim() || "",
} as const;

export const GENERIC_INQUIRY_MESSAGE = "Salam, TalSan saytı vasitəsilə məlumat almaq istəyirəm.";

export function contextualInquiryMessage(subject: string): string {
  return `Salam, TalSan saytı vasitəsilə ${subject.trim()} barədə məlumat almaq istəyirəm.`;
}

export const digitsOnly = (value: string) => value.replace(/\D+/g, "");

export function buildWhatsAppUrl(number: string, message = GENERIC_INQUIRY_MESSAGE): string | null {
  const digits = digitsOnly(number);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
