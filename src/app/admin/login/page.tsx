import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfigError, SESSION_COOKIE, verifySession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Giriş" };

type Props = { searchParams: Promise<{ next?: string }> };

function safeNext(n: string | undefined) {
  return n && /^\/admin(\/[a-z0-9\-/]*)?$/i.test(n) ? n : "/admin";
}

export default async function LoginPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  if (await verifySession((await cookies()).get(SESSION_COOKIE)?.value)) redirect(next);
  return (
    <main className="login">
      <div className="login__box">
        <div style={{ display: "grid", gap: 8 }}>
          <span className="eyebrow">İdarəetmə paneli</span>
          <h1>Daxil olun</h1>
        </div>
        {authConfigError() && (
          <p className="adm-alert adm-alert--error">
            Admin giriş konfiqurasiya edilməyib: {authConfigError()}. Vercel → Settings → Environment Variables.
          </p>
        )}
        <LoginForm next={next} />
      </div>
    </main>
  );
}
