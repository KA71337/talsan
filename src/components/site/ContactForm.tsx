"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

type Props = {
  whatsapp: string | null; // digits only
  email: string | null;
  services: { slug: string; title: string }[];
  defaultService?: string;
  defaultMessage?: string;
};

type Errors = Partial<Record<"name" | "phone" | "message", string>>;

/**
 * The client has no backend mail service; the request is composed here and sent through
 * WhatsApp (or e-mail as a fallback). Nothing is stored on the server.
 */
export function ContactForm({ whatsapp, email, services, defaultService = "", defaultMessage = "" }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string | null>(null);
  const available = Boolean(whatsapp || email);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const service = String(fd.get("service") ?? "");
    const message = String(fd.get("message") ?? "").trim();

    const next: Errors = {};
    if (name.length < 2) next.name = "Adınızı daxil edin";
    if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) next.phone = "Nömrə formatı yanlışdır";
    if (message.length < 5) next.message = "Sorğunuzu qısaca yazın";
    setErrors(next);
    if (Object.keys(next).length) return;

    const serviceTitle = services.find((s) => s.slug === service)?.title;
    const lines = [
      `Salam! Sorğu:`,
      `Ad: ${name}`,
      phone ? `Telefon: ${phone}` : null,
      serviceTitle ? `Xidmət: ${serviceTitle}` : null,
      ``,
      message.slice(0, 1500),
    ].filter((l): l is string => l !== null);
    const text = lines.join("\n");

    if (whatsapp) {
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      setStatus("WhatsApp açıldı — mesajı göndərməyi unutmayın.");
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("Saytdan sorğu")}&body=${encodeURIComponent(text)}`;
      setStatus("E-poçt proqramı açıldı.");
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="form-row">
        <label className="field">
          <span>Adınız *</span>
          <input
            className="input"
            name="name"
            autoComplete="name"
            maxLength={80}
            aria-invalid={!!errors.name}
            required
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label className="field">
          <span>Telefon</span>
          <input
            className="input"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </label>
      </div>
      <label className="field">
        <span>Xidmət</span>
        <select className="select input" name="service" defaultValue={defaultService}>
          <option value="">Seçin (istəyə bağlı)</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Sorğunuz *</span>
        <textarea
          className="textarea"
          name="message"
          maxLength={1500}
          defaultValue={defaultMessage}
          placeholder="Avadanlıq, model, nasazlıq və ya sualınız…"
          aria-invalid={!!errors.message}
          required
        />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </label>
      <button className="btn btn--accent" type="submit" disabled={!available}>
        {whatsapp ? <Icon name="whatsapp" /> : <Icon name="mail" />}
        {whatsapp ? "WhatsApp ilə göndər" : "Sorğu göndər"}
      </button>
      {!available && (
        <p className="notice">Əlaqə kanalları hələ əlavə edilməyib. Tezliklə burada əlaqə məlumatları olacaq.</p>
      )}
      {status && (
        <p className="form-status form-status--ok" role="status">
          {status}
        </p>
      )}
    </form>
  );
}
