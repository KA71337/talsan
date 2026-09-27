"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, Product } from "@/lib/types";
import { api } from "./api";
import { ImageManager, resolveItems, toItems, type ImgItem } from "./ImageManager";

function parseNum(v: string, int = false): number | null | "invalid" {
  const s = v.trim().replace(/\s+/g, "").replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0 || (int && !Number.isInteger(n))) return "invalid";
  return n;
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [images, setImages] = useState<ImgItem[]>(toItems(product?.images ?? []));
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const price = parseNum(String(fd.get("price") ?? ""));
    const stock = parseNum(String(fd.get("stock") ?? ""), true);
    if (price === "invalid") return setError("Qiymət düzgün deyil");
    if (stock === "invalid") return setError("Stok tam müsbət ədəd olmalıdır");
    setBusy(true);
    setError(null);
    try {
      const paths = await resolveItems(images, setStatus);
      setImages(toItems(paths));
      setStatus("Yadda saxlanılır…");
      const body = {
        title: String(fd.get("title") ?? ""),
        slug: String(fd.get("slug") ?? ""),
        description: String(fd.get("description") ?? ""),
        category: String(fd.get("category") ?? ""),
        price,
        stock,
        status: fd.get("visible") ? "active" : "hidden",
        images: paths,
      };
      if (product) {
        await api(`/api/admin/products/${product.id}`, "PUT", body);
      } else {
        await api(`/api/admin/products`, "POST", body);
      }
      router.push("/admin/products?saved=1");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setStatus(null);
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!product || !confirm(`“${product.title}” silinsin?`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/products/${product.id}`, "DELETE");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="adm-card form">
        <label className="field">
          <span>Ad *</span>
          <input className="input" name="title" defaultValue={product?.title} required maxLength={140} />
        </label>
        <div className="form-row">
          <label className="field">
            <span>Kateqoriya *</span>
            <select className="select input" name="category" defaultValue={product?.category ?? categories[0]?.id} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.status === "hidden" ? " (gizli)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>URL (slug)</span>
            <input className="input" name="slug" defaultValue={product?.slug} maxLength={80} placeholder="avtomatik" />
            <small>Boş qalsa addan yaradılır. Məs: generator-5kw</small>
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            <span>Qiymət (AZN)</span>
            <input
              className="input"
              name="price"
              inputMode="decimal"
              defaultValue={product?.price ?? ""}
              placeholder="Boş — “Qiymət üçün əlaqə saxlayın”"
            />
          </label>
          <label className="field">
            <span>Stok (ədəd)</span>
            <input className="input" name="stock" inputMode="numeric" defaultValue={product?.stock ?? ""} placeholder="Boş — göstərilmir" />
            <small>0 — “Sifarişlə”, 1+ — “Mövcuddur”</small>
          </label>
        </div>
        <label className="field">
          <span>Təsvir</span>
          <textarea className="textarea" name="description" defaultValue={product?.description} maxLength={4000} rows={6} />
        </label>
        <label className="switch">
          <input type="checkbox" name="visible" defaultChecked={product ? product.status === "active" : true} />
          Saytda göstər
        </label>
      </div>

      <div className="adm-card">
        <ImageManager items={images} onChange={setImages} max={12} label="Şəkillər (birinci şəkil — əsas)" />
      </div>

      <div className="adm-form-actions">
        <button className="btn btn--accent" type="submit" disabled={busy}>
          {busy ? status ?? "Gözləyin…" : "Yadda saxla"}
        </button>
        <button className="btn btn--ghost" type="button" onClick={() => router.push("/admin/products")} disabled={busy}>
          Ləğv et
        </button>
        {product && (
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
