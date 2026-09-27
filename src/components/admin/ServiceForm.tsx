"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { Service, ServiceIcon } from "@/lib/types";
import { api } from "./api";
import { ImageManager, resolveItems, toItems, type ImgItem } from "./ImageManager";

const ICONS: { value: ServiceIcon; label: string }[] = [
  { value: "generator", label: "Generator" },
  { value: "stabilizer", label: "Stabilizator" },
  { value: "repair", label: "Təmir" },
  { value: "regulator", label: "Tənzimləyici" },
  { value: "consult", label: "Konsultasiya" },
  { value: "bolt", label: "Elektrik" },
  { value: "other", label: "Digər" },
];

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [image, setImage] = useState<ImgItem[]>(toItems(service?.image ? [service.image] : []));
  const [icon, setIcon] = useState<ServiceIcon>(service?.icon ?? "other");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const [img] = await resolveItems(image, setStatus);
      setImage(toItems(img ? [img] : []));
      setStatus("Yadda saxlanılır…");
      const body = {
        title: String(fd.get("title") ?? ""),
        slug: String(fd.get("slug") ?? ""),
        summary: String(fd.get("summary") ?? ""),
        description: String(fd.get("description") ?? ""),
        icon,
        image: img ?? null,
        status: fd.get("visible") ? "active" : "hidden",
      };
      if (service) await api(`/api/admin/services/${service.id}`, "PUT", body);
      else await api(`/api/admin/services`, "POST", body);
      router.push("/admin/services?saved=1");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setStatus(null);
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!service || !confirm(`“${service.title}” silinsin?`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/services/${service.id}`, "DELETE");
      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="adm-card form">
        <div className="form-row">
          <label className="field">
            <span>Ad *</span>
            <input className="input" name="title" defaultValue={service?.title} required maxLength={120} />
          </label>
          <label className="field">
            <span>URL (slug)</span>
            <input className="input" name="slug" defaultValue={service?.slug} maxLength={80} placeholder="avtomatik" />
          </label>
        </div>
        <label className="field">
          <span>Qısa təsvir (kartda)</span>
          <textarea className="textarea" name="summary" defaultValue={service?.summary} maxLength={300} rows={2} style={{ minHeight: 80 }} />
        </label>
        <label className="field">
          <span>Ətraflı təsvir (Xidmətlər səhifəsində)</span>
          <textarea className="textarea" name="description" defaultValue={service?.description} maxLength={4000} rows={5} />
        </label>
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend>İkon</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {ICONS.map((i) => (
              <button
                key={i.value}
                type="button"
                className={`btn btn--xs ${icon === i.value ? "" : "btn--ghost"}`}
                onClick={() => setIcon(i.value)}
                aria-pressed={icon === i.value}
              >
                <Icon name={i.value} /> {i.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="switch">
          <input type="checkbox" name="visible" defaultChecked={service ? service.status === "active" : true} />
          Saytda göstər
        </label>
      </div>
      <div className="adm-card">
        <ImageManager items={image} onChange={setImage} max={1} label="Şəkil (istəyə bağlı)" />
      </div>
      <div className="adm-form-actions">
        <button className="btn btn--accent" type="submit" disabled={busy}>
          {busy ? status ?? "Gözləyin…" : "Yadda saxla"}
        </button>
        <button className="btn btn--ghost" type="button" onClick={() => router.push("/admin/services")} disabled={busy}>
          Ləğv et
        </button>
        {service && (
          <button className="btn btn--danger" type="button" onClick={onDelete} disabled={busy} style={{ marginLeft: "auto" }}>
            Sil
          </button>
        )}
        {error && (
          <p className="adm-alert adm-alert--error" role="alert" style={{ flexBasis: "100%" }}>
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
