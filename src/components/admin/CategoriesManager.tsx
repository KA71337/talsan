"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/types";
import { api } from "./api";

type Row = Category & { count: number };

export function CategoriesManager({ categories }: { categories: Row[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setEditing(null);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function bodyFrom(form: HTMLFormElement) {
    const fd = new FormData(form);
    return {
      name: String(fd.get("name") ?? ""),
      slug: String(fd.get("slug") ?? ""),
      description: String(fd.get("description") ?? ""),
      status: fd.get("visible") ? "active" : "hidden",
    };
  }

  return (
    <>
      {error && (
        <p className="adm-alert adm-alert--error" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Kateqoriya</th>
              <th>Məhsul</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) =>
              editing === c.id ? (
                <tr key={c.id}>
                  <td colSpan={4}>
                    <form
                      className="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const body = bodyFrom(e.currentTarget);
                        run(() => api(`/api/admin/categories/${c.id}`, "PUT", body));
                      }}
                    >
                      <CategoryFields c={c} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn--accent btn--sm" disabled={busy}>
                          Yadda saxla
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(null)}>
                          Ləğv et
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      /catalog/{c.slug}
                    </div>
                  </td>
                  <td data-label="Məhsul">{c.count}</td>
                  <td data-label="Status">
                    <span className={`badge ${c.status === "active" ? "badge--ok" : ""}`}>
                      {c.status === "active" ? "Görünür" : "Gizli"}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="btn btn--ghost btn--xs" onClick={() => setEditing(c.id)}>
                        Redaktə et
                      </button>
                      <button
                        className="btn btn--danger btn--xs"
                        disabled={busy}
                        title={c.count ? "Kateqoriyada məhsul var" : undefined}
                        onClick={() => confirm(`“${c.name}” silinsin?`) && run(() => api(`/api/admin/categories/${c.id}`, "DELETE"))}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-card">
        <h2>Kateqoriya əlavə et</h2>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const body = bodyFrom(form);
            run(async () => {
              await api(`/api/admin/categories`, "POST", body);
              form.reset();
            });
          }}
        >
          <CategoryFields />
          <div>
            <button className="btn btn--accent btn--sm" disabled={busy}>
              Əlavə et
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function CategoryFields({ c }: { c?: Category }) {
  return (
    <>
      <div className="form-row">
        <label className="field">
          <span>Ad *</span>
          <input className="input" name="name" defaultValue={c?.name} required maxLength={60} />
        </label>
        <label className="field">
          <span>URL (slug)</span>
          <input className="input" name="slug" defaultValue={c?.slug} maxLength={80} placeholder="avtomatik" />
        </label>
      </div>
      <label className="field">
        <span>Təsvir</span>
        <input className="input" name="description" defaultValue={c?.description} maxLength={300} />
      </label>
      <label className="switch">
        <input type="checkbox" name="visible" defaultChecked={c ? c.status === "active" : true} />
        Saytda göstər
      </label>
    </>
  );
}
