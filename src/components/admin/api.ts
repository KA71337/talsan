"use client";

export async function api<T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (res.status === 401) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error("Sessiya bitib. Yenidən daxil olun.");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || `Xəta (${res.status})`);
  return data as T;
}

const MAX_SIDE = 2200;
const TARGET_BYTES = 3.6 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ACCEPT_ATTR = ACCEPT.join(",");

export function checkFile(file: File): string | null {
  if (!ACCEPT.includes(file.type)) return `${file.name}: yalnız JPG, PNG, WEBP, AVIF`;
  if (file.size > 25 * 1024 * 1024) return `${file.name}: fayl çox böyükdür`;
  return null;
}

/** Downscale large photos in the browser so uploads stay under the serverless body limit. */
async function shrink(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`${file.name}: şəkil oxunmadı`);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= TARGET_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  for (const q of [0.9, 0.8, 0.7]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
    if (blob && blob.size <= TARGET_BYTES) return blob;
  }
  throw new Error(`${file.name}: şəkil çox böyükdür`);
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await shrink(file);
  const fd = new FormData();
  fd.append("file", blob, file.name);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "same-origin" });
  const data = (await res.json().catch(() => ({}))) as { src?: string; error?: string };
  if (!res.ok || !data.src) throw new Error(data.error || `Yükləmə xətası (${res.status})`);
  return data.src;
}
