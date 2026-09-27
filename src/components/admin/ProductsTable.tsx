"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { api } from "./api";

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const list = products.filter(
    (p) => (!cat || p.category === cat) && (!q || p.title.toLowerCase().includes(q.toLowerCase())),
  );

  async function toggle(p: Product) {
    setBusy(p.id);
    setError(null);
    try {
      await api(`/api/admin/products/${p.id}`, "PUT", {
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        category: p.category,
        images: p.images,
        stock: p.stock,
        status: p.status === "active" ? "hidden" : "active",
      });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(p: Product) {
    if (!confirm(`“${p.title}” silinsin?`)) return;
    setBusy(p.id);
    setError(null);
    try {
      await api(`/api/admin/products/${p.id}`, "DELETE");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-toolbar">
        <input className="input" placeholder="Axtar…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Axtar" />
        <select className="select input" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Kateqoriya">
          <option value="">Bütün kateqoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="muted" style={{ fontSize: 13 }}>
          {list.length} / {products.length}
        </span>
      </div>
      {error && <p className="adm-alert adm-alert--error">{error}</p>}
      {list.length === 0 ? (
        <p className="muted">Məhsul tapılmadı.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Məhsul</th>
              <th>Kateqoriya</th>
              <th>Qiymət</th>
              <th>Stok</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="adm-row-title">
                    <span className="adm-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.images[0] && <img src={p.images[0]} alt="" loading="lazy" />}
                    </span>
                    <span>
                      <strong>{p.title}</strong>
                      <small>/{p.slug}</small>
                    </span>
                  </div>
                </td>
                <td data-label="Kateqoriya">{catName.get(p.category) ?? "—"}</td>
                <td data-label="Qiymət">{formatPrice(p.price) ?? <span className="muted">—</span>}</td>
                <td data-label="Stok">{p.stock ?? <span className="muted">—</span>}</td>
                <td data-label="Status">
                  <span className={`badge ${p.status === "active" ? "badge--ok" : ""}`}>
                    {p.status === "active" ? "Görünür" : "Gizli"}
                  </span>
                </td>
                <td>
                  <div className="adm-actions">
                    <Link className="btn btn--ghost btn--xs" href={`/admin/products/${p.id}`}>
                      Redaktə et
                    </Link>
                    <button className="btn btn--ghost btn--xs" onClick={() => toggle(p)} disabled={busy === p.id}>
                      {p.status === "active" ? "Gizlət" : "Göstər"}
                    </button>
                    <button className="btn btn--danger btn--xs" onClick={() => remove(p)} disabled={busy === p.id}>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
