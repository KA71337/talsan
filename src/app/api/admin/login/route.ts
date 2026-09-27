import { NextResponse } from "next/server";
import { z } from "zod";
import { authConfigError, checkCredentials, createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

// Best-effort brute-force protection (per server instance).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; first: number }>();

function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

const body = z.object({ username: z.string().max(100), password: z.string().max(200) });

export async function POST(req: Request) {
  const configError = authConfigError();
  if (configError) {
    return NextResponse.json({ error: `Admin giriş konfiqurasiya edilməyib: ${configError}` }, { status: 503 });
  }

  const ip = clientIp(req);
  const now = Date.now();
  const entry = fails.get(ip);
  if (entry && now - entry.first < WINDOW_MS && entry.count >= MAX_FAILS) {
    return NextResponse.json({ error: "Çox sayda uğursuz cəhd. 15 dəqiqə sonra yenidən yoxlayın." }, { status: 429 });
  }

  const parsed = body.safeParse(await req.json().catch(() => null));
  const ok = parsed.success && (await checkCredentials(parsed.data.username.trim(), parsed.data.password));

  if (!ok) {
    const e = entry && now - entry.first < WINDOW_MS ? entry : { count: 0, first: now };
    e.count++;
    fails.set(ip, e);
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "İstifadəçi adı və ya şifrə yanlışdır" }, { status: 401 });
  }

  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(), sessionCookieOptions());
  return res;
}
