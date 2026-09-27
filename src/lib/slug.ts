const MAP: Record<string, string> = {
  ə: "e", Ə: "e", ı: "i", I: "i", İ: "i", ö: "o", Ö: "o", ü: "u", Ü: "u",
  ç: "c", Ç: "c", ş: "s", Ş: "s", ğ: "g", Ğ: "g",
};

export function slugify(input: string): string {
  return input
    .split("")
    .map((ch) => MAP[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Ensure a slug is unique within a list (appends -2, -3 …). */
export function uniqueSlug(base: string, taken: Iterable<string>, fallback = "item"): string {
  const set = new Set(taken);
  const root = base || fallback;
  if (!set.has(root)) return root;
  for (let i = 2; ; i++) {
    const s = `${root}-${i}`;
    if (!set.has(s)) return s;
  }
}

export function newId(prefix: string): string {
  const rnd = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${Date.now().toString(36)}${Array.from(rnd, (b) => b.toString(36).padStart(2, "0")).join("")}`;
}
