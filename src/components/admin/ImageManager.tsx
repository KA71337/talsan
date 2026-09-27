"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import type { LibraryImage } from "@/lib/types";
import { ACCEPT_ATTR, api, checkFile, uploadImage } from "./api";

export type ImgItem = { key: string; src: string | null; file?: File; preview: string };

let seq = 0;
const key = () => `img-${Date.now()}-${seq++}`;

export function toItems(srcs: string[]): ImgItem[] {
  return srcs.map((src) => ({ key: key(), src, preview: src }));
}

/** Upload pending (local) files and return final image paths in order. */
export async function resolveItems(items: ImgItem[], onProgress?: (msg: string) => void): Promise<string[]> {
  const out: string[] = [];
  let n = 0;
  const pending = items.filter((i) => i.file).length;
  for (const item of items) {
    if (item.file) {
      n++;
      onProgress?.(`Şəkil yüklənir ${n}/${pending}…`);
      item.src = await uploadImage(item.file);
      item.file = undefined;
    }
    if (item.src) out.push(item.src);
  }
  return out;
}

export function ImageManager({
  items,
  onChange,
  max = 12,
  label = "Şəkillər",
}: {
  items: ImgItem[];
  onChange: (items: ImgItem[]) => void;
  max?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [library, setLibrary] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Revoke object URLs on unmount
  useEffect(
    () => () =>
      itemsRef.current.forEach((i) => {
        if (i.file) URL.revokeObjectURL(i.preview);
      }),
    [],
  );

  function addFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);
    const room = max - items.length;
    if (room <= 0) return setError(`Maksimum ${max} şəkil`);
    const errors: string[] = [];
    const added: ImgItem[] = [];
    for (const f of list.slice(0, room)) {
      const err = checkFile(f);
      if (err) errors.push(err);
      else added.push({ key: key(), src: null, file: f, preview: URL.createObjectURL(f) });
    }
    if (list.length > room) errors.push(`Maksimum ${max} şəkil`);
    if (errors.length) setError(errors.join(". "));
    onChange(max === 1 ? added.slice(0, 1) : [...items, ...added]);
    if (max === 1) items.forEach((i) => i.file && URL.revokeObjectURL(i.preview));
  }

  function remove(k: string) {
    const it = items.find((i) => i.key === k);
    if (it?.file) URL.revokeObjectURL(it.preview);
    onChange(items.filter((i) => i.key !== k));
  }

  function makeMain(k: string) {
    const it = items.find((i) => i.key === k);
    if (!it) return;
    onChange([it, ...items.filter((i) => i.key !== k)]);
  }

  function move(k: string, dir: -1 | 1) {
    const i = items.findIndex((x) => x.key === k);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function pickFromLibrary(srcs: string[]) {
    setLibrary(false);
    const existing = new Set(items.map((i) => i.src));
    const add = srcs.filter((s) => !existing.has(s)).map((src) => ({ key: key(), src, preview: src }));
    onChange(max === 1 ? add.slice(0, 1) : [...items, ...add].slice(0, max));
  }

  return (
    <div className="field">
      <span>{label}</span>
      <div className="img-grid">
        {items.map((it, idx) => (
          <div key={it.key} className={`img-tile ${it.file ? "img-tile--pending" : ""}`}>
            <div className="img-tile__media">
              {max > 1 && idx === 0 && <span className="badge badge--ok img-tile__main">Əsas</span>}
              {it.file && max === 1 && <span className="badge badge--warn img-tile__main">Yeni</span>}
              {it.file && max > 1 && idx !== 0 && <span className="badge badge--warn img-tile__main">Yeni</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.preview} alt="" />
            </div>
            <div className="img-tile__bar">
              {max > 1 && idx !== 0 && (
                <button type="button" onClick={() => makeMain(it.key)}>
                  Əsas et
                </button>
              )}
              {max > 1 && (
                <>
                  <button type="button" onClick={() => move(it.key, -1)} disabled={idx === 0} aria-label="Sola">
                    ←
                  </button>
                  <button type="button" onClick={() => move(it.key, 1)} disabled={idx === items.length - 1} aria-label="Sağa">
                    →
                  </button>
                </>
              )}
              <button type="button" className="danger" onClick={() => remove(it.key)}>
                Sil
              </button>
            </div>
          </div>
        ))}
        {items.length < max && (
          <label
            className="dropzone"
            data-over={over}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <Icon name="image" />
            <span>
              {max === 1 ? "Şəkil yüklə" : "Şəkil əlavə et"}
              <br />
              <small className="muted">JPG, PNG, WEBP</small>
            </span>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTR}
              multiple={max > 1}
              className="sr-only"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="btn btn--ghost btn--xs" onClick={() => setLibrary(true)}>
          Qalereyadan seç
        </button>
        <small>Yeni şəkillər “Yadda saxla” düyməsi basıldıqda yüklənir. Önizləmə yuxarıda görünür.</small>
      </div>
      {error && <span className="field-error">{error}</span>}
      {library && <LibraryPicker multiple={max > 1} onClose={() => setLibrary(false)} onPick={pickFromLibrary} />}
    </div>
  );
}

function LibraryPicker({
  multiple,
  onClose,
  onPick,
}: {
  multiple: boolean;
  onClose: () => void;
  onPick: (srcs: string[]) => void;
}) {
  const [items, setItems] = useState<LibraryImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    api<LibraryImage[]>("/api/admin/images")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggle(src: string) {
    if (!multiple) return onPick([src]);
    setSelected((s) => (s.includes(src) ? s.filter((x) => x !== src) : [...s, src]));
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Qalereya" onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 className="h3">Qalereya</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {multiple && (
              <button type="button" className="btn btn--sm" disabled={!selected.length} onClick={() => onPick(selected)}>
                Əlavə et ({selected.length})
              </button>
            )}
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
              Ləğv et
            </button>
          </div>
        </div>
        {error && <p className="adm-alert adm-alert--error">{error}</p>}
        {!items && !error && <p className="muted">Yüklənir…</p>}
        {items && (
          <div className="img-grid">
            {items.map((img) => (
              <button
                type="button"
                key={img.src}
                className={`img-tile ${selected.includes(img.src) ? "img-tile--selected" : ""}`}
                style={{ padding: 0, cursor: "pointer", textAlign: "left" }}
                onClick={() => toggle(img.src)}
              >
                <span className="img-tile__media" style={{ display: "block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt="" loading="lazy" />
                </span>
                <span className="img-tile__meta">
                  {img.label}
                  {img.usedBy.length > 0 && ` · istifadədə`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
