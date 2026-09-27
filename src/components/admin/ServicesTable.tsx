"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { Service } from "@/lib/types";
import { api } from "./api";

export function ServicesTable({ services }: { services: Service[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="adm-card">
      {error && <p className="adm-alert adm-alert--error">{error}</p>}
      {services.length === 0 ? (
        <p className="muted">Xidmət yoxdur.</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Xidmət</th>
              <th>Status</th>
              <th>Sıra</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={s.id}>
                <td>
                  <div className="adm-row-title">
                    <span className="adm-thumb" style={{ display: "grid", placeItems: "center" }}>
                      {s.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt="" loading="lazy" />
                      ) : (
                        <span style={{ width: 22, height: 22 }}>
                          <Icon name={s.icon} />
                        </span>
                      )}
                    </span>
                    <span>
                      <strong>{s.title}</strong>
                      <small>{s.summary}</small>
                    </span>
                  </div>
                </td>
                <td data-label="Status">
                  <span className={`badge ${s.status === "active" ? "badge--ok" : ""}`}>
                    {s.status === "active" ? "Görünür" : "Gizli"}
                  </span>
                </td>
                <td data-label="Sıra">
                  <div style={{ display: "inline-flex", gap: 4 }}>
                    <button
                      className="btn btn--ghost btn--xs"
                      aria-label="Yuxarı"
                      disabled={i === 0 || busy === s.id}
                      onClick={() => run(s.id, () => api(`/api/admin/services/${s.id}`, "PATCH", { direction: "up" }))}
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn--ghost btn--xs"
                      aria-label="Aşağı"
                      disabled={i === services.length - 1 || busy === s.id}
                      onClick={() => run(s.id, () => api(`/api/admin/services/${s.id}`, "PATCH", { direction: "down" }))}
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td>
                  <div className="adm-actions">
                    <Link className="btn btn--ghost btn--xs" href={`/admin/services/${s.id}`}>
                      Redaktə et
                    </Link>
                    <button
                      className="btn btn--ghost btn--xs"
                      disabled={busy === s.id}
                      onClick={() =>
                        run(s.id, () =>
                          api(`/api/admin/services/${s.id}`, "PUT", {
                            title: s.title,
                            slug: s.slug,
                            summary: s.summary,
                            description: s.description,
                            icon: s.icon,
                            image: s.image,
                            status: s.status === "active" ? "hidden" : "active",
                          }),
                        )
                      }
                    >
                      {s.status === "active" ? "Gizlət" : "Göstər"}
                    </button>
                    <button
                      className="btn btn--danger btn--xs"
                      disabled={busy === s.id}
                      onClick={() => confirm(`“${s.title}” silinsin?`) && run(s.id, () => api(`/api/admin/services/${s.id}`, "DELETE"))}
                    >
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
