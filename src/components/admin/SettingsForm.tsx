"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Settings } from "@/lib/types";
import { api } from "./api";
import { ImageManager, resolveItems, toItems, type ImgItem } from "./ImageManager";

type Section = "contact" | "texts" | "general";
type ImageKey = "heroImage" | "heroImageSecondary" | "repairImage" | "aboutImage" | "ogImage";

const IMAGE_FIELDS: Record<Section, { key: ImageKey; label: string }[]> = {
  contact: [],
  texts: [
    { key: "heroImage", label: "Hero — əsas şəkil" },
    { key: "heroImageSecondary", label: "Hero — kiçik şəkil (istəyə bağlı)" },
    { key: "repairImage", label: "Təmir bloku şəkli" },
    { key: "aboutImage", label: "Haqqımızda şəkli" },
  ],
  general: [{ key: "ogImage", label: "Open Graph şəkli (boş qalsa — TalSan loqolu standart şəkil)" }],
};

function getImage(s: Settings, k: ImageKey) {
  return k === "ogImage" ? s.seo.ogImage : s.texts[k];
}

export function SettingsForm({ initial, section }: { initial: Settings; section: Section }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [images, setImages] = useState<Record<ImageKey, ImgItem[]>>(() => {
    const out = {} as Record<ImageKey, ImgItem[]>;
    for (const f of [...IMAGE_FIELDS.texts, ...IMAGE_FIELDS.general]) {
      const v = getImage(initial, f.key);
      out[f.key] = toItems(v ? [v] : []);
    }
    return out;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <G extends keyof Settings>(group: G, key: keyof Settings[G], value: unknown) =>
    setS((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
  const setSocial = (key: keyof Settings["contact"]["socials"], value: string) =>
    setS((prev) => ({ ...prev, contact: { ...prev.contact, socials: { ...prev.contact.socials, [key]: value } } }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const next: Settings = structuredClone(s);
      for (const f of IMAGE_FIELDS[section]) {
        const [src] = await resolveItems(images[f.key], (t) => setMsg({ ok: true, text: t }));
        if (f.key === "ogImage") next.seo.ogImage = src ?? "";
        else next.texts[f.key] = src ?? "";
        setImages((prev) => ({ ...prev, [f.key]: toItems(src ? [src] : []) }));
      }
      const saved = await api<Settings>("/api/admin/settings", "PUT", next);
      setS(saved);
      setMsg({ ok: true, text: "Yadda saxlanıldı." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const text = (group: "brand" | "contact" | "texts" | "seo", key: string, label: string, opts: { hint?: string; area?: boolean; max?: number; placeholder?: string; type?: string } = {}) => {
    const value = (s[group] as unknown as Record<string, string>)[key] ?? "";
    return (
      <label className="field" key={`${group}.${key}`}>
        <span>{label}</span>
        {opts.area ? (
          <textarea
            className="textarea"
            value={value}
            maxLength={opts.max}
            placeholder={opts.placeholder}
            onChange={(e) => set(group, key as never, e.target.value)}
          />
        ) : (
          <input
            className="input"
            type={opts.type ?? "text"}
            value={value}
            maxLength={opts.max}
            placeholder={opts.placeholder}
            onChange={(e) => set(group, key as never, e.target.value)}
          />
        )}
        {opts.hint && <small>{opts.hint}</small>}
      </label>
    );
  };

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {section === "contact" && (
        <>
          <div className="adm-card form">
            <h2>Əlaqə kanalları</h2>
            <p className="adm-alert adm-alert--info">Boş qalan sahələr saytda göstərilmir.</p>
            <div className="form-row">
              {text("contact", "phone", "Telefon", { placeholder: "+994 __ ___ __ __", max: 40, type: "tel" })}
              {text("contact", "whatsapp", "WhatsApp nömrəsi", {
                placeholder: "+994 __ ___ __ __",
                max: 40,
                type: "tel",
                hint: "Sorğu forması bu nömrəyə WhatsApp mesajı açır",
              })}
            </div>
            {text("contact", "email", "E-poçt", { max: 120, type: "email" })}
            {text("contact", "address", "Ünvan (olduqda)", {
              max: 200,
              hint: "Hazırda fiziki mağaza yoxdursa, boş saxlayın",
            })}
            {text("contact", "hours", "İş saatları (olduqda)", { max: 200, placeholder: "Məs: B.e.–Cümə 09:00–18:00" })}
          </div>
          <div className="adm-card form">
            <h2>Sosial şəbəkələr</h2>
            <div className="form-row">
              {(["instagram", "facebook", "telegram", "youtube", "tiktok"] as const).map((k) => (
                <label className="field" key={k}>
                  <span style={{ textTransform: "capitalize" }}>{k}</span>
                  <input
                    className="input"
                    type="url"
                    value={s.contact.socials[k]}
                    placeholder="https://"
                    maxLength={300}
                    onChange={(e) => setSocial(k, e.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {section === "texts" && (
        <>
          <div className="adm-card form">
            <h2>Ana səhifə — Hero</h2>
            {text("texts", "heroEyebrow", "Üst yazı (kiçik)", { max: 80 })}
            {text("texts", "heroTitle", "Başlıq *", { max: 120 })}
            {text("texts", "heroText", "Təsvir", { area: true, max: 400 })}
            <div className="form-row">
              {IMAGE_FIELDS.texts.slice(0, 2).map((f) => (
                <ImageManager key={f.key} label={f.label} max={1} items={images[f.key]} onChange={(v) => setImages((p) => ({ ...p, [f.key]: v }))} />
              ))}
            </div>
          </div>
          <div className="adm-card form">
            <h2>Xidmətlər bloku</h2>
            {text("texts", "servicesTitle", "Başlıq *", { max: 80 })}
            {text("texts", "servicesText", "Təsvir", { area: true, max: 400 })}
          </div>
          <div className="adm-card form">
            <h2>Təmir bloku</h2>
            {text("texts", "repairTitle", "Başlıq", { max: 120, hint: "Boş qalsa blok gizlədilir" })}
            {text("texts", "repairText", "Təsvir", { area: true, max: 800 })}
            <ImageManager label={IMAGE_FIELDS.texts[2].label} max={1} items={images.repairImage} onChange={(v) => setImages((p) => ({ ...p, repairImage: v }))} />
          </div>
          <div className="adm-card form">
            <h2>Kataloq</h2>
            {text("texts", "catalogTitle", "Başlıq *", { max: 80 })}
            {text("texts", "catalogText", "Təsvir", { area: true, max: 400 })}
          </div>
          <div className="adm-card form">
            <h2>Haqqımızda</h2>
            {text("texts", "aboutTitle", "Başlıq *", { max: 120 })}
            {text("texts", "aboutText", "Mətn", { area: true, max: 3000, hint: "Abzasları boş sətirlə ayırın" })}
            <ImageManager label={IMAGE_FIELDS.texts[3].label} max={1} items={images.aboutImage} onChange={(v) => setImages((p) => ({ ...p, aboutImage: v }))} />
          </div>
          <div className="adm-card form">
            <h2>Əlaqə səhifəsi</h2>
            {text("texts", "contactTitle", "Başlıq *", { max: 120 })}
            {text("texts", "contactText", "Təsvir", { area: true, max: 400 })}
          </div>
        </>
      )}

      {section === "general" && (
        <>
          <div className="adm-card form">
            <h2>Brend</h2>
            <p className="adm-alert adm-alert--info">
              Brend adı — <strong>TalSan</strong>, loqo və əsas domen (talsanpower.com) sabitdir və bütün saytda (başlıq,
              footer, SEO) avtomatik istifadə olunur.
            </p>
            <div className="form-row">
              <label className="field">
                <span>Brend adı</span>
                <input className="input" value={s.brand.name} readOnly disabled />
              </label>
              {text("brand", "tagline", "Qısa şüar / fəaliyyət", { max: 120 })}
            </div>
          </div>
          <div className="adm-card form">
            <h2>SEO</h2>
            {text("seo", "title", "Sayt başlığı (title) *", { max: 70, hint: "Brend adı avtomatik əlavə olunur" })}
            {text("seo", "description", "Meta təsvir", { area: true, max: 170 })}
            <ImageManager label={IMAGE_FIELDS.general[0].label} max={1} items={images.ogImage} onChange={(v) => setImages((p) => ({ ...p, ogImage: v }))} />
          </div>
        </>
      )}

      <div className="adm-form-actions">
        <button className="btn btn--accent" type="submit" disabled={busy}>
          {busy ? "Gözləyin…" : "Yadda saxla"}
        </button>
        <button
          className="btn btn--ghost"
          type="button"
          disabled={busy}
          onClick={() => {
            setS(initial);
            setMsg(null);
            router.refresh();
          }}
        >
          Ləğv et
        </button>
        {msg && (
          <p className={`adm-alert ${msg.ok ? "adm-alert--ok" : "adm-alert--error"}`} role="status" style={{ flexBasis: "100%" }}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
