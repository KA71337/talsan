/**
 * Stateless signed session cookie (HMAC-SHA256, Web Crypto).
 * Works in Proxy and Route Handlers. Signing key = SESSION_SECRET + ADMIN_PASSWORD,
 * so changing the password invalidates all existing sessions.
 */

export const SESSION_COOKIE = "adm_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h
export const ADMIN_USERNAME = "admin";

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function authConfigError(): string | null {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  if (!pw) return "ADMIN_PASSWORD təyin edilməyib";
  if (secret.length < 32) return "SESSION_SECRET təyin edilməyib (minimum 32 simvol)";
  return null;
}

async function key(): Promise<CryptoKey> {
  const material = `${process.env.SESSION_SECRET}|${process.env.ADMIN_PASSWORD}`;
  return crypto.subtle.importKey("raw", enc.encode(material), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(enc.encode(JSON.stringify({ u: ADMIN_USERNAME, iat: now, exp: now + SESSION_TTL_SECONDS })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token || authConfigError()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await key(),
      fromB64url(sig) as BufferSource,
      enc.encode(payload),
    );
    if (!ok) return false;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { u?: string; exp?: number };
    return data.u === ADMIN_USERNAME && typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

/** Constant-time credential check (compares HMAC digests, not raw strings). */
export async function checkCredentials(username: string, password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const k = await crypto.subtle.importKey("raw", crypto.getRandomValues(new Uint8Array(32)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const [a, b] = await Promise.all([
    crypto.subtle.sign("HMAC", k, enc.encode(`${username}\u0000${password}`)),
    crypto.subtle.sign("HMAC", k, enc.encode(`${ADMIN_USERNAME}\u0000${expected}`)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}
