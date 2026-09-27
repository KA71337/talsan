"use client";

import { useCallback, useEffect, useState } from "react";
import type { LibraryImage } from "@/lib/types";
import { ACCEPT_ATTR, api, checkFile, uploadImage } from "./api";

export function ImageLibrary() {
  const [items, setItems] = useState<LibraryImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upload" | "client">("all");

  const load = useCallback(() => {
    api<LibraryImage[]>("/api/admin/images")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function onFiles(files: FileList) {
    setError(null);
    const list = Array.from(files);
    for (const [i, f] of list.entries()) {
      const err = checkFile(f);
      if (err) {
        setError(err);
        continue;
      }
      setStatus(`Yüklənir ${i + 1}/${list.length}…`);
      try {
        await uploadImage(f);
      } catch (e) {
        setError((e as Error).message);
      }
    }
    setStatus(null);
    load();
  }

  async function remove(img: LibraryImage) {
    if (!confirm("Şəkil silinsin?")) return;
    try {
      await api(`/api/admin/images?name=${encodeURIComponent(img.src.split("/").pop()!)}`, "DELETE");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const shown = items?.filter((i) => filter === "all" || i.kind === filter) ?? [];

  return (
    <div className="adm-card">
      <div className="adm-toolbar">
        <label className="btn btn--accent btn--sm" style={{ cursor: "pointer" }}>
          Şəkil yüklə
          <input
            type="file"
            accept={ACCEPT_ATTR}
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <select className="select input" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filtr">
          <option value="all">Hamısı</option>
          <option value="upload">Yüklənmiş</option>
          <option value="client">Müştəri fotoları (saytla birlikdə)</option>
        </select>
        {status && <span className="muted">{status}</span>}
      </div>
      {error && <p className="adm-alert adm-alert--error" style={{ marginBottom: 12 }}>{error}</p>}
      {!items && !error && <p className="muted">Yüklənir…</p>}
      {items && shown.length === 0 && <p className="muted">Şəkil yoxdur.</p>}
      <div className="img-grid">
        {shown.map((img) => (
          <div className="img-tile" key={img.src}>
            <div className="img-tile__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt="" loading="lazy" />
            </div>
            <div className="img-tile__meta">
              <strong style={{ color: "var(--ink-900)" }}>{img.label}</strong>
              <br />
              {img.usedBy.length ? img.usedBy.join(", ") : "İstifadə olunmur"}
            </div>
            {img.kind === "upload" && (
              <div className="img-tile__bar">
                <button type="button" className="danger" disabled={img.usedBy.length > 0} onClick={() => remove(img)}>
                  {img.usedBy.length ? "İstifadədədir" : "Sil"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
