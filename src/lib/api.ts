import "server-only";
import { cookies, headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { SESSION_COOKIE, verifySession } from "./auth";
import { formatZodError } from "./schemas";
import { CONTENT_TAG, StorageError } from "./storage";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Defense in depth: route handlers re-check the session even though Proxy already does. */
export async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySession(token))) throw new HttpError(401, "Giriş tələb olunur");
  const h = await headers();
  const origin = h.get("origin");
  // For mutating requests the Proxy enforces same-origin; double-check here when present.
  if (origin) {
    const host = h.get("x-forwarded-host") ?? h.get("host");
    try {
      if (new URL(origin).host !== host) throw new HttpError(403, "Forbidden");
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(403, "Forbidden");
    }
  }
}

export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "JSON yanlışdır");
  }
  return schema.parse(body);
}

export function revalidateContent() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

export function handle(fn: () => Promise<Response>): Promise<Response> {
  return fn().catch((e: unknown) => {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof ZodError) return NextResponse.json({ error: formatZodError(e) }, { status: 400 });
    if (e instanceof StorageError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[api] unexpected error", e);
    return NextResponse.json({ error: "Server xətası" }, { status: 500 });
  });
}

export const noStore = { headers: { "Cache-Control": "no-store" } };
