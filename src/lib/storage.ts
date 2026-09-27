import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Content storage.
 *  - GitHub (production): JSON + uploaded images are committed to the repository via the
 *    Contents API. The token never leaves the server.
 *  - Local (development fallback): files in ./data. Read-only on Vercel.
 */

export type DataKey = "products" | "services" | "categories" | "settings";

export const CONTENT_TAG = "content";

export class StorageError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

class ConflictError extends Error {}

function env(name: string, fallback = ""): string {
  return (process.env[name] ?? "").trim() || fallback;
}

const DEFAULT_PATHS: Record<DataKey, string> = {
  products: "data/products.json",
  services: "data/services.json",
  categories: "data/categories.json",
  settings: "data/settings.json",
};

function dataPath(key: DataKey): string {
  const envName = `GITHUB_${key.toUpperCase()}_PATH`;
  const p = env(envName, DEFAULT_PATHS[key]).replace(/^\/+/, "");
  if (p.includes("..")) throw new StorageError(`${envName} yanlışdır`);
  return p;
}

function uploadsDir(): string {
  const p = env("GITHUB_UPLOADS_DIR", "data/uploads").replace(/^\/+|\/+$/g, "");
  if (p.includes("..")) throw new StorageError("GITHUB_UPLOADS_DIR yanlışdır");
  return p;
}

export function storageKind(): "github" | "local" {
  return env("GITHUB_TOKEN") && env("GITHUB_OWNER") && env("GITHUB_REPO") ? "github" : "local";
}

export function storageInfo() {
  return {
    kind: storageKind(),
    owner: env("GITHUB_OWNER"),
    repo: env("GITHUB_REPO"),
    branch: env("GITHUB_BRANCH", "main"),
    productsPath: dataPath("products"),
    servicesPath: dataPath("services"),
    categoriesPath: dataPath("categories"),
    settingsPath: dataPath("settings"),
    uploadsDir: uploadsDir(),
  };
}

/* ------------------------------------------------------------------ */
/* GitHub driver                                                       */
/* ------------------------------------------------------------------ */

function gh() {
  const base = env("GITHUB_API_URL", "https://api.github.com").replace(/\/+$/, "");
  const owner = encodeURIComponent(env("GITHUB_OWNER"));
  const repo = encodeURIComponent(env("GITHUB_REPO"));
  const branch = env("GITHUB_BRANCH", "main");
  const headers = {
    Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "site-admin",
  };
  const url = (p: string) =>
    `${base}/repos/${owner}/${repo}/contents/${p.split("/").map(encodeURIComponent).join("/")}`;
  return { url, branch, headers };
}

async function ghError(res: Response, action: string): Promise<never> {
  let detail = "";
  try {
    detail = ((await res.json()) as { message?: string }).message ?? "";
  } catch {
    /* ignore */
  }
  // Never include headers/token in messages.
  console.error(`[storage] GitHub ${action} failed: ${res.status} ${detail}`);
  if (res.status === 401 || res.status === 403)
    throw new StorageError("GitHub icazəsi yoxdur (GITHUB_TOKEN yoxlayın)", 502);
  throw new StorageError(`GitHub xətası (${res.status})`, 502);
}

async function ghReadJson<T>(p: string, fresh: boolean): Promise<{ data: T; sha: string } | null> {
  const { url, branch, headers } = gh();
  const res = await fetch(`${url(p)}?ref=${encodeURIComponent(branch)}`, {
    headers: { ...headers, Accept: "application/vnd.github+json" },
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 600, tags: [CONTENT_TAG] } }),
  });
  if (res.status === 404) return null;
  if (!res.ok) await ghError(res, `read ${p}`);
  const body = (await res.json()) as { content?: string; encoding?: string; sha: string };
  let raw: string;
  if (body.encoding === "base64" && body.content) {
    raw = Buffer.from(body.content, "base64").toString("utf8");
  } else {
    // Files > 1 MB: fetch raw
    const r = await fetch(`${url(p)}?ref=${encodeURIComponent(branch)}`, {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
      cache: "no-store",
    });
    if (!r.ok) await ghError(r, `read raw ${p}`);
    raw = await r.text();
  }
  return { data: JSON.parse(raw) as T, sha: body.sha };
}

async function ghPut(p: string, content: Buffer, message: string, sha?: string) {
  const { url, branch, headers } = gh();
  const res = await fetch(url(p), {
    method: "PUT",
    headers: { ...headers, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: content.toString("base64"), branch, ...(sha ? { sha } : {}) }),
    cache: "no-store",
  });
  if (res.status === 409 || res.status === 422) throw new ConflictError();
  if (!res.ok) await ghError(res, `write ${p}`);
}

async function ghSha(p: string): Promise<string | null> {
  const { url, branch, headers } = gh();
  const res = await fetch(`${url(p)}?ref=${encodeURIComponent(branch)}`, {
    method: "GET",
    headers: { ...headers, Accept: "application/vnd.github.object+json" },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) await ghError(res, `stat ${p}`);
  return ((await res.json()) as { sha: string }).sha;
}

/* ------------------------------------------------------------------ */
/* Local driver                                                        */
/* ------------------------------------------------------------------ */

/** Local driver is always scoped to ./data (keeps file tracing small and prevents path escapes). */
const localFile = (p: string) => path.join(process.cwd(), "data", ...p.replace(/^data\//, "").split("/"));

async function localReadJson<T>(p: string): Promise<{ data: T; sha: string } | null> {
  try {
    const raw = await fs.readFile(localFile(p), "utf8");
    return { data: JSON.parse(raw) as T, sha: "local" };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

async function localWrite(p: string, content: Buffer) {
  if (process.env.VERCEL) {
    throw new StorageError(
      "Yadda saxlamaq mümkün deyil: GitHub storage konfiqurasiya edilməyib (GITHUB_TOKEN, GITHUB_REPO).",
      503,
    );
  }
  const file = localFile(p);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, content);
  await fs.rename(tmp, file);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function readData<T>(key: DataKey, opts: { fresh?: boolean } = {}): Promise<T | null> {
  const p = dataPath(key);
  if (storageKind() === "github") {
    const r = await ghReadJson<T>(p, !!opts.fresh);
    if (r) return r.data;
    // Not in the repo yet → fall back to the bundled seed file.
  }
  return (await localReadJson<T>(p))?.data ?? null;
}

/**
 * Read-modify-write with optimistic locking (GitHub sha). Retries on conflicts.
 */
export async function updateData<T>(
  key: DataKey,
  fallback: T,
  mutate: (current: T) => T,
  message: string,
): Promise<T> {
  const p = dataPath(key);
  for (let attempt = 0; attempt < 3; attempt++) {
    if (storageKind() === "github") {
      const cur = await ghReadJson<T>(p, true);
      const base = cur?.data ?? (await localReadJson<T>(p))?.data ?? fallback;
      const next = mutate(structuredClone(base));
      try {
        await ghPut(p, Buffer.from(JSON.stringify(next, null, 2) + "\n"), message, cur?.sha);
        return next;
      } catch (e) {
        if (e instanceof ConflictError) continue;
        throw e;
      }
    } else {
      const cur = (await localReadJson<T>(p))?.data ?? fallback;
      const next = mutate(structuredClone(cur));
      await localWrite(p, Buffer.from(JSON.stringify(next, null, 2) + "\n"));
      return next;
    }
  }
  throw new StorageError("Eyni anda dəyişiklik baş verdi, yenidən cəhd edin", 409);
}

export async function putUpload(name: string, bytes: Buffer): Promise<void> {
  const p = `${uploadsDir()}/${name}`;
  if (storageKind() === "github") {
    await ghPut(p, bytes, `Upload image ${name}`);
  } else {
    await localWrite(p, bytes);
  }
}

export async function getUpload(name: string): Promise<Buffer | null> {
  const p = `${uploadsDir()}/${name}`;
  if (storageKind() === "github") {
    const { url, branch, headers } = gh();
    const res = await fetch(`${url(p)}?ref=${encodeURIComponent(branch)}`, {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) await ghError(res, `read ${p}`);
    return Buffer.from(await res.arrayBuffer());
  }
  try {
    return await fs.readFile(localFile(p));
  } catch {
    return null;
  }
}

export async function uploadExists(name: string): Promise<boolean> {
  const p = `${uploadsDir()}/${name}`;
  if (storageKind() === "github") return (await ghSha(p)) !== null;
  try {
    await fs.access(localFile(p));
    return true;
  } catch {
    return false;
  }
}

export async function deleteUpload(name: string): Promise<void> {
  const p = `${uploadsDir()}/${name}`;
  if (storageKind() === "github") {
    const sha = await ghSha(p);
    if (!sha) return;
    const { url, branch, headers } = gh();
    const res = await fetch(url(p), {
      method: "DELETE",
      headers: { ...headers, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Delete image ${name}`, sha, branch }),
      cache: "no-store",
    });
    if (!res.ok && res.status !== 404) await ghError(res, `delete ${p}`);
    return;
  }
  if (process.env.VERCEL) throw new StorageError("GitHub storage konfiqurasiya edilməyib", 503);
  await fs.rm(localFile(p), { force: true });
}

export async function listUploads(): Promise<string[]> {
  const dir = uploadsDir();
  if (storageKind() === "github") {
    const { url, branch, headers } = gh();
    const res = await fetch(`${url(dir)}?ref=${encodeURIComponent(branch)}`, {
      headers: { ...headers, Accept: "application/vnd.github+json" },
      cache: "no-store",
    });
    if (res.status === 404) return [];
    if (!res.ok) await ghError(res, `list ${dir}`);
    const items = (await res.json()) as Array<{ name: string; type: string }>;
    return Array.isArray(items) ? items.filter((i) => i.type === "file").map((i) => i.name) : [];
  }
  try {
    return await fs.readdir(localFile(dir));
  } catch {
    return [];
  }
}
